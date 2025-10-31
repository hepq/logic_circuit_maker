// Board.tsx
import React, { useState, useCallback, useEffect } from "react";
import Square from "./Square";
import type { ElementType } from "./Square";
import RadicalMenu from "./RadicalMenu";

const BOARD_SIZE = 5;
type MenuOption = Exclude<ElementType, "white"> | "ERASE";
type Grid3x3 = number[][]; // 3x3のサブグリッドの型
type Direction = [number, number]; // 上下左右の移動を表すタプルタイプ

const initialElements: ElementType[][] = Array(BOARD_SIZE)
  .fill(null)
  .map(() => Array(BOARD_SIZE).fill("white"));
const initialRotations: number[][] = Array(BOARD_SIZE)
  .fill(null)
  .map(() => Array(BOARD_SIZE).fill(0));
const initialPowered: boolean[][] = Array(BOARD_SIZE)
  .fill(null)
  .map(() => Array(BOARD_SIZE).fill(false));

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

// ⭐ 3x3 パターンの定義
// 1: 信号源 (POWER中心), 0: 経路, -1: 壁/遮断
const PATTERNS: Record<ElementType, Grid3x3> = {
  // 銅線と電源のみ実装
  POWER: [
    [-1, 0, -1],
    [0, 1, 0], // 1が信号源
    [-1, 0, -1],
  ],
  WIRE_STRAIGHT: [
    [-1, 0, -1],
    [-1, 0, -1], // 水平線
    [-1, 0, -1],
  ],
  WIRE_CURVE: [
    [-1, 0, -1], // 上と右に接続 (右上カーブを表現)
    [-1, 0, 0],
    [-1, -1, -1],
  ],

  // 他の全ての素子と空セルは壁で表現
  white: [
    [-1, -1, -1],
    [-1, -1, -1],
    [-1, -1, -1],
  ],
  NOT: [
    [-1, -1, -1],
    [-1, -1, -1],
    [-1, -1, -1],
  ],
  AND: [
    [-1, -1, -1],
    [-1, -1, -1],
    [-1, -1, -1],
  ],
  OR: [
    [-1, -1, -1],
    [-1, -1, -1],
    [-1, -1, -1],
  ],
  XOR: [
    [-1, -1, -1],
    [-1, -1, -1],
    [-1, -1, -1],
  ],
};

// ⭐ 3x3 グリッドを90度時計回りに回転させる関数
const rotate3x3 = (grid: Grid3x3): Grid3x3 => {
  const newGrid: Grid3x3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      // (r, c) -> (c, 2 - r) が90度回転の変換
      newGrid[c][2 - r] = grid[r][c];
    }
  }
  return newGrid;
};

// ⭐ 3x3サブグリッドを回転角度に応じて適用する関数
const getRotatedPattern = (element: ElementType, rotation: number): Grid3x3 => {
  let pattern = PATTERNS[element];
  const rotationsCount = (((rotation % 360) + 360) % 360) / 90; // 0, 1, 2, 3

  for (let i = 0; i < rotationsCount; i++) {
    pattern = rotate3x3(pattern);
  }
  return pattern;
};

// ⭐ $3N \times 3N$ のシミュレーショングリッドを構築する関数
const buildSimulationGrid = (
  elements: ElementType[][],
  rotations: number[][]
): number[][] => {
  const N = BOARD_SIZE;
  const simGrid: number[][] = Array(N * 3)
    .fill(null)
    .map(() => Array(N * 3).fill(-1));

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const pattern = getRotatedPattern(elements[r][c], rotations[r][c]);

      // 対応する 3x3 領域にパターンをコピー
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          simGrid[r * 3 + i][c * 3 + j] = pattern[i][j];
        }
      }
    }
  }
  return simGrid;
};

const Board: React.FC = () => {
  const [elements, setElements] = useState<ElementType[][]>(initialElements);
  const [rotations, setRotations] = useState<number[][]>(initialRotations);
  const [isPowered, setIsPowered] = useState<boolean[][]>(initialPowered);

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

  // ⭐ BFS信号伝達シミュレーションロジック (3x3 グリッドベース)
  const simulateSignalFlow = useCallback(() => {
    const simGrid = buildSimulationGrid(elements, rotations);
    const N3 = BOARD_SIZE * 3;
    const queue: [number, number][] = [];

    // 1. 起点の設定 (POWERの中心マス: 1)
    for (let r = 0; r < N3; r++) {
      for (let c = 0; c < N3; c++) {
        // 値が 1 のマスを起点としてキューに追加
        if (simGrid[r][c] === 1) {
          queue.push([r, c]);
          // 既に 1 なので、特に何も変更せず進む
        }
      }
    }

    // 2. BFSの実行
    let head = 0;
    const directions: Direction[] = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]; // 上下左右

    while (head < queue.length) {
      const [r, c] = queue[head++];

      directions.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;

        // 境界チェック
        if (nr >= 0 && nr < N3 && nc >= 0 && nc < N3) {
          // 隣接マスが '0'（経路だが信号なし）であれば信号伝達
          if (simGrid[nr][nc] === 0) {
            simGrid[nr][nc] = 1; // 信号をアクティブにする
            queue.push([nr, nc]);
          }
        }
      });
    }

    // 3. 可視化 State (isPowered) の更新
    const newPowered: boolean[][] = initialPowered.map((row) => [...row]);
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        // 各マスの中心の 3x3 グリッド位置 (3r+1, 3c+1) の値をチェック
        if (simGrid[r * 3 + 1][c * 3 + 1] === 1) {
          newPowered[r][c] = true;
        }
      }
    }

    setIsPowered(newPowered);
  }, [elements, rotations]);

  // ⭐ 盤面や回転が変更されたらシミュレーションを実行
  useEffect(() => {
    simulateSignalFlow();
  }, [elements, rotations, simulateSignalFlow]);

  // ... (handleCellClick, handleLongPress, handleMenuSelect, handleMenuClose は前回から維持、一部修正) ...

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const element = elements[row][col];
      // 電源や空セルでない場合のみ回転
      if (
        element !== "POWER" &&
        element !== "white" &&
        !PATTERNS[element].every((r) => r.every((v) => v === -1))
      ) {
        setRotations((prevRotations) => {
          const newRotations = prevRotations.map((rowArr) => [...rowArr]);
          newRotations[row][col] = (prevRotations[row][col] + 90) % 360;
          return newRotations;
        });
      }
    },
    [elements]
  );

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

  const handleMenuSelect = useCallback(
    (item: MenuOption) => {
      setElements((prevElements) => {
        const newElements = prevElements.map((rowArr) => [...rowArr]);
        const { rowIndex, colIndex } = menuState;
        if (rowIndex !== -1 && colIndex !== -1) {
          if (item === "ERASE") {
            newElements[rowIndex][colIndex] = "white";
            setRotations((prev) => {
              const newRotations = prev.map((rowArr) => [...rowArr]);
              newRotations[rowIndex][colIndex] = 0;
              return newRotations;
            });
          } else {
            // 新しい素子を配置する場合、回転角度をリセット
            newElements[rowIndex][colIndex] = item as ElementType;
            setRotations((prev) => {
              const newRotations = prev.map((rowArr) => [...rowArr]);
              newRotations[rowIndex][colIndex] = 0;
              return newRotations;
            });
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
              rotation={rotations[rowIndex][colIndex]}
              isPowered={isPowered[rowIndex][colIndex]}
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
