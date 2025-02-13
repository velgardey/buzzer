import { useState, useEffect } from 'react';
import { Plus, Minus, Check, X, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizState } from './QuizStateManager';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface MultipleChoiceProps {
  id: string;
  question: string;
  options: Option[];
  onChange: (updates: { 
    question?: string; 
    options?: Option[];
    allowMultiple?: boolean;
    shuffleOptions?: boolean;
  }) => void;
  allowMultiple?: boolean;
  shuffleOptions?: boolean;
  isPreviewMode?: boolean;
}

export default function MultipleChoice({
  id,
  question,
  options,
  onChange,
  allowMultiple = false,
  shuffleOptions = false,
  isPreviewMode = false
}: MultipleChoiceProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState(options);
  const [isAnswered, setIsAnswered] = useState(false);
  const { updateScore, updateProgress, setFeedback, state } = useQuizState();

  useEffect(() => {
    if (shuffleOptions && isPreviewMode) {
      const shuffled = [...options].sort(() => Math.random() - 0.5);
      setShuffledOptions(shuffled);
    } else {
      setShuffledOptions(options);
    }
  }, [shuffleOptions, options, isPreviewMode]);

  const handleOptionSelect = (optionId: string) => {
    if (!isPreviewMode || isAnswered) return;

    if (allowMultiple) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions(prev => 
        prev[0] === optionId ? [] : [optionId]
      );
    }
  };

  const handleOptionChange = (optionId: string, updates: Partial<Option>) => {
    if (isPreviewMode) return;
    onChange({
      options: options.map(opt =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      )
    });
  };

  const handleAddOption = () => {
    if (isPreviewMode) return;
    const newOption: Option = {
      id: `option-${Date.now()}`,
      text: '',
      isCorrect: false
    };
    onChange({ options: [...options, newOption] });
  };

  const handleRemoveOption = (optionId: string) => {
    if (isPreviewMode) return;
    onChange({ options: options.filter(opt => opt.id !== optionId) });
  };

  const calculateScore = () => {
    const correctOptions = options.filter(opt => opt.isCorrect).map(opt => opt.id);
    const incorrectSelections = selectedOptions.filter(id => !correctOptions.includes(id));
    const missedCorrect = correctOptions.filter(id => !selectedOptions.includes(id));
    
    const totalCorrect = correctOptions.length;
    const score = totalCorrect - (incorrectSelections.length + missedCorrect.length);
    const percentage = Math.max(0, (score / totalCorrect) * 100);
    
    return {
      score: Math.round(percentage),
      message: `You got ${score} out of ${totalCorrect} correct.`
    };
  };

  const handleCheck = () => {
    if (!isPreviewMode || selectedOptions.length === 0) return;
    
    const { score, message } = calculateScore();
    
    updateScore(id, score, 100);
    updateProgress(id, score === 100);
    setFeedback(id, score === 100, message);
    setShowFeedback(true);
    setIsAnswered(true);
  };

  const handleReset = () => {
    if (!isPreviewMode) return;
    setSelectedOptions([]);
    setShowFeedback(false);
    setIsAnswered(false);
  };

  const displayOptions = isPreviewMode ? shuffledOptions : options;

  return (
    <div className={`space-y-6 p-6 bg-white/90 backdrop-blur-sm border-2 border-gray-800 rounded-lg
                    ${isAnswered ? 'pointer-events-none opacity-90' : ''}`}>
      {/* Question */}
      {isPreviewMode ? (
        <h3 className="text-xl font-bold mb-6">{question}</h3>
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Question</label>
          <textarea
            value={question}
            onChange={(e) => onChange({ question: e.target.value })}
            placeholder="Enter your question here..."
            className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg resize-none
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
          />
        </div>
      )}

      {/* Options */}
      <div className="space-y-4">
        {!isPreviewMode && (
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Options</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onChange({ shuffleOptions: !shuffleOptions })}
                className={`p-2 rounded-lg transition-colors duration-300
                         ${shuffleOptions 
                           ? 'bg-purple-100 text-purple-600' 
                           : 'hover:bg-gray-100'}`}
                title="Shuffle options when displaying"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <AnimatePresence>
            {displayOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className={`relative ${
                  isPreviewMode ? 'cursor-pointer' : ''
                }`}
                onClick={() => handleOptionSelect(option.id)}
              >
                {isPreviewMode ? (
                  <motion.div
                    className={`p-4 border-2 rounded-lg transition-all duration-300
                             ${selectedOptions.includes(option.id)
                               ? 'border-purple-600 bg-purple-50'
                               : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                             } ${isAnswered && option.isCorrect
                               ? 'border-green-500 bg-green-50'
                               : ''
                             } ${isAnswered && selectedOptions.includes(option.id) && !option.isCorrect
                               ? 'border-red-500 bg-red-50'
                               : ''
                             }`}
                    whileHover={!isAnswered ? { scale: 1.02 } : {}}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={`w-6 h-6 rounded-full flex items-center justify-center
                                 border-2 transition-colors duration-300 relative
                                 ${selectedOptions.includes(option.id)
                                   ? 'bg-purple-600 border-purple-600'
                                   : 'border-gray-300'
                                 } ${isAnswered && option.isCorrect
                                   ? 'bg-green-500 border-green-500'
                                   : ''
                                 } ${isAnswered && selectedOptions.includes(option.id) && !option.isCorrect
                                   ? 'bg-red-500 border-red-500'
                                   : ''
                                 }`}
                        initial={false}
                        animate={selectedOptions.includes(option.id) ? { scale: [1, 1.2, 1] } : {}}
                      >
                        <AnimatePresence mode="wait">
                          {selectedOptions.includes(option.id) && (
                            <motion.div
                              key="check"
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 45 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {!isAnswered && selectedOptions.includes(option.id) && (
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center opacity-0 
                                     hover:opacity-100 transition-opacity duration-200"
                            title="Click to deselect"
                          >
                            <div className="w-full h-full rounded-full bg-purple-700/10 
                                        flex items-center justify-center">
                              <X className="w-3 h-3 text-purple-700" />
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                      <span className={`flex-1 ${
                        isAnswered && selectedOptions.includes(option.id)
                          ? option.isCorrect
                            ? 'text-green-700'
                            : 'text-red-700'
                          : selectedOptions.includes(option.id)
                            ? 'text-purple-700'
                            : 'text-gray-700'
                      }`}>
                        {option.text}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionChange(option.id, { isCorrect: !option.isCorrect });
                      }}
                      className={`p-2 rounded-lg transition-colors duration-300 flex-shrink-0
                               ${option.isCorrect 
                                 ? 'bg-green-100 text-green-600' 
                                 : 'hover:bg-gray-100'}`}
                    >
                      {option.isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(option.id, { text: e.target.value })}
                        placeholder="Enter option text..."
                        className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg
                                 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOption(option.id);
                      }}
                      className="p-2 text-red-500 rounded-lg opacity-0 group-hover:opacity-100
                               transition-all duration-300 hover:bg-red-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {!isPreviewMode && (
            <motion.button
              onClick={handleAddOption}
              className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg
                       text-gray-500 hover:border-gray-400 hover:text-gray-600
                       transition-colors duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              Add Option
            </motion.button>
          )}
        </div>
      </div>

      {/* Preview Mode Controls */}
      {isPreviewMode && (
        <div className="space-y-4">
          {showFeedback && state.feedback[id] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                state.feedback[id].isCorrect ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <p className={`text-sm ${
                state.feedback[id].isCorrect ? 'text-green-700' : 'text-red-700'
              }`}>
                {state.feedback[id].message}
              </p>
            </motion.div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t-2 border-gray-100">
            <motion.button
              onClick={handleReset}
              className="px-4 py-2 border-2 border-gray-800 rounded-lg
                     hover:bg-gray-100 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reset
            </motion.button>
            <motion.button
              onClick={handleCheck}
              disabled={selectedOptions.length === 0 || isAnswered}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg
                     hover:bg-purple-700 transition-colors duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={selectedOptions.length > 0 && !isAnswered ? { scale: 1.05 } : {}}
              whileTap={selectedOptions.length > 0 && !isAnswered ? { scale: 0.95 } : {}}
            >
              Check Answer
            </motion.button>
          </div>
        </div>
      )}

      {/* Settings */}
      {!isPreviewMode && (
        <div className="pt-4 border-t-2 border-gray-100">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => onChange({ allowMultiple: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 
                       focus:ring-purple-500"
            />
            Allow multiple correct answers
          </label>
        </div>
      )}
    </div>
  );
} 