import React, { useRef } from "react";

export type ElementType =
  | "white"
  | "POWER"
  | "NOT"
  | "OR"
  | "AND"
  | "XOR"
  | "WIRE_STRAIGHT"
  | "WIRE_CURVE";

interface SquareProps {
  element: ElementType;
  // ⭐ 新規追加: 回転角度 (度)
  rotation: number;
  onClick: () => void;
  onLongPress: (screenX: number, screenY: number) => void;
  isLongPressing: boolean;
}

// 画像パスの定義 (変更なし)
const ASSET_PATHS: Record<ElementType, string> = {
  POWER: "assets/power.png",
  WIRE_STRAIGHT: "assets/wire_straight.png",
  WIRE_CURVE: "assets/wire_curve.png",
  white: "",
  NOT: "",
  OR: "",
  AND: "",
  XOR: "",
};

const Square: React.FC<SquareProps> = ({
  element,
  rotation,
  onClick,
  onLongPress,
  isLongPressing,
}) => {
  const squareRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const LONG_PRESS_THRESHOLD = 500;

  const imagePath = ASSET_PATHS[element];
  const useImage = !!imagePath;

  // ... (背景色と表示テキストの決定ロジックは変更なし) ...
  let bgColor = "#fff";
  let displayText = "";

  if (useImage) {
    bgColor = "transparent";
    displayText = "";
  } else {
    switch (element) {
      case "NOT":
        bgColor = "#3498db";
        displayText = "NOT";
        break;
      case "OR":
        bgColor = "#e67e22";
        displayText = "OR";
        break;
      case "AND":
        bgColor = "#f1c40f";
        displayText = "AND";
        break;
      case "XOR":
        bgColor = "#9b59b6";
        displayText = "XOR";
        break;
      case "POWER":
        bgColor = "#2ecc71";
        displayText = "PWR";
        break; // 電源も画像がない場合は色を表示
      case "white":
      default:
        bgColor = "#fff";
        displayText = "";
        break;
    }
  }

  const squareStyle: React.CSSProperties = {
    width: "50px",
    height: "50px",
    backgroundColor: bgColor,
    border: "1px solid #333",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: isLongPressing ? "0 0 10px 5px #f1c40f inset" : "none",
    transition: "box-shadow 0.1s, transform 0.2s ease-out", // transformにトランジションを追加
    fontWeight: "bold",
    fontSize: "12px",
    color: useImage
      ? "transparent"
      : element.includes("WIRE")
      ? "#333"
      : "white",
    textShadow: element.includes("WIRE") ? "0 0 1px #333" : "none",

    backgroundImage: useImage ? `url(${imagePath})` : "none",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",

    // ⭐ 回転を適用
    transform: `rotate(${rotation}deg)`,
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStart = (clientX: number, clientY: number) => {
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      if (squareRef.current) {
        const rect = squareRef.current.getBoundingClientRect();
        onLongPress(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    }, LONG_PRESS_THRESHOLD);
  };

  const handleEnd = () => {
    if (timerRef.current) {
      onClick();
    }
    clearTimer();
  };

  const onMouseDown = (e: React.MouseEvent) =>
    handleStart(e.clientX, e.clientY);
  const onMouseUp = () => handleEnd();
  const onMouseLeave = () => clearTimer();

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };
  const onTouchEnd = () => handleEnd();

  return (
    <div
      ref={squareRef}
      style={squareStyle}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {displayText}
    </div>
  );
};

export default Square;
