import { useEffect } from 'react';
import { Clock, Pause, Play, Save } from 'lucide-react';
import { useQuizState } from './QuizStateManager';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizProgress() {
  const { 
    state, 
    pauseQuiz, 
    resumeQuiz, 
    saveQuizState, 
    getCompletionSummary 
  } = useQuizState();

  const {
    completionPercentage,
    timeSpent,
    completedElements,
    totalElements
  } = getCompletionSummary();

  // Always set up the auto-save interval
  useEffect(() => {
    if (totalElements === 0) return;

    const interval = setInterval(() => {
      if (state.isTimerActive && !state.isPaused) {
        saveQuizState();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [state.isTimerActive, state.isPaused, saveQuizState, totalElements]);

  // Don't render if there are no quiz elements
  if (totalElements === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center gap-4 bg-white/90 backdrop-blur-sm border-2 
                 border-gray-800 rounded-lg px-4 py-2 shadow-lg"
    >
      {/* Timer Section */}
      <div className="flex items-center gap-3 pr-4 border-r-2 border-gray-200">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"
        >
          <Clock className="w-6 h-6 text-purple-600" />
        </motion.div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium">Time</span>
          <motion.span
            key={timeSpent}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="font-mono text-lg font-bold text-gray-800"
          >
            {timeSpent}
          </motion.span>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={state.isPaused ? resumeQuiz : pauseQuiz}
            className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
          >
            {state.isPaused ? (
              <Play className="w-4 h-4 text-green-600" />
            ) : (
              <Pause className="w-4 h-4 text-gray-600" />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveQuizState}
            className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4 text-purple-600" />
          </motion.button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col min-w-[120px]">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Progress</span>
            <span>{Math.round(completionPercentage)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
            />
          </div>
          <span className="text-xs text-gray-500 mt-1">
            {completedElements} of {totalElements}
          </span>
        </div>
      </div>

      {/* Score Section */}
      <div className="flex items-center gap-3 pl-4 border-l-2 border-gray-200">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium">Score</span>
          <motion.div
            key={`${state.currentScore}-${state.totalScore}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-baseline gap-1"
          >
            <span className="font-bold text-lg text-purple-600">
              {state.currentScore}
            </span>
            <span className="text-sm text-gray-500">/ {state.totalScore}</span>
          </motion.div>
        </div>
      </div>

      {/* Last Saved Indicator */}
      <AnimatePresence>
        {state.lastSavedState && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute -bottom-6 right-2 text-xs text-gray-400"
          >
            Last saved: {new Date(state.lastSavedState).toLocaleTimeString()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 