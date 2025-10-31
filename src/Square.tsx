// Square.tsx
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
  rotation: number;
  //電源がONかどうか
  isOn: boolean;
  // ⭐ 新規追加: 信号が流れているか
  isPowered: boolean;
  onClick: () => void;
  onLongPress: (screenX: number, screenY: number) => void;
  isLongPressing: boolean;
}

// 画像パスの定義。アクティブ状態のパスを追加
const ASSET_PATHS: Record<
  ElementType,
  { normal: string; active: string; on?: string; off?: string }
> = {
  POWER: {
    normal: "assets/power.png",
    active: "assets/power.png",
    on: "assets/power_on.png", // オン状態の画像
    off: "assets/power_off.png", // オフ状態の画像
  }, // 電源はアクティブ固定
  WIRE_STRAIGHT: {
    normal: "assets/wire_straight.png",
    active: "assets/wire_straight_active.png",
  },
  WIRE_CURVE: {
    normal: "assets/wire_curve.png",
    active: "assets/wire_curve_active.png",
  },
  // 画像を使わない素子はダミー
  white: { normal: "", active: "" },
  NOT: { normal: "assets/not.png", active: "assets/not_active.png" },
  OR: { normal: "assets/or.png", active: "assets/or_active.png" },
  AND: { normal: "assets/and.png", active: "assets/and_active.png" },
  XOR: { normal: "assets/xor.png", active: "assets/xor_active.png" },
};

const Square: React.FC<SquareProps> = ({
  element,
  rotation,
  isPowered,
  isOn,
  onClick,
  onLongPress,
  isLongPressing,
}) => {
  const squareRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const LONG_PRESS_THRESHOLD = 500;

  // 1. 画像パスを決定
  const assetData = ASSET_PATHS[element];
  const useImage = !!assetData.normal;

  let imagePath = "";
  if (useImage) {
    if (element === "POWER") {
      // ⭐ POWERの場合、isOnの状態に応じて画像を選択
      imagePath = isOn ? assetData.on! : assetData.off!;
    } else if (
      (element.startsWith("WIRE") ||
        element === "OR" ||
        element === "AND" ||
        element === "NOT" ||
        element === "XOR") &&
      isPowered
    ) {
      imagePath = assetData.active;
    } else {
      imagePath = assetData.normal;
    }
  }

  // 2. 素子に応じたスタイルと表示テキストを決定 (変更なし)
  // ... (bgColorとdisplayTextの決定ロジックは前回から維持) ...
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
        break;
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
    transition: "box-shadow 0.1s, transform 0.2s ease-out",
    fontWeight: "bold",
    fontSize: "12px",
    color: useImage
      ? "transparent"
      : element.includes("WIRE")
      ? "#333"
      : "white",
    textShadow: element.includes("WIRE") ? "0 0 1px #333" : "none",

    // ⭐ 画像パスが動的に決定される
    backgroundImage: imagePath ? `url(${imagePath})` : "none",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",

    transform: `rotate(${rotation}deg)`,
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStart = (_clientX: number, _clientY: number) => {
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
