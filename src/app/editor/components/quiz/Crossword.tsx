import { useState, useCallback, useMemo, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, X, Check } from 'lucide-react';
import { useQuizState } from './QuizStateManager';

interface CrosswordCell {
  id: string;
  letter: string;
  number?: number;
  isBlocked: boolean;
  row: number;
  col: number;
  acrossClueNumber?: number;
  downClueNumber?: number;
  isHighlighted?: boolean;
  isCorrect?: boolean;
  isRevealed?: boolean;
}

interface CrosswordClue {
  id: string;
  number: number;
  direction: 'across' | 'down';
  text: string;
  answer: string;
  startCell: { row: number; col: number };
  isValidated?: boolean;
  isCorrect?: boolean;
}

interface CrosswordProps {
  id: string;
  cells: CrosswordCell[];
  clues: CrosswordClue[];
  onChange: (updates: {
    cells?: CrosswordCell[];
    clues?: CrosswordClue[];
  }) => void;
  isPreviewMode?: boolean;
}

export default function Crossword({
  id,
  cells,
  clues,
  onChange,
  isPreviewMode = false
}: CrosswordProps) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [selectedClue, setSelectedClue] = useState<string | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [showAnswers, setShowAnswers] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const { updateScore, updateProgress, setFeedback, state } = useQuizState();

  // Calculate grid dimensions
  const gridDimensions = useCallback(() => {
    let minRow = 0, maxRow = 0, minCol = 0, maxCol = 0;
    cells.forEach(cell => {
      minRow = Math.min(minRow, cell.row);
      maxRow = Math.max(maxRow, cell.row);
      minCol = Math.min(minCol, cell.col);
      maxCol = Math.max(maxCol, cell.col);
    });
    return {
      minRow,
      maxRow,
      minCol,
      maxCol,
      rows: maxRow - minRow + 1,
      cols: maxCol - minCol + 1
    };
  }, [cells]);

  const getCellByPosition = useCallback((row: number, col: number) => {
    return cells.find(cell => cell.row === row && cell.col === col);
  }, [cells]);

  // Automatic cell numbering
  const updateCellNumbers = useCallback((cellsToUpdate: CrosswordCell[]) => {
    let number = 1;
    const newCells = [...cellsToUpdate];

    newCells.forEach(cell => {
      if (cell.isBlocked) {
        cell.number = undefined;
        return;
      }

      const leftCell = getCellByPosition(cell.row, cell.col - 1);
      const aboveCell = getCellByPosition(cell.row - 1, cell.col);
      const rightCell = getCellByPosition(cell.row, cell.col + 1);
      const belowCell = getCellByPosition(cell.row + 1, cell.col);

      const needsNumber = (
        // Start of across word
        ((leftCell?.isBlocked ?? true) && rightCell?.isBlocked === false) ??
        // Start of down word
        ((aboveCell?.isBlocked ?? true) && belowCell?.isBlocked === false)
      );

      if (needsNumber) {
        cell.number = number++;
      } else {
        cell.number = undefined;
      }
    });

    onChange({ cells: newCells });
  }, [onChange, getCellByPosition]);

  const handleAddCell = useCallback((cellId: string, direction: 'up' | 'down' | 'left' | 'right') => {
    const sourceCell = cells.find(cell => cell.id === cellId);
    if (!sourceCell) return;

    let newRow = sourceCell.row;
    let newCol = sourceCell.col;

    switch (direction) {
      case 'up': newRow--; break;
      case 'down': newRow++; break;
      case 'left': newCol--; break;
      case 'right': newCol++; break;
    }

    // Check if cell already exists at the new position
    if (getCellByPosition(newRow, newCol)) return;

    const newCell: CrosswordCell = {
      id: `cell-${newRow}-${newCol}-${Date.now()}`,
      letter: '',
      isBlocked: false,
      row: newRow,
      col: newCol
    };

    const newCells = [...cells, newCell];
    onChange({ cells: newCells });
    updateCellNumbers(newCells);
  }, [cells, onChange, getCellByPosition, updateCellNumbers]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>, cellId: string) => {
    const currentCell = cells.find(cell => cell.id === cellId);
    if (!currentCell) return;

    let nextRow = currentCell.row;
    let nextCol = currentCell.col;

    switch (e.key) {
      case 'ArrowRight':
        nextCol = currentCell.col + 1;
        break;
      case 'ArrowLeft':
        nextCol = currentCell.col - 1;
        break;
      case 'ArrowUp':
        nextRow = currentCell.row - 1;
        break;
      case 'ArrowDown':
        nextRow = currentCell.row + 1;
        break;
      case 'Tab':
        e.preventDefault();
        const currentClue = clues.find(clue => 
          (clue.direction === direction && 
           clue.startCell.row === currentCell.row && 
           clue.startCell.col === currentCell.col)
        );
        if (currentClue) {
          const nextClueIndex = clues.indexOf(currentClue) + (e.shiftKey ? -1 : 1);
          if (nextClueIndex >= 0 && nextClueIndex < clues.length) {
            const nextClue = clues[nextClueIndex];
            if (nextClue) {
              const nextCell = getCellByPosition(nextClue.startCell.row, nextClue.startCell.col);
              if (nextCell) {
                setSelectedCell(nextCell.id);
                setDirection(nextClue.direction);
                return;
              }
            }
          }
        }
        break;
      case 'Backspace':
        if (currentCell.letter === '') {
          if (direction === 'across') nextCol = currentCell.col - 1;
          else nextRow = currentCell.row - 1;
        }
        break;
      default:
        if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
          if (direction === 'across') nextCol = currentCell.col + 1;
          else nextRow = currentCell.row + 1;
        }
    }

    const nextCell = getCellByPosition(nextRow, nextCol);
    if (nextCell && !nextCell.isBlocked) {
      setSelectedCell(nextCell.id);
    }
  }, [cells, direction, clues, getCellByPosition]);

  // Handle cell update
  const handleCellUpdate = useCallback((cellId: string, updates: Partial<CrosswordCell>) => {
    const newCells = cells.map(cell =>
      cell.id === cellId ? { ...cell, ...updates } : cell
    );
    onChange({ cells: newCells });
    if (updates.isBlocked !== undefined) {
      updateCellNumbers(newCells);
    }
  }, [cells, onChange, updateCellNumbers]);

  // Handle clue update
  const handleClueUpdate = useCallback((clueId: string, updates: Partial<CrosswordClue>) => {
    const newClues = clues.map(clue =>
      clue.id === clueId ? { ...clue, ...updates } : clue
    );
    onChange({ clues: newClues });
  }, [clues, onChange]);

  // Add clue
  const addClue = useCallback((direction: 'across' | 'down') => {
    const newClue: CrosswordClue = {
      id: `clue-${Date.now()}`,
      number: clues.length + 1,
      direction,
      text: '',
      answer: '',
      startCell: { row: 0, col: 0 }
    };
    onChange({ clues: [...clues, newClue] });
  }, [clues, onChange]);

  // Remove clue
  const removeClue = useCallback((clueId: string) => {
    onChange({ clues: clues.filter(clue => clue.id !== clueId) });
  }, [clues, onChange]);

  const validateAnswers = useCallback(() => {
    let totalCells = 0;
    let correctCells = 0;
    const newCells = [...cells];
    const newClues = [...clues];

    clues.forEach(clue => {
      const { row, col } = clue.startCell;
      const answer = clue.answer.toUpperCase().split('');
      let clueCorrect = true;

      answer.forEach((letter, index) => {
        const currentRow = clue.direction === 'across' ? row : row + index;
        const currentCol = clue.direction === 'across' ? col + index : col;
        const cell = getCellByPosition(currentRow, currentCol);

        if (cell) {
          totalCells++;
          const cellIndex = cells.findIndex(c => c.id === cell.id);
          const isCorrect = cell.letter.toUpperCase() === letter;
          
          if (isCorrect) {
            correctCells++;
          } else {
            clueCorrect = false;
          }

          newCells[cellIndex] = { 
            ...cell, 
            isCorrect: isCorrect 
          };
        }
      });

      const clueIndex = newClues.findIndex(c => c.id === clue.id);
      newClues[clueIndex] = { 
        ...clue, 
        isValidated: true,
        isCorrect: clueCorrect
      };
    });

    const score = Math.round((correctCells / totalCells) * 100);
    const message = `You got ${correctCells} out of ${totalCells} letters correct.`;

    updateScore(id, score, 100);
    updateProgress(id, score === 100);
    setFeedback(id, score === 100, message);

    onChange({ cells: newCells, clues: newClues });
  }, [cells, clues, getCellByPosition, onChange, id, updateScore, updateProgress, setFeedback]);

  // Render grid
  const dimensions = gridDimensions();
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${dimensions.cols}, 40px)`,
    gap: '1px',
    background: '#e5e7eb',
    padding: '1px',
    borderRadius: '0.5rem',
    position: 'relative' as const,
    width: 'fit-content'
  };

  return (
    <div className="space-y-6">
      {isPreviewMode && (
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setShowHints(!showHints)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2
                       transition-colors duration-300
                       ${showHints 
                         ? 'bg-purple-600 text-white' 
                         : 'border-2 border-gray-800 hover:bg-gray-100'}`}
            >
              {showHints ? <EyeOff size={16} /> : <Eye size={16} />}
              {showHints ? 'Hide Hints' : 'Show Hints'}
            </button>
            <button
              onClick={() => validateAnswers()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg
                       hover:bg-purple-700 transition-colors duration-300"
            >
              Check Answers
            </button>
          </div>

          {state.feedback[id] && (
            <div className={`p-4 rounded-lg ${
              state.feedback[id].isCorrect ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              <p className={`text-sm ${
                state.feedback[id].isCorrect ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {state.feedback[id].message}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-6">
        {/* Crossword Grid */}
        <div className="relative">
          <div style={gridStyle} className="relative">
            {Array.from({ length: dimensions.rows }, (_, row) =>
              Array.from({ length: dimensions.cols }, (_, col) => {
                const cell = getCellByPosition(row + dimensions.minRow, col + dimensions.minCol);
                if (!cell) return <div key={`empty-${row}-${col}`} className="w-10 h-10" />;

                return (
                  <motion.div
                    key={cell.id}
                    layoutId={cell.id}
                    className={`w-10 h-10 bg-white relative group
                             ${selectedCell === cell.id ? 'ring-2 ring-purple-500' : ''}
                             ${cell.isBlocked ? 'bg-gray-800' : ''}
                             ${cell.isHighlighted ? 'bg-purple-100' : ''}
                             ${cell.isCorrect === false ? 'bg-red-100' : ''}
                             ${cell.isCorrect === true ? 'bg-green-100' : ''}`}
                    onClick={() => setSelectedCell(cell.id)}
                  >
                    {/* Cell Number */}
                    {cell.number && (
                      <span className="absolute top-0.5 left-0.5 text-[10px] font-medium">
                        {cell.number}
                      </span>
                    )}

                    {/* Cell Content */}
                    {!cell.isBlocked && (
                      <input
                        type="text"
                        value={cell.letter}
                        maxLength={1}
                        onChange={(e) => {
                          const letter = e.target.value.toUpperCase();
                          handleCellUpdate(cell.id, { letter });
                        }}
                        onKeyDown={(e) => handleKeyDown(e, cell.id)}
                        className="w-full h-full text-center text-base font-bold uppercase
                                 bg-transparent border-none focus:outline-none"
                        disabled={isPreviewMode && cell.isRevealed}
                      />
                    )}

                    {!isPreviewMode && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellUpdate(cell.id, { isBlocked: !cell.isBlocked });
                          }}
                          className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full
                                   border border-gray-800 opacity-0 group-hover:opacity-100
                                   transition-opacity duration-300 z-10"
                        >
                          {cell.isBlocked ? 
                            <X className="w-2 h-2" /> : 
                            <Check className="w-2 h-2" />
                          }
                        </button>
                      </>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Clues Panel */}
        <div className="flex-1 space-y-6">
          {/* Across Clues */}
          <div>
            <h3 className="text-lg font-bold mb-4">Across</h3>
            <div className="space-y-2">
              {clues
                .filter(clue => clue.direction === 'across')
                .map(clue => (
                  <div
                    key={clue.id}
                    className={`p-4 border-2 rounded-lg
                             ${selectedClue === clue.id ? 'ring-2 ring-purple-500' : ''}
                             ${clue.isValidated && clue.isCorrect ? 'border-green-500 bg-green-50' : ''}
                             ${clue.isValidated && !clue.isCorrect ? 'border-red-500 bg-red-50' : ''}
                             ${!clue.isValidated ? 'border-gray-800' : ''}`}
                    onClick={() => setSelectedClue(clue.id)}
                  >
                    <div className="flex items-start gap-4">
                      <span className="font-bold">{clue.number}.</span>
                      <div className="flex-1">
                        {isPreviewMode ? (
                          <p className="text-gray-900">{clue.text}</p>
                        ) : (
                          <input
                            type="text"
                            value={clue.text}
                            onChange={(e) => handleClueUpdate(clue.id, { text: e.target.value })}
                            placeholder="Enter clue..."
                            className="w-full px-0 border-none focus:outline-none focus:ring-0"
                          />
                        )}
                        {!isPreviewMode && (
                          <input
                            type="text"
                            value={clue.answer}
                            onChange={(e) => handleClueUpdate(clue.id, { 
                              answer: e.target.value.toUpperCase() 
                            })}
                            placeholder="Answer..."
                            className="w-full px-0 mt-2 text-sm text-gray-500 border-none 
                                     focus:outline-none focus:ring-0 uppercase"
                          />
                        )}
                        {isPreviewMode && showHints && (
                          <p className="mt-2 text-sm text-gray-500">
                            {clue.answer.length} letters
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Down Clues */}
          <div>
            <h3 className="text-lg font-bold mb-4">Down</h3>
            <div className="space-y-2">
              {clues
                .filter(clue => clue.direction === 'down')
                .map(clue => (
                  <div
                    key={clue.id}
                    className={`p-4 border-2 rounded-lg
                             ${selectedClue === clue.id ? 'ring-2 ring-purple-500' : ''}
                             ${clue.isValidated && clue.isCorrect ? 'border-green-500 bg-green-50' : ''}
                             ${clue.isValidated && !clue.isCorrect ? 'border-red-500 bg-red-50' : ''}
                             ${!clue.isValidated ? 'border-gray-800' : ''}`}
                    onClick={() => setSelectedClue(clue.id)}
                  >
                    <div className="flex items-start gap-4">
                      <span className="font-bold">{clue.number}.</span>
                      <div className="flex-1">
                        {isPreviewMode ? (
                          <p className="text-gray-900">{clue.text}</p>
                        ) : (
                          <input
                            type="text"
                            value={clue.text}
                            onChange={(e) => handleClueUpdate(clue.id, { text: e.target.value })}
                            placeholder="Enter clue..."
                            className="w-full px-0 border-none focus:outline-none focus:ring-0"
                          />
                        )}
                        {!isPreviewMode && (
                          <input
                            type="text"
                            value={clue.answer}
                            onChange={(e) => handleClueUpdate(clue.id, { 
                              answer: e.target.value.toUpperCase() 
                            })}
                            placeholder="Answer..."
                            className="w-full px-0 mt-2 text-sm text-gray-500 border-none 
                                     focus:outline-none focus:ring-0 uppercase"
                          />
                        )}
                        {isPreviewMode && showHints && (
                          <p className="mt-2 text-sm text-gray-500">
                            {clue.answer.length} letters
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 