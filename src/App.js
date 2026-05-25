import React, { useReducer } from "react";
import "./App.css";

const initialState = {
  board: Array(9).fill(null),
  xIsNext: true,
  winner: null,
  winningLine: null,
  isDraw: false,
  history: [],
  scores: { X: 0, O: 0, draws: 0 },
  playerNames: { X: "Player 1", O: "Player 2" }
};

function calculateWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }

  return null;
}

function gameReducer(state, action) {
  switch (action.type) {
    case "MAKE_MOVE": {
      const { index } = action;
      if (state.board[index] || state.winner || state.isDraw) return state;

      const newBoard = state.board.slice();
      newBoard[index] = state.xIsNext ? "X" : "O";

      const winnerObj = calculateWinner(newBoard);
      const winner = winnerObj ? winnerObj.winner : null;
      const winningLine = winnerObj ? winnerObj.line : null;
      const isDraw = !winner && newBoard.every(cell => cell);

      const newScores = { ...state.scores };
      if (winner) newScores[winner] += 1;
      if (isDraw) newScores.draws += 1;

      return {
        ...state,
        history: [
          {
            board: state.board,
            xIsNext: state.xIsNext,
            winner: state.winner,
            winningLine: state.winningLine,
            isDraw: state.isDraw
          },
          ...state.history
        ],
        board: newBoard,
        xIsNext: !state.xIsNext,
        winner,
        winningLine,
        isDraw,
        scores: newScores
      };
    }

    case "UNDO": {
      if (state.history.length === 0) return state;
      const [last, ...rest] = state.history;
      return {
        ...state,
        ...last,
        history: rest
      };
    }

    case "RESET":
      return {
        ...initialState,
        scores: { ...state.scores },
        playerNames: { ...state.playerNames }
      };

    case "SET_PLAYER_NAME": {
      const { player, name } = action;
      return {
        ...state,
        playerNames: {
          ...state.playerNames,
          [player]: name || (player === "X" ? "Player 1" : "Player 2")
        }
      };
    }

    default:
      return state;
  }
}

function Square({ value, onClick, isDisabled, className = "" }) {
  return (
    <button
      className={`square ${className}`.trim()}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={value ? `Cell filled with ${value}` : "Empty cell"}
    >
      {value}
    </button>
  );
}

function getLineCoords(line) {
  if (!line) return null;
  const pos = [
    [16.67, 16.67], [50, 16.67], [83.33, 16.67],
    [16.67, 50], [50, 50], [83.33, 50],
    [16.67, 83.33], [50, 83.33], [83.33, 83.33]
  ];
  const [a, , c] = line;
  return {
    x1: pos[a][0],
    y1: pos[a][1],
    x2: pos[c][0],
    y2: pos[c][1]
  };
}

function Board({ board, onSquareClick, isGameOver, winningLine }) {
  const lineCoords = getLineCoords(winningLine);
  return (
    <div className="board-wrapper">
      <div className="board">
        {board.map((value, idx) => (
          <Square
            key={idx}
            value={value}
            onClick={() => onSquareClick(idx)}
            isDisabled={isGameOver || !!value}
            className={winningLine?.includes(idx) ? "winning-square" : ""}
          />
        ))}
      </div>
      {lineCoords && (
        <svg className="win-line" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line
            x1={lineCoords.x1}
            y1={lineCoords.y1}
            x2={lineCoords.x2}
            y2={lineCoords.y2}
            stroke="#000000"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          <line
            x1={lineCoords.x1}
            y1={lineCoords.y1}
            x2={lineCoords.x2}
            y2={lineCoords.y2}
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { board, xIsNext, winner, winningLine, isDraw, history, scores, playerNames } = state;

  let status;
  if (winner) {
    status = `Winner: ${playerNames[winner]}`;
  } else if (isDraw) {
    status = "Draw!";
  } else {
    status = `Next Player: ${xIsNext ? playerNames.X : playerNames.O}`;
  }

  function handleSquareClick(idx) {
    dispatch({ type: "MAKE_MOVE", index: idx });
  }

  function handleReset() {
    dispatch({ type: "RESET" });
  }

  function handleUndo() {
    dispatch({ type: "UNDO" });
  }

  function handleNameChange(player, e) {
    dispatch({ type: "SET_PLAYER_NAME", player, name: e.target.value });
  }

  return (
    <div className="container">
      <h1>TicTacToe</h1>

      <div className="player-names">
        <label>
          Player 1:
          <input
            type="text"
            value={playerNames.X}
            onChange={e => handleNameChange("X", e)}
            maxLength={12}
            className="name-input"
            aria-label="Player 1 name"
          />
        </label>

        <label>
          Player 2:
          <input
            type="text"
            value={playerNames.O}
            onChange={e => handleNameChange("O", e)}
            maxLength={12}
            className="name-input"
            aria-label="Player 2 name"
          />
        </label>
      </div>

      <div className="status">{status}</div>

      <div className="scoreboard">
        <span>{playerNames.X}: {scores.X}</span>
        <span>{playerNames.O}: {scores.O}</span>
        <span>Draws: {scores.draws}</span>
      </div>

      <Board
        board={board}
        onSquareClick={handleSquareClick}
        isGameOver={!!winner || isDraw}
        winningLine={winningLine}
      />

      <div className="controls">
        <button className="reset-btn" onClick={handleReset}>
          Restart
        </button>
        <button className="undo-btn" onClick={handleUndo} disabled={history.length === 0}>
          Undo
        </button>
      </div>
    </div>
  );
}
