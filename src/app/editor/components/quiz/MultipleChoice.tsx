import { useState } from 'react';
import { Plus, Minus, Check, X, Shuffle } from 'lucide-react';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface MultipleChoiceProps {
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
  question,
  options,
  onChange,
  allowMultiple = false,
  shuffleOptions = false,
  isPreviewMode = false
}: MultipleChoiceProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    if (isPreviewMode) {
      if (allowMultiple) {
        setSelectedOptions(prev => 
          prev.includes(optionId) 
            ? prev.filter(id => id !== optionId)
            : [...prev, optionId]
        );
      } else {
        setSelectedOptions([optionId]);
      }
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

  const handleCheck = () => {
    if (!isPreviewMode) return;
    setShowFeedback(true);
  };

  const handleReset = () => {
    if (!isPreviewMode) return;
    setSelectedOptions([]);
    setShowFeedback(false);
  };

  return (
    <div className="space-y-6 p-6 bg-white/90 backdrop-blur-sm border-2 border-gray-800 rounded-lg">
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

        <div className="space-y-2">
          {options.map((option) => (
            <div
              key={option.id}
              className={`flex items-start gap-2 group ${
                isPreviewMode ? 'cursor-pointer' : ''
              }`}
              onClick={() => handleOptionSelect(option.id)}
            >
              {isPreviewMode ? (
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0
                              transition-colors duration-300 flex items-center justify-center
                              ${selectedOptions.includes(option.id)
                                ? 'bg-purple-600 border-purple-600 text-white'
                                : 'border-gray-300 hover:border-gray-400'
                              } ${showFeedback && option.isCorrect
                                ? 'bg-green-500 border-green-500'
                                : ''
                              }`}>
                  {selectedOptions.includes(option.id) && <Check className="w-3 h-3" />}
                </div>
              ) : (
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
              )}

              {isPreviewMode ? (
                <span className={`flex-1 ${
                  showFeedback && selectedOptions.includes(option.id)
                    ? option.isCorrect
                      ? 'text-green-600'
                      : 'text-red-600'
                    : ''
                }`}>
                  {option.text}
                </span>
              ) : (
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
              )}

              {!isPreviewMode && (
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
              )}
            </div>
          ))}

          {!isPreviewMode && (
            <button
              onClick={handleAddOption}
              className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg
                       text-gray-500 hover:border-gray-400 hover:text-gray-600
                       transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          )}
        </div>
      </div>

      {/* Preview Mode Controls */}
      {isPreviewMode && (
        <div className="flex justify-end gap-2 pt-4 border-t-2 border-gray-100">
          <button
            onClick={handleReset}
            className="px-4 py-2 border-2 border-gray-800 rounded-lg
                     hover:bg-gray-100 transition-colors duration-300"
          >
            Reset
          </button>
          <button
            onClick={handleCheck}
            disabled={selectedOptions.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg
                     hover:bg-purple-700 transition-colors duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Answer
          </button>
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