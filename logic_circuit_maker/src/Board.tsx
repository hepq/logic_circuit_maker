// Board.tsx
import React, { useState, useCallback } from "react";
import Square from "./Square";

// 盤面のサイズを定義 (N x N)
const BOARD_SIZE = 5;

// セルの色の型
type Color = "white" | "blue";

// 初期状態の盤面（全て 'white'）
const initialBoard: Color[][] = Array(BOARD_SIZE)
  .fill(null)
  .map(() => Array(BOARD_SIZE).fill("white"));

const Board: React.FC = () => {
  // 盤面全体の色を保持する State
  const [colors, setColors] = useState<Color[][]>(initialBoard);

  // クリック時のハンドラ
  const handleClick = useCallback(
    (row: number, col: number) => {
      setColors((prevColors) => {
        // 新しい盤面配列をディープコピーして作成
        const newColors = prevColors.map((rowArr) => [...rowArr]);

        // 色を切り替える
        newColors[row][col] =
          newColors[row][col] === "white" ? "blue" : "white";

        return newColors;
      });
    },
    [] // 依存配列は空でOK
  );

  const boardStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${BOARD_SIZE}, 50px)`, // N個の50px幅の列
    gridTemplateRows: `repeat(${BOARD_SIZE}, 50px)`, // N個の50px高の行
    border: "2px solid #000",
    margin: "20px",
  };

  return (
    <div style={boardStyle}>
      {colors.map((rowArr, rowIndex) =>
        rowArr.map((color, colIndex) => (
          <Square
            key={`${rowIndex}-${colIndex}`}
            color={color}
            onClick={() => handleClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};

export default Board;
