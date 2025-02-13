import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Cell {
  id: string;
  content: string;
  hint: string;
  type: 'text';
  isRevealed: boolean;
  backgroundColor: string;
}

interface GridPuzzleProps {
  rows: number;
  columns: number;
  cells: Cell[];
  revealStyle: 'click' | 'hover';
  onChange: (updates: Partial<{ rows: number; columns: number; cells: Cell[]; revealStyle: 'click' | 'hover' }>) => void;
  isPreviewMode?: boolean;
}

export default function GridPuzzle({
  rows,
  columns,
  cells: initialCells,
  revealStyle,
  onChange,
  isPreviewMode = false
}: GridPuzzleProps) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [draggedCell, setDraggedCell] = useState<string | null>(null);
  const [showAllContent] = useState(false);

  // Ensure we have the correct number of cells
  const cells = useMemo(() => {
    const totalCells = rows * columns;
    const result: Cell[] = [];
    
    for (let i = 0; i < totalCells; i++) {
      if (i < initialCells.length) {
        // Reuse existing cell with explicit property assignment and null checks
        const existingCell = initialCells[i];
        if (existingCell) {
          result.push({
            id: existingCell.id,
            content: existingCell.content,
            hint: existingCell.hint,
            type: existingCell.type,
            isRevealed: existingCell.isRevealed,
            backgroundColor: existingCell.backgroundColor
          });
        } else {
          // Fallback for undefined cell
          const timestamp = Date.now();
          result.push({
            id: `cell-${i}-${timestamp}`,
            content: '',
            hint: '',
            type: 'text',
            isRevealed: false,
            backgroundColor: '#ffffff'
          });
        }
      } else {
        // Create new cell with guaranteed unique ID
        const timestamp = Date.now();
        result.push({
          id: `cell-${i}-${timestamp}`,
          content: '',
          hint: '',
          type: 'text',
          isRevealed: false,
          backgroundColor: '#ffffff'
        });
      }
    }

    return result;
  }, [rows, columns, initialCells]);

  // Update cells if the count doesn't match
  useEffect(() => {
    if (cells.length !== initialCells.length) {
      onChange({ cells });
    }
  }, [cells, initialCells.length, onChange]);

  const handleCellUpdate = useCallback((cellId: string, updates: Partial<Cell>) => {
    const newCells = cells.map(cell => 
      cell.id === cellId ? { ...cell, ...updates } as Cell : cell
    );
    onChange({ cells: newCells });
  }, [cells, onChange]);

  const handleGridResize = useCallback((newRows: number, newColumns: number) => {
    const totalCells = newRows * newColumns;
    const newCells: Cell[] = [];

    for (let i = 0; i < totalCells; i++) {
      const row = Math.floor(i / newColumns);
      const col = i % newColumns;
      const existingCell = cells[i];

      if (existingCell) {
        newCells.push({
          id: existingCell.id,
          content: existingCell.content,
          hint: existingCell.hint,
          type: existingCell.type,
          isRevealed: existingCell.isRevealed,
          backgroundColor: existingCell.backgroundColor
        });
      } else {
        newCells.push({
          id: `cell-${row}-${col}-${Date.now()}`,
          content: '',
          hint: '',
          type: 'text',
          isRevealed: false,
          backgroundColor: '#ffffff'
        });
      }
    }

    onChange({ rows: newRows, columns: newColumns, cells: newCells });
  }, [cells, onChange]);

  const handleDragStart = useCallback((cellId: string) => {
    setDraggedCell(cellId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((targetCellId: string) => {
    if (!draggedCell || draggedCell === targetCellId) return;

    const newCells = [...cells];
    const draggedIndex = newCells.findIndex(cell => cell.id === draggedCell);
    const targetIndex = newCells.findIndex(cell => cell.id === targetCellId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const draggedCellObj = newCells[draggedIndex];
      if (draggedCellObj) {
        newCells.splice(draggedIndex, 1);
        newCells.splice(targetIndex, 0, draggedCellObj);
        onChange({ cells: newCells });
      }
    }

    setDraggedCell(null);
  }, [cells, draggedCell, onChange]);

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
            draggable={!isPreviewMode}
            onDragStart={() => handleDragStart(cell.id)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(cell.id)}
            onClick={() => {
              if (isPreviewMode && revealStyle === 'click') {
                handleCellUpdate(cell.id, { isRevealed: true });
              } else if (!isPreviewMode) {
                setSelectedCell(cell.id);
              }
            }}
            onMouseEnter={() => {
              if (isPreviewMode && revealStyle === 'hover') {
                handleCellUpdate(cell.id, { isRevealed: true });
              }
            }}
            className={`aspect-square border-2 border-gray-800 rounded-lg p-2
                     ${!isPreviewMode ? 'cursor-pointer hover:shadow-lg' : ''}
                     ${selectedCell === cell.id ? 'ring-2 ring-purple-500' : ''}
                     ${draggedCell === cell.id ? 'opacity-50' : ''}`}
            style={{ backgroundColor: cell.backgroundColor ?? '#ffffff' }}
          >
            <div className="w-full h-full flex flex-col">
              {(!isPreviewMode || cell.isRevealed || showAllContent) && (
                <>
                  <textarea
                    value={cell.content}
                    onChange={(e) => handleCellUpdate(cell.id, { content: e.target.value })}
                    className="w-full flex-1 resize-none bg-transparent border-none 
                             focus:outline-none focus:ring-0 text-center"
                    placeholder="Enter content..."
                    readOnly={isPreviewMode}
                  />
                  {!isPreviewMode && (
                    <input
                      value={cell.hint}
                      onChange={(e) => handleCellUpdate(cell.id, { hint: e.target.value })}
                      className="w-full mt-1 text-sm text-gray-500 bg-transparent border-none 
                               focus:outline-none focus:ring-0 text-center"
                      placeholder="Enter hint..."
                    />
                  )}
                </>
              )}
              {isPreviewMode && !cell.isRevealed && !showAllContent && cell.hint && (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                  {cell.hint}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Cell Properties */}
      {!isPreviewMode && selectedCell && (
        <div className="mt-4 p-4 border-2 border-gray-800 rounded-lg space-y-4">
          <h3 className="text-lg font-bold">Cell Properties</h3>
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">Background Color</label>
            <input
              type="color"
              value={(cells.find(c => c.id === selectedCell)?.backgroundColor) ?? '#ffffff'}
              onChange={(e) => handleCellUpdate(selectedCell, { backgroundColor: e.target.value })}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
} 