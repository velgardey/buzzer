import { 
  ListChecks, Grid2X2, Presentation, 
  CrosshairIcon, Clock, Map, Puzzle, Layers 
} from 'lucide-react';
import { motion } from 'framer-motion';

export type QuizType = {
  id: string;
  name: string;
  icon: JSX.Element;
  description: string;
};

const quizTypes: QuizType[] = [
  {
    id: 'traditional',
    name: 'Traditional Quiz',
    icon: <ListChecks className="w-8 h-8" />,
    description: 'Multiple choice, true/false, and short answer questions'
  },
  {
    id: 'grid-puzzle',
    name: 'Grid Puzzle',
    icon: <Grid2X2 className="w-8 h-8" />,
    description: 'Create interactive grid-based puzzles and games'
  },
  {
    id: 'slides',
    name: 'Slide Quiz',
    icon: <Presentation className="w-8 h-8" />,
    description: 'Create engaging slide-based quizzes'
  },
  {
    id: 'crossword',
    name: 'Crossword',
    icon: <CrosshairIcon className="w-8 h-8" />,
    description: 'Design custom crossword puzzles'
  },
  {
    id: 'rapid-fire',
    name: 'Rapid Fire',
    icon: <Clock className="w-8 h-8" />,
    description: 'Time-based rapid answer quizzes'
  },
  {
    id: 'map-quiz',
    name: 'Geography Quiz',
    icon: <Map className="w-8 h-8" />,
    description: 'Interactive map-based geography questions'
  },
  {
    id: 'jigsaw',
    name: 'Puzzle Quiz',
    icon: <Puzzle className="w-8 h-8" />,
    description: 'Combine puzzles with quiz elements'
  },
  {
    id: 'custom',
    name: 'Custom Layout',
    icon: <Layers className="w-8 h-8" />,
    description: 'Start from scratch with a blank canvas'
  }
];

interface QuizTypeSelectorProps {
  onSelect: (type: QuizType) => void;
}

export default function QuizTypeSelector({ onSelect }: QuizTypeSelectorProps) {
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

      <div className="max-w-5xl mx-auto relative">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Choose Your Quiz Type
        </motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizTypes.map((type, index) => (
            <motion.button
              key={type.id}
              onClick={() => onSelect(type)}
              className="group relative bg-white/90 backdrop-blur-sm p-6 rounded-lg border-2 
                       border-gray-800 hover:bg-gray-50 transition-all duration-300 
                       transform hover:-translate-y-1 active:translate-y-0
                       text-left overflow-hidden shadow-lg hover:shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Decorative elements */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-gray-800" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-gray-800" />
              
              <div className="flex items-start gap-4">
                <motion.div 
                  className="p-3 rounded-lg bg-gray-100 group-hover:bg-white 
                           transition-colors duration-300"
                  whileHover={{ rotate: 5 }}
                >
                  {type.icon}
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{type.name}</h3>
                  <p className="text-gray-600">{type.description}</p>
                </div>
              </div>

              {/* Hover indicator */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r 
                            from-purple-600 to-pink-600 transform scale-x-0 
                            group-hover:scale-x-100 transition-transform duration-300" />
            </motion.button>
          ))}
        </div>
      </div>
    </main>
  );
} 