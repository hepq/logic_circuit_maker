// App.tsx
import React from "react";
import Board from "./Board";
import "./App.css"; // 必要に応じてCSSをインポート

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>クリックで色が変わる正方形の盤面</h1>
      <Board />
    </div>
  );
};

export default App;
