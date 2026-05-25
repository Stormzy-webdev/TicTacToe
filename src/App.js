import React, { useReducer } from "react";
import "./App.css";

// Initial state for the game, including move history, scores, and player names
const initialState = {
  board: Array(9).fill(null), // 3x3 board as a flat array
  xIsNext: true, // true = Player 1's turn, false = Player 2's turn
  winner: null, // 'X', 'O', or null
  isDraw: false, // true if draw
  history: [], // stores previous board states for undo
  scores: { X: 0, O: 0, draws: 0 }, // scoreboard
  playerNames: { X: "Player 1", O: "Player 2" } // player names
};

// Reducer function to manage game state
function gameReducer(state, action) {
  switch (action.type) {
    // Handle a player move
    case "MAKE_MOVE": {
      const { index } = action;
      if (state.board[index] || state.winner) return state;
      const newBoard = state.board.slice();
      newBoard[index] = state.xIsNext ? "X" : "O";
      const winner = calculateWinner(newBoard);
      const isDraw = !winner && newBoard.every(cell => cell);
      let newScores = { ...state.scores };
      // Update scores if game ends
      if (winner) newScores[winner] += 1;
      else if (isDraw) newScores.draws += 1;
      return {
        ...state,
        history: [
          {
            board: state.board,
            xIsNext: state.xIsNext,
            winner: state.winner,
            isDraw: state.isDraw
          },
          ...state.history
        ],
        board: newBoard,
        xIsNext: !state.xIsNext,
        winner,
        isDraw,
        scores: newScores
      };
    }
    // Undo the last move
    case "UNDO": {
      if (state.history.length === 0) return state;
      const [last, ...rest] = state.history;
      return {
        ...state,
        ...last,
        history: rest
      };
    }
    // Reset the game (but keep scores and names)
    case "RESET":
      return {
        ...initialState,
        scores: { ...state.scores },
        playerNames: { ...state.playerNames }
      };
    // Set player names
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

// Helper function to check for a winner
function calculateWinner(board) {
  // All possible winning combinations
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
  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

// Square component: represents a single cell
function Square({ value, onClick, isDisabled }) {
  return (
    <button
      className="square"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={value ? `Cell filled with ${value}` : "Empty cell"}
    >
      {value}
    </button>
  );
}

// Board component: renders the 3x3 grid
function Board({ board, onSquareClick, isGameOver }) {
  return (
    <div className="board">
      {/* Render 9 squares */}
      {board.map((value, idx) => (
        <Square
          key={idx}
          value={value}
          onClick={() => onSquareClick(idx)}
          isDisabled={!!value || isGameOver}
        />
      ))}
    </div>
  );
}

// Main App component
export default function App() {
  // useReducer for all game state
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { board, xIsNext, winner, isDraw, history, scores, playerNames } = state;

  // Status message logic
  let status;
  if (winner) {
    status = `Winner: ${playerNames[winner]}`;
  } else if (isDraw) {
    status = "Draw!";
  } else {
    status = `Next Player: ${xIsNext ? playerNames.X : playerNames.O}`;
  }

  // Handle square click
  function handleSquareClick(idx) {
    dispatch({ type: "MAKE_MOVE", index: idx });
  }

  // Handle reset
  function handleReset() {
    dispatch({ type: "RESET" });
  }

  // Handle undo
  function handleUndo() {
    dispatch({ type: "UNDO" });
  }

  // Handle player name change
  function handleNameChange(player, e) {
    dispatch({ type: "SET_PLAYER_NAME", player, name: e.target.value });
  }

  return (
    <div className="container">
      <h1>TicTacToe</h1>
      {/* Player name inputs */}
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
      {/* Status message */}
      <div className="status">{status}</div>
      {/* Scoreboard */}
      <div className="scoreboard">
        <span>{playerNames.X}: {scores.X}</span>
        <span>{playerNames.O}: {scores.O}</span>
        <span>Draws: {scores.draws}</span>
      </div>
      {/* Game board */}
      <Board board={board} onSquareClick={handleSquareClick} isGameOver={!!winner || isDraw} />
      {/* Controls */}
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
