import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuizState } from './QuizStateManager';

interface Cell {
  id: string;
  content: string;
  hint: string;
  type: 'text';
  isRevealed: boolean;
  backgroundColor: string;
  isCorrect?: boolean;
}

interface GridPuzzleProps {
  id: string;
  rows: number;
  columns: number;
  cells: Cell[];
  revealStyle: 'click' | 'hover';
  onChange: (updates: {
    rows?: number;
    columns?: number;
    cells?: Cell[];
    revealStyle?: 'click' | 'hover';
  }) => void;
  isPreviewMode?: boolean;
}

export default function GridPuzzle({
  id,
  rows,
  columns,
  cells: initialCells,
  revealStyle,
  onChange,
  isPreviewMode = false
}: GridPuzzleProps) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [draggedCell, setDraggedCell] = useState<string | null>(null);
  const [cells, setCells] = useState(initialCells);
  const { updateScore, updateProgress, setFeedback } = useQuizState();

  useEffect(() => {
    setCells(initialCells);
  }, [initialCells]);

  const handleCellClick = useCallback((cellId: string) => {
    if (!isPreviewMode) {
      setSelectedCell(cellId);
      return;
    }

    if (revealStyle === 'click') {
      const cell = cells.find(c => c.id === cellId);
      if (cell && !cell.isRevealed) {
        const newCells = cells.map(c =>
          c.id === cellId ? { ...c, isRevealed: true } : c
        );
        setCells(newCells);
        onChange({ cells: newCells });

        // Calculate score after revealing
        const totalCells = cells.length;
        const revealedCells = newCells.filter(c => c.isRevealed).length;
        const score = Math.round((revealedCells / totalCells) * 100);
        
        updateScore(id, score, 100);
        updateProgress(id, score === 100);
        
        if (score === 100) {
          setFeedback(id, true, 'Congratulations! You\'ve revealed all cells.');
        }
      }
    }
  }, [cells, isPreviewMode, revealStyle, onChange, id, updateScore, updateProgress, setFeedback]);

  const handleCellHover = useCallback((cellId: string) => {
    if (!isPreviewMode || revealStyle !== 'hover') return;

    const cell = cells.find(c => c.id === cellId);
    if (cell && !cell.isRevealed) {
      const newCells = cells.map(c =>
        c.id === cellId ? { ...c, isRevealed: true } : c
      );
      setCells(newCells);
      onChange({ cells: newCells });

      // Calculate score after revealing
      const totalCells = cells.length;
      const revealedCells = newCells.filter(c => c.isRevealed).length;
      const score = Math.round((revealedCells / totalCells) * 100);
      
      updateScore(id, score, 100);
      updateProgress(id, score === 100);
      
      if (score === 100) {
        setFeedback(id, true, 'Congratulations! You\'ve revealed all cells.');
      }
    }
  }, [cells, isPreviewMode, revealStyle, onChange, id, updateScore, updateProgress, setFeedback]);

  const handleCellUpdate = useCallback((cellId: string, updates: Partial<Cell>) => {
    if (isPreviewMode) return;
    
    const newCells = cells.map(cell =>
      cell.id === cellId ? { ...cell, ...updates } : cell
    );
    setCells(newCells);
    onChange({ cells: newCells });
  }, [cells, isPreviewMode, onChange]);

  const handleGridResize = useCallback((newRows: number, newColumns: number) => {
    if (isPreviewMode) return;

    const currentCells = [...cells];
    const newCells: Cell[] = [];

    for (let i = 0; i < newRows * newColumns; i++) {
      const existingCell = currentCells[i];
      if (existingCell) {
        newCells.push(existingCell);
      } else {
        newCells.push({
          id: `cell-${i}-${Date.now()}`,
          content: '',
          hint: '',
          type: 'text',
          isRevealed: false,
          backgroundColor: '#ffffff'
        });
      }
    }

    onChange({
      rows: newRows,
      columns: newColumns,
      cells: newCells.slice(0, newRows * newColumns)
    });
  }, [cells, isPreviewMode, onChange]);

  const handleDragStart = useCallback((cellId: string) => {
    if (isPreviewMode) return;
    setDraggedCell(cellId);
  }, [isPreviewMode]);

  const handleDrop = useCallback((targetCellId: string) => {
    if (!draggedCell || draggedCell === targetCellId || isPreviewMode) return;

    const newCells = [...cells];
    const draggedIndex = newCells.findIndex(cell => cell.id === draggedCell);
    const targetIndex = newCells.findIndex(cell => cell.id === targetCellId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const draggedCellObj = newCells[draggedIndex];
      if (draggedCellObj) {
        newCells.splice(draggedIndex, 1);
        newCells.splice(targetIndex, 0, draggedCellObj);
        setCells(newCells);
        onChange({ cells: newCells });
      }
    }

    setDraggedCell(null);
  }, [cells, draggedCell, isPreviewMode, onChange]);

  return (
    <div className="w-full space-y-4">
      {/* Grid Controls */}
      {!isPreviewMode && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={rows}
              onChange={(e) => handleGridResize(parseInt(e.target.value) || 1, columns)}
              className="w-20 px-3 py-2 border-2 border-gray-800 rounded-lg bg-white
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Columns:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={columns}
              onChange={(e) => handleGridResize(rows, parseInt(e.target.value) || 1)}
              className="w-20 px-3 py-2 border-2 border-gray-800 rounded-lg bg-white
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Reveal Style:</label>
            <select
              value={revealStyle}
              onChange={(e) => onChange({ revealStyle: e.target.value as 'click' | 'hover' })}
              className="px-3 py-2 border-2 border-gray-800 rounded-lg bg-white
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="click">Click to Reveal</option>
              <option value="hover">Hover to Reveal</option>
            </select>
          </div>
        </div>
      )}

      {/* Grid */}
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
        }}
      >
        {cells.map((cell) => (
          <motion.div
            key={cell.id}
            layoutId={cell.id}
            className={`aspect-square bg-white border-2 border-gray-800 rounded-lg p-4
                     relative cursor-pointer group transition-all duration-300
                     ${selectedCell === cell.id ? 'ring-2 ring-purple-500' : ''}
                     ${cell.isRevealed ? 'bg-purple-50' : ''}`}
            onClick={() => handleCellClick(cell.id)}
            onMouseEnter={() => handleCellHover(cell.id)}
            onDragStart={() => handleDragStart(cell.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(cell.id)}
            draggable={!isPreviewMode}
            style={{
              backgroundColor: cell.backgroundColor
            }}
          >
            {isPreviewMode ? (
              cell.isRevealed ? (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-center break-words">{cell.content}</p>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {cell.hint && (
                    <p className="text-center text-gray-500 text-sm">{cell.hint}</p>
                  )}
                </div>
              )
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={cell.content}
                  onChange={(e) => handleCellUpdate(cell.id, { content: e.target.value })}
                  placeholder="Content"
                  className="w-full px-2 py-1 border-2 border-gray-300 rounded
                           focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  value={cell.hint}
                  onChange={(e) => handleCellUpdate(cell.id, { hint: e.target.value })}
                  placeholder="Hint"
                  className="w-full px-2 py-1 border-2 border-gray-300 rounded
                           focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="color"
                  value={cell.backgroundColor}
                  onChange={(e) => handleCellUpdate(cell.id, { backgroundColor: e.target.value })}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
} 