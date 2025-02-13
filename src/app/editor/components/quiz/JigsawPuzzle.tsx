import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Settings, Shuffle, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import type { JigsawPuzzleProps, PuzzlePiece } from '../../types';

export default function JigsawPuzzle({
  imageUrl,
  rows,
  columns,
  difficulty,
  allowRotation,
  showPreview,
  pieces,
  onChange,
  isPreviewMode = false
}: JigsawPuzzleProps) {
  const [piecesState, setPieces] = useState<PuzzlePiece[]>(pieces);
  const [isDragging, setIsDragging] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Type-safe Fisher-Yates shuffle
  const shufflePuzzlePieces = useCallback((inputPieces: PuzzlePiece[]): PuzzlePiece[] => {
    const shuffled = [...inputPieces];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }
    return shuffled;
  }, []);

  const handlePieceDrop = useCallback((pieceId: string, x: number, y: number) => {
    const updatedPieces = piecesState.map(p => 
      p.id === pieceId ? { ...p, x, y, isPlaced: false } : p
    );
    setPieces(updatedPieces);
    onChange({ pieces: updatedPieces });
  }, [piecesState, onChange]);

  const handlePieceRotate = useCallback((pieceId: string) => {
    if (!allowRotation) return;
    setPieces(prevPieces => {
      const newPieces = prevPieces.map(piece =>
        piece.id === pieceId 
          ? { ...piece, rotation: (piece.rotation + 90) % 360, isPlaced: false } 
          : piece
      );
      onChange({ pieces: newPieces });
      return newPieces;
    });
  }, [onChange, allowRotation]);

  const shufflePieces = useCallback(() => {
    const shuffled = shufflePuzzlePieces(piecesState);
    const updatedPieces = shuffled.map(piece => ({
      ...piece,
      isCorrect: piece.currentIndex === piece.originalIndex && piece.rotation === 0,
      isPlaced: false
    }));
    setPieces(updatedPieces);
    onChange({ pieces: updatedPieces });
  }, [piecesState, shufflePuzzlePieces, onChange]);

  const resetPuzzle = useCallback(() => {
    const newPieces = piecesState.map(piece => ({
      ...piece,
      currentIndex: piece.originalIndex,
      rotation: 0,
      isCorrect: true,
      isPlaced: true
    }));
    setPieces(newPieces);
    onChange({ pieces: newPieces });
  }, [piecesState, onChange]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result as string;
      onChange({ imageUrl });
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  // Initialize puzzle
  useEffect(() => {
    if (imageUrl && canvasRef.current) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const pieceWidth = img.width / columns;
        const pieceHeight = img.height / rows;
        const newPieces: PuzzlePiece[] = [];
        let index = 0;
        
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < columns; x++) {
            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = pieceWidth;
            pieceCanvas.height = pieceHeight;
            const pieceCtx = pieceCanvas.getContext('2d');
            
            if (pieceCtx) {
              pieceCtx.drawImage(
                img,
                x * pieceWidth,
                y * pieceHeight,
                pieceWidth,
                pieceHeight,
                0,
                0,
                pieceWidth,
                pieceHeight
              );
              
              newPieces.push({
                id: `piece-${index}`,
                imageUrl: pieceCanvas.toDataURL(),
                originalIndex: index,
                currentIndex: index,
                isCorrect: true,
                isPlaced: true,
                rotation: 0,
                x: x * pieceWidth,
                y: y * pieceHeight
              });
              
              index++;
            }
          }
        }
        
        const shuffledPieces = shufflePuzzlePieces(newPieces);
        setPieces(shuffledPieces);
        onChange({ pieces: shuffledPieces });
      };
    }
  }, [imageUrl, rows, columns, onChange, shufflePuzzlePieces]);

  const handlePieceDragStart = useCallback((_pieceId: string) => {
    if (isPreviewMode) return;
    setIsDragging(true);
  }, [isPreviewMode]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Controls */}
      {!isPreviewMode && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={shufflePieces}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
            >
              <Shuffle className="w-5 h-5" />
            </button>
            <button
              onClick={resetPuzzle}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => onChange({ showPreview: !showPreview })}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-800 
                     rounded-lg hover:bg-gray-100 transition-colors duration-300"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && !isPreviewMode && (
        <div className="mb-4 p-4 bg-white/90 backdrop-blur-sm border-2 border-gray-800 rounded-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grid Size
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rows}
                    onChange={(e) => onChange({ rows: Math.max(2, Math.min(10, parseInt(e.target.value))) })}
                    className="w-20 px-3 py-2 border-2 border-gray-800 rounded-lg bg-white
                           focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="2"
                    max="10"
                  />
                  <span>×</span>
                  <input
                    type="number"
                    value={columns}
                    onChange={(e) => onChange({ columns: Math.max(2, Math.min(10, parseInt(e.target.value))) })}
                    className="w-20 px-3 py-2 border-2 border-gray-800 rounded-lg bg-white
                           focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="2"
                    max="10"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => onChange({ difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg bg-white
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allowRotation}
                onChange={(e) => onChange({ allowRotation: e.target.checked })}
                className="rounded border-gray-800 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Allow Piece Rotation</span>
            </label>
          </div>
        </div>
      )}

      {/* Preview Image */}
      {showPreview && (
        <div className="mb-4 relative aspect-video">
          <Image
            src={imageUrl}
            alt="Puzzle Preview"
            width={800}
            height={600}
            className="w-full h-full object-contain"
            unoptimized
          />
        </div>
      )}

      {/* Puzzle Grid */}
      <div
        className="flex-1 grid gap-1 bg-white/90 backdrop-blur-sm border-2 border-gray-800 rounded-lg p-4"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {piecesState.map((piece) => (
          <motion.div
            key={piece.id}
            layoutId={piece.id}
            className={`relative aspect-square border-2 ${
              isDragging ? 'border-dashed' : 'border-solid'
            } border-gray-800 rounded-lg overflow-hidden
            ${piece.isCorrect ? 'ring-2 ring-green-500' : ''}`}
            draggable={!isPreviewMode}
            onDragStart={() => handlePieceDragStart(piece.id)}
            onDragEnd={() => setIsDragging(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handlePieceDrop(piece.id, e.clientX, e.clientY);
            }}
            onClick={() => handlePieceRotate(piece.id)}
            style={{
              gridArea: `${Math.floor(piece.currentIndex / columns) + 1} / ${
                (piece.currentIndex % columns) + 1
              }`,
              cursor: isPreviewMode ? 'default' : 'move'
            }}
          >
            <motion.div 
              className="relative w-full h-full"
              style={{ transform: `rotate(${piece.rotation}deg)` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Image
                src={piece.imageUrl}
                alt=""
                width={100}
                height={100}
                className="w-full h-full object-cover"
                unoptimized
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Image Upload */}
      {!imageUrl && !isPreviewMode && (
        <label className="absolute inset-0 flex flex-col items-center justify-center
                       cursor-pointer hover:bg-gray-50/50 transition-colors">
          <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
          <span className="text-gray-600">Click to upload image</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      )}

      {/* Hidden Canvas for Image Processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
} 