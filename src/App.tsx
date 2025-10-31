// App.tsx
import React from "react";
import Board from "./Board";
import "./App.css"; // 必要に応じてCSSをインポート

const App: React.FC = () => {
  return (
    <div className="App">
      <span>論理回路エディター</span>
      <Board />
    </div>
  );
};

export default App;
