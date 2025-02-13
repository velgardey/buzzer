import { Image as ImageIcon, Video, Music } from 'lucide-react';
import type { 
  CanvasElement, 
  MediaContent, 
  ElementContent as ElementContentType,
  MultipleChoiceContent,
  MapQuizContent,
  JigsawContent,
  TimerContent,
  GridPuzzleContent,
  CrosswordContent,
  TextContent
} from '../types';
import MultipleChoice from './quiz/MultipleChoice';
import GridPuzzle from './quiz/GridPuzzle';
import TimerComponent from './quiz/Timer';
import JigsawPuzzle from './quiz/JigsawPuzzle';
import MapQuiz from './quiz/MapQuiz';
import Image from 'next/image';
import Crossword from './quiz/Crossword';

interface ElementContentProps {
  element: CanvasElement;
  onUpdate: (elementId: string, updates: {
    content?: ElementContentType;
    styles?: Record<string, string | number>;
  }) => void;
  isPreviewMode?: boolean;
}

export default function ElementContent({ element, onUpdate, isPreviewMode = false }: ElementContentProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const mediaContent: MediaContent = {
        src: reader.result as string,
        alt: file.name,
        caption: file.name,
        controls: true
      };

      onUpdate(element.id, {
        content: mediaContent as ElementContentType
      });
    };
    reader.readAsDataURL(file);
  };

  const wrapWithContainer = (content: JSX.Element) => (
    <div id={`element-content-${element.id}`} className="w-full h-full">
      {content}
    </div>
  );

  switch (element.type) {
    case 'text':
      const textContent = element.content as TextContent;
      if (isPreviewMode) {
        return wrapWithContainer(
          <div
            className="w-full h-full p-4 cursor-text"
          >
            {textContent.text || 'Click to edit text...'}
          </div>
        );
      }
      return wrapWithContainer(
        <textarea
          className="w-full h-full p-4 border-none focus:outline-none resize-none bg-transparent"
          value={textContent.text || ''}
          onChange={(e) => onUpdate(element.id, { content: { text: e.target.value } })}
          onBlur={() => void 0}
          autoFocus
        />
      );
    case 'image':
    case 'video':
    case 'audio':
      const mediaContent = element.content as MediaContent;
      return wrapWithContainer(
        mediaContent.src ? (
          <div className="relative group w-full h-full">
            {element.type === 'image' && (
              <Image 
                src={mediaContent.src} 
                alt={mediaContent.alt ?? ''} 
                fill
                className="object-cover rounded-lg"
                unoptimized={mediaContent.src.startsWith('data:')}
              />
            )}
            {element.type === 'video' && (
              <video 
                src={mediaContent.src} 
                controls={mediaContent.controls}
                autoPlay={mediaContent.autoplay}
                loop={mediaContent.loop}
                className="w-full h-full rounded-lg"
              />
            )}
            {element.type === 'audio' && (
              <audio 
                src={mediaContent.src} 
                controls={mediaContent.controls}
                autoPlay={mediaContent.autoplay}
                loop={mediaContent.loop}
                className="w-full mb-2"
              />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                         transition-opacity duration-300 flex items-center justify-center">
              <label className="cursor-pointer px-4 py-2 bg-white rounded-lg">
                Change {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
                <input
                  type="file"
                  accept={`${element.type}/*`}
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        ) : (
          <label className="w-full h-full flex flex-col items-center justify-center
                         border-2 border-dashed border-gray-300 rounded-lg
                         cursor-pointer hover:border-gray-400 transition-colors">
            {element.type === 'image' && <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />}
            {element.type === 'video' && <Video className="w-8 h-8 text-gray-400 mb-2" />}
            {element.type === 'audio' && <Music className="w-8 h-8 text-gray-400 mb-2" />}
            <span className="text-sm text-gray-600">
              Click to upload {element.type}
            </span>
            <input
              type="file"
              accept={`${element.type}/*`}
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        )
      );
    case 'multiple-choice':
      const mcContent = element.content as MultipleChoiceContent;
      return wrapWithContainer(
        <MultipleChoice
          id={element.id}
          question={mcContent.question}
          options={mcContent.options}
          onChange={(updates) => onUpdate(element.id, { content: { ...mcContent, ...updates } })}
          allowMultiple={mcContent.allowMultiple}
          shuffleOptions={mcContent.shuffleOptions}
          isPreviewMode={isPreviewMode}
        />
      );
    case 'map-quiz':
      const mapContent = element.content as MapQuizContent;
      return wrapWithContainer(
        <MapQuiz
          id={element.id}
          mapImage={mapContent.mapImage}
          markers={mapContent.markers}
          regions={mapContent.regions}
          mode={mapContent.mode}
          isPreviewMode={isPreviewMode}
          onChange={(updates) => onUpdate(element.id, { content: { ...mapContent, ...updates } })}
        />
      );
    case 'jigsaw':
      const jigsawContent = element.content as JigsawContent;
      return wrapWithContainer(
        <JigsawPuzzle
          id={element.id}
          imageUrl={jigsawContent.imageUrl}
          rows={jigsawContent.rows}
          columns={jigsawContent.columns}
          difficulty={jigsawContent.difficulty}
          allowRotation={jigsawContent.allowRotation}
          showPreview={jigsawContent.showPreview}
          pieces={jigsawContent.pieces}
          onChange={(updates) => onUpdate(element.id, { content: { ...jigsawContent, ...updates } })}
          isPreviewMode={isPreviewMode}
        />
      );
    case 'timer':
      const timerContent = element.content as TimerContent;
      return wrapWithContainer(
        <TimerComponent
          id={element.id}
          initialTime={timerContent.initialTime}
          countDirection={timerContent.countDirection}
          format={timerContent.format}
          autoStart={timerContent.autoStart}
          showControls={timerContent.showControls}
          onChange={(updates) => onUpdate(element.id, { content: { ...timerContent, ...updates } })}
          isPreviewMode={isPreviewMode}
        />
      );
    case 'grid-puzzle':
      const gridContent = element.content as GridPuzzleContent;
      const cells = gridContent.cells.map(cell => ({
        ...cell,
        type: 'text' as const
      }));
      return wrapWithContainer(
        <GridPuzzle
          id={element.id}
          rows={gridContent.rows}
          columns={gridContent.columns}
          cells={cells}
          revealStyle={gridContent.revealStyle === 'timed' ? 'click' : gridContent.revealStyle}
          onChange={(updates) => {
            const updatedCells = updates.cells?.map(cell => ({
              ...cell,
              type: 'text' as const
            }));
            onUpdate(element.id, { 
              content: { 
                ...gridContent, 
                ...updates,
                cells: updatedCells ?? cells
              }
            });
          }}
          isPreviewMode={isPreviewMode}
        />
      );
    case 'crossword':
      const crosswordContent = element.content as CrosswordContent;
      return wrapWithContainer(
        <Crossword
          id={element.id}
          cells={crosswordContent.cells}
          clues={crosswordContent.clues}
          onChange={(updates) => onUpdate(element.id, { content: { ...crosswordContent, ...updates } })}
          isPreviewMode={isPreviewMode}
        />
      );
    default:
      return wrapWithContainer(
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          Unsupported element type
        </div>
      );
  }
}