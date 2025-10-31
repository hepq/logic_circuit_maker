// RadicalMenu.tsx
import React from "react";

// ElementTypeの型を再利用
import type { ElementType } from "./Square";

// ElementTypeから'white'を除外したものと、特別に'ERASE'を加えたものが選択肢の型となる
type MenuOption = Exclude<ElementType, "white"> | "ERASE";

interface RadicalMenuProps {
  position: { x: number; y: number };
  options: MenuOption[]; // MenuOption型を使用
  onSelect: (item: MenuOption) => void;
  onClose: () => void;
}

const optionDisplayMap: Record<MenuOption, string> = {
  POWER: "電源",
  NOT: "NOT",
  OR: "OR",
  AND: "AND",
  XOR: "XOR",
  WIRE_STRAIGHT: "直線",
  WIRE_CURVE: "曲線",
  ERASE: "消去",
};

const menuStyle: React.CSSProperties = {
  position: "fixed",
  zIndex: 1000,
};

const RadicalMenu: React.FC<RadicalMenuProps> = ({
  position,
  options,
  onSelect,
  onClose,
}) => {
  const numOptions = options.length;
  const radius = 90; // メニューを少し大きくする

  return (
    <div style={{ ...menuStyle, top: position.y, left: position.x }}>
      {/* メニュー外をクリックで閉じるオーバーレイ */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
        onClick={onClose}
      />

      {options.map((option, index) => {
        // 円周上の位置を計算
        // (index / numOptions) * 2 * Math.PI: 0から2πまでの均等な角度
        const angle = (index / numOptions) * 2 * Math.PI - Math.PI / 2; // -90度（上）から開始
        const top = radius * Math.sin(angle);
        const left = radius * Math.cos(angle);

        const itemStyle: React.CSSProperties = {
          position: "absolute",
          top: top + "px",
          left: left + "px",
          width: "60px", // 要素を少し大きくする
          height: "60px",
          borderRadius: "50%",
          backgroundColor: option === "ERASE" ? "#c0392b" : "#3498db",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
          transition: "transform 0.1s, background-color 0.1s",
          fontWeight: "bold",
          fontSize: "12px",
        };

        return (
          <div
            key={option}
            style={itemStyle}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(option);
            }}
          >
            {/* optionDisplayMapを使用して日本語名を表示 */}
            {optionDisplayMap[option]}
          </div>
        );
      })}
    </div>
  );
};

export default RadicalMenu;
