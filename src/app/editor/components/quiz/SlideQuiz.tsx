import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Minus, ChevronLeft, ChevronRight, Image as ImageIcon, 
  Video, Music, Type, ListChecks
} from 'lucide-react';
import Image from 'next/image';

interface SlideContent {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'question';
  content: string;
  options?: string[];
  correctAnswer?: string | string[];
  style: {
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
  };
}

interface Slide {
  id: string;
  title: string;
  contents: SlideContent[];
  background?: string;
  transition?: 'fade' | 'slide' | 'zoom';
  duration?: number;
}

interface SlideQuizProps {
  slides: Slide[];
  onChange: (updates: {
    slides?: Slide[];
    currentSlide?: number;
  }) => void;
  currentSlide: number;
}

export default function SlideQuiz({
  slides,
  onChange,
  currentSlide
}: SlideQuizProps) {
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: `Slide ${slides.length + 1}`,
      contents: [],
      transition: 'fade',
      duration: 5
    };
    onChange({ slides: [...slides, newSlide] });
  };

  const handleRemoveSlide = (slideId: string) => {
    onChange({
      slides: slides.filter(slide => slide.id !== slideId),
      currentSlide: Math.max(0, currentSlide - 1)
    });
  };

  const handleAddContent = (slideId: string, type: SlideContent['type']) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide) return;

    const newContent: SlideContent = {
      id: `content-${Date.now()}`,
      type,
      content: '',
      style: {
        x: 50,
        y: 50,
        width: type === 'text' ? 200 : 300,
        height: type === 'text' ? 100 : 200
      }
    };

    onChange({
      slides: slides.map(s =>
        s.id === slideId
          ? { ...s, contents: [...s.contents, newContent] }
          : s
      )
    });
    setSelectedContent(newContent.id);
  };

  const handleContentUpdate = (
    slideId: string,
    contentId: string,
    updates: Partial<Omit<SlideContent, 'style'> & { style?: Partial<SlideContent['style']> }>
  ) => {
    onChange({
      slides: slides.map(slide =>
        slide.id === slideId
          ? {
              ...slide,
              contents: slide.contents.map(content =>
                content.id === contentId
                  ? {
                      ...content,
                      ...updates,
                      style: updates.style
                        ? { ...content.style, ...updates.style }
                        : content.style
                    }
                  : content
              )
            }
          : slide
      )
    });
  };

  const handleSlideChange = (slideId: string, updates: Partial<Slide>) => {
    const updatedSlides = slides.map(slide => 
      slide.id === slideId ? { 
        ...slide, 
        title: updates.title ?? slide.title,
        contents: updates.contents ?? slide.contents,
        background: updates.background ?? slide.background,
        transition: updates.transition ?? slide.transition,
        duration: updates.duration ?? slide.duration
      } : slide
    );
    onChange({ slides: updatedSlides });
  };

  const currentSlideData = slides[currentSlide] ?? {
    id: '',
    title: '',
    contents: [],
    background: undefined,
    transition: 'fade',
    duration: 5
  };
  
  if (!currentSlideData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No slides available. Add one to get started.</p>
      </div>
    );
  }

  const handleContentDragEnd = (
    contentId: string,
    x: number,
    y: number
  ) => {
    const content = currentSlideData.contents.find(c => c.id === contentId);
    if (!content) return;

    setIsDragging(false);
    handleContentUpdate(currentSlideData.id, contentId, {
      style: {
        ...content.style,
        x,
        y
      }
    });
  };

  const slideTitle = currentSlideData.title ?? '';

  return (
    <div className="space-y-6">
      {/* Slide Controls */}
      <div className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-sm 
                    border-2 border-gray-800 rounded-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onChange({ currentSlide: Math.max(0, currentSlide - 1) })}
            disabled={currentSlide === 0}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm">
            Slide {currentSlide + 1} of {slides.length}
          </span>
          <button
            onClick={() => onChange({ currentSlide: Math.min(slides.length - 1, currentSlide + 1) })}
            disabled={currentSlide === slides.length - 1}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddSlide}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg
                     hover:bg-purple-700 transition-colors duration-300"
          >
            <Plus className="w-4 h-4" />
          </button>
          {slides.length > 1 && (
            <button
              onClick={() => handleRemoveSlide(currentSlideData.id)}
              className="px-4 py-2 border-2 border-gray-800 rounded-lg
                       hover:bg-gray-100 transition-colors duration-300"
            >
              <Minus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Slide Editor */}
      <div className="flex gap-6">
        {/* Content Area */}
        <div className="flex-1">
          <div className="relative aspect-video bg-white rounded-lg overflow-hidden
                       border-2 border-gray-800">
            {/* Background */}
            {currentSlideData.background && (
              <Image 
                src={currentSlideData.background}
                alt="Background"
                fill
                className="object-cover rounded-lg"
                unoptimized={currentSlideData.background.startsWith('data:')}
              />
            )}

            {/* Contents */}
            <AnimatePresence>
              {currentSlideData.contents.map(content => (
                <motion.div
                  key={content.id}
                  className={`absolute ${
                    selectedContent === content.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  style={{
                    left: `${content.style?.x ?? 50}%`,
                    top: `${content.style?.y ?? 50}%`,
                    width: content.style?.width ?? 200,
                    height: content.style?.height ?? 100,
                    transform: 'translate(-50%, -50%)'
                  }}
                  drag
                  dragMomentum={false}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={(e, info) => {
                    const element = e.target as HTMLElement;
                    const parent = element.parentElement;
                    if (!parent) return;

                    const rect = parent.getBoundingClientRect();
                    const x = ((info.point.x - rect.left) / rect.width) * 100;
                    const y = ((info.point.y - rect.top) / rect.height) * 100;
                    handleContentDragEnd(content.id, x, y);
                  }}
                  onClick={() => !isDragging && setSelectedContent(content.id)}
                >
                  {content.type === 'text' && (
                    <textarea
                      value={content.content}
                      onChange={(e) =>
                        handleContentUpdate(currentSlideData.id, content.id, {
                          content: e.target.value
                        })
                      }
                      className="w-full h-full p-2 resize-none border-none rounded
                               focus:outline-none focus:ring-0"
                      style={{
                        fontSize: content.style?.fontSize ?? 16,
                        color: content.style?.color ?? '#000000',
                        backgroundColor: content.style?.backgroundColor ?? 'transparent'
                      }}
                    />
                  )}
                  {content.type === 'image' && (
                    <div className="w-full h-full">
                      {content.content ? (
                        <Image 
                          src={content.content}
                          alt={content.content}
                          fill
                          className="object-contain rounded-lg"
                          unoptimized={content.content.startsWith('data:')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center
                                    border-2 border-dashed border-gray-300 rounded">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  )}
                  {content.type === 'video' && (
                    <div className="w-full h-full">
                      {content.content ? (
                        <video
                          src={content.content}
                          controls
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center
                                    border-2 border-dashed border-gray-300 rounded">
                          <Video className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  )}
                  {content.type === 'audio' && (
                    <div className="w-full h-full flex items-center justify-center">
                      {content.content ? (
                        <audio
                          src={content.content}
                          controls
                          className="w-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center
                                    border-2 border-dashed border-gray-300 rounded">
                          <Music className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  )}
                  {content.type === 'question' && (
                    <div className="w-full h-full p-4 bg-white/90 backdrop-blur-sm rounded">
                      <textarea
                        value={content.content}
                        onChange={(e) =>
                          handleContentUpdate(currentSlideData.id, content.id, {
                            content: e.target.value
                          })
                        }
                        placeholder="Enter your question..."
                        className="w-full mb-4 p-2 border-2 border-gray-800 rounded
                                 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="space-y-2">
                        {content.options?.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`question-${content.id}`}
                              checked={content.correctAnswer === option}
                              onChange={() =>
                                handleContentUpdate(currentSlideData.id, content.id, {
                                  correctAnswer: option
                                })
                              }
                              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(content.options ?? [])];
                                newOptions[index] = e.target.value;
                                handleContentUpdate(currentSlideData.id, content.id, {
                                  options: newOptions
                                });
                              }}
                              className="flex-1 px-2 py-1 border-2 border-gray-800 rounded
                                       focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        ))}
                        <button
                          onClick={() =>
                            handleContentUpdate(currentSlideData.id, content.id, {
                              options: [...(content.options ?? []), '']
                            })
                          }
                          className="w-full p-2 border-2 border-dashed border-gray-300 rounded
                                   text-gray-500 hover:border-gray-400 hover:text-gray-600
                                   transition-colors duration-300"
                        >
                          Add Option
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-80 space-y-6">
          {/* Slide Properties */}
          <div className="p-4 bg-white/90 backdrop-blur-sm border-2 border-gray-800 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Slide Properties</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={slideTitle}
                onChange={(e) => handleSlideChange(currentSlideData.id, { title: e.target.value })}
                placeholder="Slide Title"
                className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={currentSlideData.transition}
                onChange={(e) =>
                  handleSlideChange(currentSlideData.id, {
                    transition: e.target.value as Slide['transition']
                  })
                }
                className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="zoom">Zoom</option>
              </select>
              <input
                type="number"
                value={currentSlideData.duration}
                onChange={(e) =>
                  handleSlideChange(currentSlideData.id, {
                    duration: Number(e.target.value)
                  })
                }
                placeholder="Duration (seconds)"
                className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Content Tools */}
          <div className="p-4 bg-white/90 backdrop-blur-sm border-2 border-gray-800 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Add Content</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAddContent(currentSlideData.id, 'text')}
                className="p-3 border-2 border-gray-800 rounded-lg hover:bg-gray-100
                         transition-colors duration-300 flex flex-col items-center gap-1"
              >
                <Type className="w-5 h-5" />
                <span className="text-sm">Text</span>
              </button>
              <button
                onClick={() => handleAddContent(currentSlideData.id, 'image')}
                className="p-3 border-2 border-gray-800 rounded-lg hover:bg-gray-100
                         transition-colors duration-300 flex flex-col items-center gap-1"
              >
                <ImageIcon className="w-5 h-5" />
                <span className="text-sm">Image</span>
              </button>
              <button
                onClick={() => handleAddContent(currentSlideData.id, 'video')}
                className="p-3 border-2 border-gray-800 rounded-lg hover:bg-gray-100
                         transition-colors duration-300 flex flex-col items-center gap-1"
              >
                <Video className="w-5 h-5" />
                <span className="text-sm">Video</span>
              </button>
              <button
                onClick={() => handleAddContent(currentSlideData.id, 'question')}
                className="p-3 border-2 border-gray-800 rounded-lg hover:bg-gray-100
                         transition-colors duration-300 flex flex-col items-center gap-1"
              >
                <ListChecks className="w-5 h-5" />
                <span className="text-sm">Question</span>
              </button>
            </div>
          </div>

          {/* Selected Content Properties */}
          {selectedContent && (
            <div className="p-4 bg-white/90 backdrop-blur-sm border-2 border-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Content Properties</h3>
                <button
                  onClick={() => {
                    const newContents = currentSlideData.contents.filter(
                      c => c.id !== selectedContent
                    );
                    handleSlideChange(currentSlideData.id, { contents: newContents });
                    setSelectedContent(null);
                  }}
                  className="p-2 text-red-500 rounded-lg hover:bg-red-50
                           transition-colors duration-300"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {/* Style controls for the selected content */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Size</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={currentSlideData.contents.find(
                        c => c.id === selectedContent
                      )?.style?.width}
                      onChange={(e) => {
                        const content = currentSlideData.contents.find(
                          c => c.id === selectedContent
                        );
                        if (content) {
                          handleContentUpdate(currentSlideData.id, selectedContent, {
                            style: {
                              ...content.style,
                              width: Number(e.target.value)
                            }
                          });
                        }
                      }}
                      placeholder="Width"
                      className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="number"
                      value={currentSlideData.contents.find(
                        c => c.id === selectedContent
                      )?.style?.height}
                      onChange={(e) => {
                        const content = currentSlideData.contents.find(
                          c => c.id === selectedContent
                        );
                        if (content) {
                          handleContentUpdate(currentSlideData.id, selectedContent, {
                            style: {
                              ...content.style,
                              height: Number(e.target.value)
                            }
                          });
                        }
                      }}
                      placeholder="Height"
                      className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Font size for text content */}
                {currentSlideData.contents.find(c => c.id === selectedContent)?.type === 'text' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Font Size</label>
                    <input
                      type="number"
                      value={currentSlideData.contents.find(
                        c => c.id === selectedContent
                      )?.style?.fontSize}
                      onChange={(e) => {
                        const content = currentSlideData.contents.find(
                          c => c.id === selectedContent
                        );
                        if (content) {
                          handleContentUpdate(currentSlideData.id, selectedContent, {
                            style: {
                              ...content.style,
                              fontSize: Number(e.target.value)
                            }
                          });
                        }
                      }}
                      placeholder="Font Size"
                      className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {/* Color picker for text content */}
                {currentSlideData.contents.find(c => c.id === selectedContent)?.type === 'text' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Text Color</label>
                    <input
                      type="color"
                      value={currentSlideData.contents.find(c => c.id === selectedContent)?.style?.color ?? '#000000'}
                      onChange={(e) => {
                        const content = currentSlideData.contents.find(
                          c => c.id === selectedContent
                        );
                        if (content) {
                          handleContentUpdate(currentSlideData.id, selectedContent, {
                            style: {
                              ...content.style,
                              color: e.target.value
                            }
                          });
                        }
                      }}
                      className="w-full h-10 p-1 border-2 border-gray-800 rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 