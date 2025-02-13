import { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Rnd } from 'react-rnd';
import { Grid } from 'lucide-react';
import type { CanvasElement } from '../types';
import ElementContent from './ElementContent';
import 'react-resizable/css/styles.css';

interface EditorCanvasProps {
  elements: CanvasElement[];
  onElementsChange: (elements: CanvasElement[]) => void;
  selectedElement: string | null;
  onSelectedElementChange: (elementId: string | null) => void;
  gridSize?: number;
  showGrid?: boolean;
  isPreviewMode?: boolean;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  className?: string;
}

export default function EditorCanvas({
  elements,
  onElementsChange,
  selectedElement,
  onSelectedElementChange,
  gridSize = 20,
  showGrid = true,
  isPreviewMode = false,
  onDrop,
  onDragOver,
  className = ''
}: EditorCanvasProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Grid pattern for the background
  const GridPattern = () => (
    <div
      className="absolute inset-0 pointer-events-none opacity-10 transition-opacity duration-300"
      style={{
        backgroundImage: `
          linear-gradient(to right, gray 1px, transparent 1px),
          linear-gradient(to bottom, gray 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`
      }}
    />
  );

  // Snap offset to grid
  const snapToGrid = (value: number) => Math.round(value / gridSize) * gridSize;

  const handleCanvasClick = () => {
    onSelectedElementChange(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Canvas Container */}
      <div
        ref={canvasRef}
        className={`relative flex-1 min-h-0 bg-white/90 backdrop-blur-sm rounded-lg border-2 
                   border-gray-800 m-4 overflow-auto fancy-scrollbar hover:overflow-auto 
                   transition-all duration-300 ${className}`}
        onClick={handleCanvasClick}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDragOver?.(e);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDrop?.(e);
        }}
        style={{
          minWidth: '800px',
          maxHeight: 'calc(100vh - 12rem)'
        }}
      >
        {showGrid && <GridPattern />}

        <div className="relative w-full h-full min-h-[800px]">
          <AnimatePresence>
            {elements.map(element => (
              <Rnd
                key={element.id}
                size={{ width: element.width, height: element.height }}
                position={{ x: element.x, y: element.y }}
                grid={[gridSize, gridSize]}
                bounds="parent"
                disableDragging={isPreviewMode || isResizing}
                enableResizing={!isPreviewMode && !isResizing}
                onDragStart={() => {
                  if (!isPreviewMode && !isResizing) {
                    setIsDragging(true);
                    onSelectedElementChange(element.id);
                  }
                }}
                onDragStop={(e, d) => {
                  if (isPreviewMode || isResizing) return;
                  setIsDragging(false);
                  const newElements = elements.map(el => {
                    if (el.id === element.id) {
                      return {
                        ...el,
                        x: snapToGrid(d.x),
                        y: snapToGrid(d.y)
                      };
                    }
                    return el;
                  });
                  onElementsChange(newElements);
                }}
                onResizeStart={() => {
                  setIsResizing(true);
                  onSelectedElementChange(element.id);
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  setIsResizing(false);
                  const newWidth = snapToGrid(ref.offsetWidth);
                  const newHeight = snapToGrid(ref.offsetHeight);
                  const newX = snapToGrid(position.x);
                  const newY = snapToGrid(position.y);
                  const newElements = elements.map(el => {
                    if (el.id === element.id) {
                      return {
                        ...el,
                        width: newWidth,
                        height: newHeight,
                        x: newX,
                        y: newY
                      };
                    }
                    return el;
                  });
                  onElementsChange(newElements);
                }}
                resizeHandleStyles={{
                  topLeft: {
                    width: '12px',
                    height: '12px',
                    background: 'white',
                    border: '2px solid #a855f7',
                    borderRadius: '50%',
                    cursor: 'nw-resize',
                    zIndex: 30
                  },
                  topRight: {
                    width: '12px',
                    height: '12px',
                    background: 'white',
                    border: '2px solid #a855f7',
                    borderRadius: '50%',
                    cursor: 'ne-resize',
                    zIndex: 30
                  },
                  bottomLeft: {
                    width: '12px',
                    height: '12px',
                    background: 'white',
                    border: '2px solid #a855f7',
                    borderRadius: '50%',
                    cursor: 'sw-resize',
                    zIndex: 30
                  },
                  bottomRight: {
                    width: '12px',
                    height: '12px',
                    background: 'white',
                    border: '2px solid #a855f7',
                    borderRadius: '50%',
                    cursor: 'se-resize',
                    zIndex: 30
                  }
                }}
                resizeHandleWrapperClass="z-30"
                className={`${isDragging ? 'z-50' : 'z-20'} ${selectedElement === element.id ? 'z-40' : ''}`}
              >
                <div
                  className={`w-full h-full bg-white/90 backdrop-blur-sm border-2 border-gray-800 rounded-lg p-4 hover:shadow-lg transition-all duration-300 ${selectedElement === element.id ? 'ring-2 ring-purple-500' : ''}`}
                  style={{
                    ...element.styles,
                    width: '100%',
                    height: '100%',
                    opacity: element.styles.opacity !== undefined ? element.styles.opacity / 100 : 1,
                    transform: selectedElement === element.id ? 'scale(1.02)' : 'scale(1)',
                    transition: 'transform 0.2s',
                    minHeight: 'fit-content',
                    overflow: 'auto'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectedElementChange(element.id);
                  }}
                >
                  <div className="w-full h-full min-h-full" style={{ minHeight: 'inherit' }}>
                    <ElementContent
                      element={element}
                      onUpdate={(id: string, updates: Partial<CanvasElement>) => {
                        // Handle content updates that might affect size
                        const newElements = elements.map(el => {
                          if (el.id === id) {
                            const updatedElement = { ...el, ...updates };
                            // Adjust container size if content requires more space
                            const container = document.getElementById(`element-content-${id}`);
                            if (container) {
                              const contentHeight = container.scrollHeight;
                              const contentWidth = container.scrollWidth;
                              if (contentHeight > el.height || contentWidth > el.width) {
                                updatedElement.height = Math.max(el.height, contentHeight);
                                updatedElement.width = Math.max(el.width, contentWidth);
                              }
                            }
                            return updatedElement;
                          }
                          return el;
                        });
                        onElementsChange(newElements);
                      }}
                      isPreviewMode={isPreviewMode}
                    />
                  </div>
                </div>
              </Rnd>
            ))}
          </AnimatePresence>

          {elements.length === 0 && !isPreviewMode && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 font-architects-daughter">
              <Grid className="w-12 h-12 mb-4" />
              <p className="text-lg">Drag elements here to start</p>
              <p className="text-sm">or choose a template from the sidebar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 