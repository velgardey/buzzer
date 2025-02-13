'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Save, Undo, Redo, Grid, ChevronLeft, ChevronRight } from 'lucide-react';
import EditorCanvas from './components/EditorCanvas';
import ElementToolbar from './components/ElementToolbar';
import PropertiesPanel from './components/PropertiesPanel';
import QuizTypeSelector from './components/QuizTypeSelector';
import type { QuizType } from './components/QuizTypeSelector';
import type { CanvasElement, ElementType, ElementContent, ElementStyles, GridPuzzleContent } from './types';
import { quizPresets } from './presets';

export default function Editor() {
  const [quizType, setQuizType] = useState<QuizType | null>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [history, setHistory] = useState<CanvasElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isElementToolbarCollapsed, setIsElementToolbarCollapsed] = useState(false);
  const [isPropertiesPanelCollapsed, setIsPropertiesPanelCollapsed] = useState(false);
  const [draggedElement, setDraggedElement] = useState<ElementType | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  // History management
  const addToHistory = useCallback((newElements: CanvasElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousState = history[historyIndex - 1];
      if (previousState) {
        setElements([...previousState]);
      }
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextState = history[historyIndex + 1];
      if (nextState) {
        setElements([...nextState]);
      }
    }
  }, [history, historyIndex]);

  // Element deletion
  const handleElementDelete = useCallback((elementId: string) => {
    const newElements = elements.filter(element => element.id !== elementId);
    setElements(newElements);
    setSelectedElement(null);
    addToHistory(newElements);
  }, [elements, addToHistory]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElement && !isPreviewMode) {
        handleElementDelete(selectedElement);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, isPreviewMode, handleElementDelete]);

  // Element management
  const handleElementAdd = useCallback((element: ElementType, position?: { x: number, y: number }) => {
    const newElement: CanvasElement = {
      id: `${element.id}-${Date.now()}`,
      type: element.id as CanvasElement['type'],
      x: position?.x ?? 100,
      y: position?.y ?? 100,
      width: element.defaultWidth,
      height: element.defaultHeight,
      content: element.id === 'multiple-choice' ? {
        question: 'Enter your question here...',
        options: [
          { id: `option-1-${Date.now()}`, text: 'Option 1', isCorrect: false },
          { id: `option-2-${Date.now()}`, text: 'Option 2', isCorrect: false },
          { id: `option-3-${Date.now()}`, text: 'Option 3', isCorrect: false },
          { id: `option-4-${Date.now()}`, text: 'Option 4', isCorrect: false }
        ],
        allowMultiple: false,
        shuffleOptions: false
      } : element.id === 'grid-puzzle' ? {
        rows: 3,
        columns: 3,
        cells: Array(9).fill(null).map((_, i) => ({
          id: `cell-${i}-${Date.now()}`,
          content: '',
          hint: '',
          type: 'text' as const,
          isRevealed: false,
          backgroundColor: '#ffffff'
        })),
        revealStyle: 'click' as const
      } : element.id === 'timer' ? {
        initialTime: 60,
        countDirection: 'down' as const,
        format: 'minutes' as const,
        autoStart: false,
        showControls: true
      } : element.id === 'text' ? {
        text: 'Enter text here...'
      } : element.id === 'image' || element.id === 'video' || element.id === 'audio' ? {
        src: '',
        alt: '',
        controls: true
      } : element.id === 'jigsaw' ? {
        imageUrl: '',
        rows: 3,
        columns: 3,
        difficulty: 'medium' as const,
        allowRotation: true,
        showPreview: false,
        pieces: []
      } : element.id === 'map-quiz' ? {
        mapImage: '',
        markers: [],
        regions: [],
        mode: 'markers' as const
      } : element.id === 'crossword' ? {
        cells: [{
          id: `cell-0-0-${Date.now()}`,
          letter: '',
          isBlocked: false,
          row: 0,
          col: 0
        }],
        clues: [{
          id: `clue-1-${Date.now()}`,
          number: 1,
          direction: 'across',
          text: 'Enter your clue here...',
          answer: '',
          startCell: { row: 0, col: 0 }
        }]
      } : {},
      styles: {}
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
  }, [elements, addToHistory]);

  const handleElementUpdate = useCallback((elementId: string, updates: Partial<{
    content: ElementContent;
    styles: ElementStyles;
  }>) => {
    const newElements = elements.map((element) => {
      if (element.id === elementId) {
        return {
          ...element,
          ...(updates.styles ? { styles: { ...element.styles, ...updates.styles } } : {}),
          ...(updates.content ? { content: { ...element.content, ...updates.content } } : {})
        };
      }
      return element;
    });
    setElements(newElements);
    addToHistory(newElements);
  }, [elements, addToHistory]);

  // Quiz type selection
  const handleQuizTypeSelect = (type: QuizType) => {
    setQuizType(type);
    // Initialize canvas with preset elements based on quiz type
    const preset = quizPresets[type.id as keyof typeof quizPresets];
    if (!preset) return;
    
    const presetElements = preset.map(element => ({
      ...element,
      id: `${element.id}-${Date.now()}`,
      content: element.content
    }));
    setElements(presetElements);
    addToHistory(presetElements);
  };

  // Preview mode
  const handlePreviewToggle = () => {
    setIsPreviewMode(!isPreviewMode);
    setSelectedElement(null);
  };

  // Save functionality
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const quizData = {
        type: quizType,
        elements,
        lastModified: new Date().toISOString()
      };

      // Save to localStorage for now
      // In a real app, this would be an API call
      localStorage.setItem('savedQuiz', JSON.stringify(quizData));

      // Show success message
      // In a real app, this would be a toast notification
      alert('Quiz saved successfully!');
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Error saving quiz. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle drag events
  const handleDragStart = useCallback((element: ElementType) => {
    setDraggedElement(element);
  }, []);

  const handleDragEnd = useCallback((_e: React.DragEvent<HTMLDivElement>) => {
    setDraggedElement(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggedElement) {
      setDragPosition({ x: e.clientX, y: e.clientY });
    }
  }, [draggedElement]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedElement) return;

    const canvasElement = e.currentTarget;
    const rect = canvasElement.getBoundingClientRect();
    const scrollLeft = canvasElement.scrollLeft;
    const scrollTop = canvasElement.scrollTop;

    // Calculate position relative to the canvas content area, accounting for scroll and grid
    const gridSize = 20; // Match the grid size from EditorCanvas
    const rawX = e.clientX - rect.left + scrollLeft;
    const rawY = e.clientY - rect.top + scrollTop;
    
    // Snap to grid and offset by half the element's default size for better placement
    const x = Math.round(rawX / gridSize) * gridSize - (draggedElement.defaultWidth / 2);
    const y = Math.round(rawY / gridSize) * gridSize - (draggedElement.defaultHeight / 2);

    handleElementAdd(draggedElement, { x: Math.max(0, x), y: Math.max(0, y) });
    setDraggedElement(null);
  }, [draggedElement, handleElementAdd]);

  if (!quizType) {
    return <QuizTypeSelector onSelect={handleQuizTypeSelect} />;
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 
                     font-architects-daughter relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px',
        }} />
      </div>

      <div className="max-w-[1920px] mx-auto">
        {/* Top Action Bar */}
        <div className="flex items-center gap-4 p-3 bg-white/90 backdrop-blur-sm border-2 
                       border-gray-800 rounded-lg sticky top-4 z-50">
          <div className="flex items-center gap-2">
            <button 
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Undo size={20} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Redo size={20} />
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg transition-all duration-300 
                         ${showGrid ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
            >
              <Grid size={20} />
            </button>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button 
              onClick={handlePreviewToggle}
              className={`px-4 py-2 border-2 border-gray-800 rounded-lg 
                       transition-all duration-300 flex items-center gap-2
                       transform hover:-translate-y-1 active:translate-y-0
                       ${isPreviewMode ? 'bg-gray-800 text-white' : 'hover:bg-gray-100'}`}
            >
              <Play size={20} />
              {isPreviewMode ? 'Edit' : 'Preview'}
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 
                       text-white rounded-lg hover:from-purple-700 hover:to-pink-700 
                       transition-all duration-300 flex items-center gap-2
                       transform hover:-translate-y-1 active:translate-y-0 shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="mt-8 flex gap-4 h-[calc(100vh-10rem)]">
          {/* Left Toolbar - Hidden in preview mode */}
          {!isPreviewMode && (
            <motion.div
              initial={false}
              animate={{
                width: isElementToolbarCollapsed ? '40px' : '256px',
                transition: { duration: 0.3 }
              }}
              className="relative"
            >
              <ElementToolbar
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                isCollapsed={isElementToolbarCollapsed}
              />
              <button
                onClick={() => setIsElementToolbarCollapsed(!isElementToolbarCollapsed)}
                className="absolute -right-3 top-1/2 transform -translate-y-1/2 
                         bg-white border-2 border-gray-800 rounded-full p-1 
                         hover:bg-gray-100 transition-colors z-50"
              >
                {isElementToolbarCollapsed ? 
                  <ChevronRight size={16} /> : 
                  <ChevronLeft size={16} />
                }
              </button>
            </motion.div>
          )}

          {/* Center Canvas */}
          <div className="flex-1 relative">
            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-gray-800" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-gray-800" />
            <EditorCanvas
              elements={elements}
              onElementsChange={setElements}
              selectedElement={selectedElement}
              onSelectedElementChange={setSelectedElement}
              showGrid={showGrid && !isPreviewMode}
              isPreviewMode={isPreviewMode}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="editor-canvas"
            />
          </div>

          {/* Right Properties Panel - Hidden in preview mode */}
          {!isPreviewMode && (
            <motion.div
              initial={false}
              animate={{
                width: isPropertiesPanelCollapsed ? '40px' : '320px',
                transition: { duration: 0.3 }
              }}
              className="relative"
            >
              <PropertiesPanel
                selectedElement={selectedElement ? elements.find(e => e.id === selectedElement) ?? null : null}
                onUpdate={(elementId, updates) => {
                  const element = elements.find(e => e.id === elementId);
                  if (element) {
                    if (element.type === 'grid-puzzle') {
                      const gridContent = element.content as GridPuzzleContent;
                      const updatedContent = updates.content as Partial<GridPuzzleContent>;
                      handleElementUpdate(elementId, {
                        content: {
                          ...gridContent,
                          ...updatedContent,
                          cells: updatedContent?.cells ?? gridContent.cells,
                          revealStyle: gridContent.revealStyle
                        }
                      });
                    } else {
                      handleElementUpdate(elementId, updates);
                    }
                  }
                }}
                isCollapsed={isPropertiesPanelCollapsed}
              />
              <button
                onClick={() => setIsPropertiesPanelCollapsed(!isPropertiesPanelCollapsed)}
                className="absolute -left-3 top-1/2 transform -translate-y-1/2 
                         bg-white border-2 border-gray-800 rounded-full p-1 
                         hover:bg-gray-100 transition-colors z-50"
              >
                {isPropertiesPanelCollapsed ? 
                  <ChevronLeft size={16} /> : 
                  <ChevronRight size={16} />
                }
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Dragged Element Preview */}
      {draggedElement && (
        <motion.div
          className="fixed pointer-events-none z-50"
          animate={{
            x: dragPosition.x - 50,
            y: dragPosition.y - 50,
            scale: 0.8,
            opacity: 0.8,
          }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div className="w-[100px] h-[100px] bg-white/90 backdrop-blur-sm 
                       border-2 border-gray-800 rounded-lg flex items-center 
                       justify-center shadow-xl">
            {draggedElement.icon}
          </div>
        </motion.div>
      )}

      {/* Toast Notifications */}
      <AnimatePresence>
        {/* Add toast notifications here */}
      </AnimatePresence>
    </main>
  );
} 