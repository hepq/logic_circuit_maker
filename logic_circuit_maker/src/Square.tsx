// Square.tsx
import React from "react";

interface SquareProps {
  color: string;
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({ color, onClick }) => {
  const squareStyle: React.CSSProperties = {
    width: "50px",
    height: "50px",
    backgroundColor: color,
    border: "1px solid #333",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  return <div style={squareStyle} onClick={onClick}></div>;
};

export default Square;
