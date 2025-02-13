import { Trophy, Clock, Target, CheckCircle2 } from 'lucide-react';
import { useQuizState } from './QuizStateManager';

interface QuizSummaryProps {
  onRestart?: () => void;
  onClose?: () => void;
}

export default function QuizSummary({ onRestart, onClose }: QuizSummaryProps) {
  const { getCompletionSummary } = useQuizState();
  const summary = getCompletionSummary();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
          <p className="text-purple-100">Here&apos;s how you did</p>
        </div>

        {/* Stats */}
        <div className="p-6 space-y-6">
          {/* Score */}
          <div className="flex items-center gap-4">
            <Target className="w-8 h-8 text-purple-600" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Final Score</h3>
              <p className="text-2xl font-bold">{summary.totalScore}%</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-4">
            <Clock className="w-8 h-8 text-purple-600" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Time Spent</h3>
              <p className="text-2xl font-bold">{summary.timeSpent}</p>
            </div>
          </div>

          {/* Completion */}
          <div className="flex items-center gap-4">
            <CheckCircle2 className="w-8 h-8 text-purple-600" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Completion</h3>
              <p className="text-2xl font-bold">
                {summary.completedElements} of {summary.totalElements} ({Math.round(summary.completionPercentage)}%)
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                style={{ width: `${summary.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 flex gap-4">
          {onRestart && (
            <button
              onClick={onRestart}
              className="flex-1 px-4 py-2 bg-white border-2 border-gray-800 rounded-lg
                     hover:bg-gray-100 transition-colors duration-300"
            >
              Try Again
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600
                     text-white rounded-lg hover:from-purple-700 hover:to-pink-700
                     transition-colors duration-300"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 