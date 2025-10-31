// Board.tsx (更新)
import React, { useState, useCallback } from "react";
import Square from "./Square";
import type { ElementType } from "./Square";
import RadicalMenu from "./RadicalMenu";

const BOARD_SIZE = 5;

type MenuOption = Exclude<ElementType, "white"> | "ERASE";

// 初期状態の盤面（全て 'white'）
const initialElements: ElementType[][] = Array(BOARD_SIZE)
  .fill(null)
  .map(() => Array(BOARD_SIZE).fill("white"));

// ⭐ 新規追加: 初期状態の回転角度（全て 0度）
const initialRotations: number[][] = Array(BOARD_SIZE)
  .fill(null)
  .map(() => Array(BOARD_SIZE).fill(0));

const MENU_OPTIONS: MenuOption[] = [
  "POWER",
  "NOT",
  "OR",
  "AND",
  "XOR",
  "WIRE_STRAIGHT",
  "WIRE_CURVE",
  "ERASE",
];

const Board: React.FC = () => {
  const [elements, setElements] = useState<ElementType[][]>(initialElements);
  // ⭐ 新規追加: 回転角度の状態
  const [rotations, setRotations] = useState<number[][]>(initialRotations);

  const [menuState, setMenuState] = useState<{
    isVisible: boolean;
    position: { x: number; y: number };
    rowIndex: number;
    colIndex: number;
  }>({
    isVisible: false,
    position: { x: 0, y: 0 },
    rowIndex: -1,
    colIndex: -1,
  });

  // ⭐ 通常クリックハンドラ (回転ロジックを実装)
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const element = elements[row][col];

      // 電源 ('POWER') でない、かつ空セル ('white') でない場合のみ回転させる
      if (element !== "POWER" && element !== "white") {
        setRotations((prevRotations) => {
          const newRotations = prevRotations.map((rowArr) => [...rowArr]);
          // 現在の角度に 90度 を足し、360度で割った余り (0, 90, 180, 270) を格納
          newRotations[row][col] = prevRotations[row][col] + 90;
          return newRotations;
        });
      }
    },
    [elements] // elements配列を参照するため依存配列に含める
  );

  // 長押しハンドラ (変更なし)
  const handleLongPress = useCallback(
    (row: number, col: number, screenX: number, screenY: number) => {
      setMenuState({
        isVisible: true,
        position: { x: screenX, y: screenY },
        rowIndex: row,
        colIndex: col,
      });
    },
    []
  );

  // ラディカルメニューでの選択ハンドラ (変更なし)
  const handleMenuSelect = useCallback(
    (item: MenuOption) => {
      setElements((prevElements) => {
        const newElements = prevElements.map((rowArr) => [...rowArr]);
        const { rowIndex, colIndex } = menuState;
        if (rowIndex !== -1 && colIndex !== -1) {
          if (item === "ERASE") {
            newElements[rowIndex][colIndex] = "white";
            // ⭐ 消去時に回転角度もリセット
            setRotations((prev) => {
              const newRotations = prev.map((rowArr) => [...rowArr]);
              newRotations[rowIndex][colIndex] = 0;
              return newRotations;
            });
          } else {
            newElements[rowIndex][colIndex] = item as ElementType;
          }
        }
        return newElements;
      });
      setMenuState((prev) => ({ ...prev, isVisible: false }));
    },
    [menuState]
  );

  const handleMenuClose = useCallback(() => {
    setMenuState((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const boardStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${BOARD_SIZE}, 50px)`,
    gridTemplateRows: `repeat(${BOARD_SIZE}, 50px)`,
    border: "2px solid #000",
    margin: "20px auto",
  };

  return (
    <div>
      <div style={boardStyle}>
        {elements.map((rowArr, rowIndex) =>
          rowArr.map((element, colIndex) => (
            <Square
              key={`${rowIndex}-${colIndex}`}
              element={element}
              // ⭐ 回転角度を渡す
              rotation={rotations[rowIndex][colIndex]}
              // ⭐ クリックハンドラを更新し、row/colを渡す
              onClick={() => handleCellClick(rowIndex, colIndex)}
              onLongPress={(screenX, screenY) =>
                handleLongPress(rowIndex, colIndex, screenX, screenY)
              }
              isLongPressing={
                menuState.isVisible &&
                menuState.rowIndex === rowIndex &&
                menuState.colIndex === colIndex
              }
            />
          ))
        )}
      </div>

      {menuState.isVisible && (
        <RadicalMenu
          position={menuState.position}
          options={MENU_OPTIONS}
          onSelect={handleMenuSelect}
          onClose={handleMenuClose}
        />
      )}
    </div>
  );
};

export default Board;
