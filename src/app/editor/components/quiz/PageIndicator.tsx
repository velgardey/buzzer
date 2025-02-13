import { motion } from 'framer-motion';
import { useQuizState } from './QuizStateManager';
import { isQuizElement } from '../../types';

interface PageIndicatorProps {
  currentPage: number;
  totalPages: number;
  pageElements: Array<{
    id: string;
    type: string;
  }>;
}

export default function PageIndicator({ 
  currentPage, 
  totalPages,
  pageElements 
}: PageIndicatorProps) {
  const { state } = useQuizState();
  
  const quizElements = pageElements.filter(element => isQuizElement(element.type));
  const completedElements = quizElements.filter(element => state.progress[element.id]?.completed);
  const pageProgress = quizElements.length > 0 
    ? (completedElements.length / quizElements.length) * 100 
    : 100;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 
                  bg-white/90 backdrop-blur-sm border-2 border-gray-800 
                  rounded-full px-4 py-2 shadow-lg z-50">
      <div className="flex items-center gap-4">
        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentPage 
                  ? 'bg-purple-600' 
                  : index < currentPage 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
              }`}
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: index === currentPage ? 1.2 : 1,
                opacity: index === currentPage ? 1 : 0.7
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Page Progress */}
        {quizElements.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ width: 0 }}
                animate={{ width: `${pageProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {completedElements.length}/{quizElements.length}
            </span>
          </div>
        )}

        {/* Page Numbers */}
        <span className="text-xs text-gray-600 font-medium">
          Page {currentPage + 1} of {totalPages}
        </span>
      </div>
    </div>
  );
} 