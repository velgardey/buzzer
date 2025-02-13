export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'question' | 'timer' | 'grid' | 'multiple-choice' | 'grid-puzzle' | 'crossword' | 'map-quiz' | 'jigsaw' | 'container' | 'columns' | 'rows';
  x: number;
  y: number;
  width: number;
  height: number;
  content: ElementContent;
  styles: ElementStyles;
}

export interface ElementStyles {
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  borderWidth?: string | number;
  borderStyle?: string;
  borderRadius?: string | number;
  padding?: string | number;
  margin?: string | number;
  fontSize?: string | number;
  fontWeight?: string | number;
  opacity?: number;
  transform?: string;
  filter?: string;
  boxShadow?: string;
  zIndex?: number;
  [key: string]: string | number | undefined;
}

export interface MultipleChoiceContent {
  question: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  allowMultiple: boolean;
  shuffleOptions: boolean;
}

export interface CrosswordContent {
  cells: Array<{
    id: string;
    letter: string;
    isBlocked: boolean;
    row: number;
    col: number;
  }>;
  clues: Array<{
    id: string;
    number: number;
    direction: 'across' | 'down';
    text: string;
    answer: string;
    startCell: { row: number; col: number };
  }>;
}

export interface GridPuzzleContent {
  rows: number;
  columns: number;
  cells: Array<{
    id: string;
    content: string;
    hint: string;
    type: 'text' | 'image';
    isRevealed: boolean;
    backgroundColor: string;
  }>;
  revealStyle: 'click' | 'hover' | 'timed';
}

export interface TimerContent {
  initialTime: number;
  countDirection: 'up' | 'down';
  format: 'seconds' | 'minutes' | 'hours';
  autoStart: boolean;
  showControls: boolean;
}

export interface JigsawContent {
  imageUrl: string;
  rows: number;
  columns: number;
  difficulty: 'easy' | 'medium' | 'hard';
  allowRotation: boolean;
  showPreview: boolean;
  pieces: Array<{
    id: string;
    x: number;
    y: number;
    rotation: number;
    isPlaced: boolean;
  }>;
}

export interface MediaContent {
  src: string;
  alt?: string;
  caption?: string;
  autoplay?: boolean;
  loop?: boolean;
  controls?: boolean;
}

export interface TextContent {
  text: string;
  alignment?: 'left' | 'center' | 'right';
  format?: 'plain' | 'markdown' | 'html';
}

export type ElementContent = 
  | MultipleChoiceContent
  | CrosswordContent
  | GridPuzzleContent
  | TimerContent
  | JigsawContent
  | MapQuizContent
  | MediaContent
  | TextContent
  | Record<string, never>;

// Element-specific content types
export interface MapQuizContent {
  mapImage: string;
  markers: Array<{
    id: string;
    x: number;
    y: number;
    label: string;
    hint?: string;
    isCorrect: boolean;
    tolerance?: number;
  }>;
  regions: Array<{
    id: string;
    points: Array<{ x: number; y: number }>;
    label: string;
    hint?: string;
    isCorrect: boolean;
  }>;
  mode: 'markers' | 'regions';
}

export interface ElementType {
  id: string;
  name: string;
  icon: JSX.Element;
  category: 'basic' | 'media' | 'layout' | 'quiz';
  defaultWidth: number;
  defaultHeight: number;
} 