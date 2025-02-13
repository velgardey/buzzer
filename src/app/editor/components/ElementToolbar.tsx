import { 
  Type, Image as ImageIcon, Video, Music, Timer, Grid, 
  ListChecks, Table, Map, Puzzle, Layout, Columns, Rows,
  AlignLeft, AlignCenter, AlignRight, Link
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { ElementType } from '../types';

const elements: ElementType[] = [
  // Basic Elements
  {
    id: 'text',
    name: 'Text',
    icon: <Type className="w-5 h-5" />,
    category: 'basic',
    defaultWidth: 200,
    defaultHeight: 100
  },
  {
    id: 'image',
    name: 'Image',
    icon: <ImageIcon className="w-5 h-5" />,
    category: 'media',
    defaultWidth: 300,
    defaultHeight: 200
  },
  {
    id: 'video',
    name: 'Video',
    icon: <Video className="w-5 h-5" />,
    category: 'media',
    defaultWidth: 400,
    defaultHeight: 225
  },
  {
    id: 'audio',
    name: 'Audio',
    icon: <Music className="w-5 h-5" />,
    category: 'media',
    defaultWidth: 300,
    defaultHeight: 80
  },

  // Quiz Elements
  {
    id: 'multiple-choice',
    name: 'Multiple Choice',
    icon: <ListChecks className="w-5 h-5" />,
    category: 'quiz',
    defaultWidth: 400,
    defaultHeight: 250
  },
  {
    id: 'grid-puzzle',
    name: 'Grid Puzzle',
    icon: <Grid className="w-5 h-5" />,
    category: 'quiz',
    defaultWidth: 400,
    defaultHeight: 400
  },
  {
    id: 'crossword',
    name: 'Crossword',
    icon: <Table className="w-5 h-5" />,
    category: 'quiz',
    defaultWidth: 500,
    defaultHeight: 500
  },
  {
    id: 'map-quiz',
    name: 'Map Quiz',
    icon: <Map className="w-5 h-5" />,
    category: 'quiz',
    defaultWidth: 600,
    defaultHeight: 400
  },
  {
    id: 'jigsaw',
    name: 'Jigsaw',
    icon: <Puzzle className="w-5 h-5" />,
    category: 'quiz',
    defaultWidth: 400,
    defaultHeight: 400
  },
  {
    id: 'timer',
    name: 'Timer',
    icon: <Timer className="w-5 h-5" />,
    category: 'quiz',
    defaultWidth: 200,
    defaultHeight: 100
  },

  // Layout Elements
  {
    id: 'container',
    name: 'Container',
    icon: <Layout className="w-5 h-5" />,
    category: 'layout',
    defaultWidth: 600,
    defaultHeight: 400
  },
  {
    id: 'columns',
    name: 'Columns',
    icon: <Columns className="w-5 h-5" />,
    category: 'layout',
    defaultWidth: 800,
    defaultHeight: 300
  },
  {
    id: 'rows',
    name: 'Rows',
    icon: <Rows className="w-5 h-5" />,
    category: 'layout',
    defaultWidth: 400,
    defaultHeight: 600
  }
];

interface ElementToolbarProps {
  onDragStart: (element: ElementType) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  isCollapsed?: boolean;
}

export default function ElementToolbar({ onDragStart, onDragEnd, isCollapsed = false }: ElementToolbarProps) {
  const categories = [
    { id: 'basic', name: 'Basic' },
    { id: 'media', name: 'Media' },
    { id: 'quiz', name: 'Quiz' },
    { id: 'layout', name: 'Layout' }
  ];

  const DraggableElement = ({ element }: { element: ElementType }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', element.id);
      onDragStart(element);
    };

    return (
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        className={`flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm border-2 
                  border-gray-800 rounded-lg cursor-move hover:bg-gray-50 
                  transition-all duration-300 group transform hover:-translate-y-1 
                  active:translate-y-0 ${isCollapsed ? 'justify-center' : ''}`}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 bg-gray-100 rounded-lg group-hover:bg-white 
                    transition-colors duration-300"
        >
          {element.icon}
        </motion.div>
        {!isCollapsed && (
          <span className="text-sm font-medium font-architects-daughter">{element.name}</span>
        )}
      </div>
    );
  };

  return (
    <div className={`h-full bg-white/90 backdrop-blur-sm border-2 
                    border-gray-800 rounded-lg overflow-hidden relative flex flex-col
                    transition-all duration-300 ${isCollapsed ? 'w-10' : 'w-64'}`}>
      {/* Decorative Corner Lines */}
      <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-gray-800" />
      <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-gray-800" />

      {!isCollapsed && (
        <div className="p-4 border-b-2 border-gray-800">
          <h3 className="text-xl font-bold font-architects-daughter mb-2">Elements</h3>
          <p className="text-sm text-gray-600">Drag and drop elements onto the canvas</p>
        </div>
      )}

      <div className={`flex-1 p-4 space-y-6 overflow-y-auto thin-scrollbar hover:overflow-y-auto 
                     transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}>
        {categories.map((category) => (
          <div key={category.id}>
            {!isCollapsed && (
              <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider 
                           font-architects-daughter">
                {category.name}
              </h4>
            )}
            <div className="space-y-2">
              {elements
                .filter((element) => element.category === category.id)
                .map((element) => (
                  <DraggableElement key={element.id} element={element} />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="sticky bottom-0 p-4 border-t-2 border-gray-800 bg-gray-50">
          <div className="flex justify-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300
                           transform hover:-translate-y-1 active:translate-y-0">
              <AlignLeft size={20} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300
                           transform hover:-translate-y-1 active:translate-y-0">
              <AlignCenter size={20} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300
                           transform hover:-translate-y-1 active:translate-y-0">
              <AlignRight size={20} />
            </button>
            <div className="w-px bg-gray-300" />
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300
                           transform hover:-translate-y-1 active:translate-y-0">
              <Link size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 