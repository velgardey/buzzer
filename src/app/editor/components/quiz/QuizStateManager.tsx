import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';

interface QuizState {
  currentScore: number;
  totalScore: number;
  progress: Record<string, {
    completed: boolean;
    score: number;
    attempts: number;
    lastAttempt?: Date;
  }>;
  feedback: Record<string, {
    isCorrect: boolean;
    message?: string;
  }>;
  startTime?: Date;
  endTime?: Date;
  timeElapsed: number;
  isPaused: boolean;
  isTimerActive: boolean;
  totalElements: number;
  completedElements: number;
  lastSavedState?: string;
}

interface QuizContextType {
  state: QuizState;
  updateScore: (elementId: string, score: number, total: number) => void;
  updateProgress: (elementId: string, completed: boolean) => void;
  setFeedback: (elementId: string, isCorrect: boolean, message?: string) => void;
  startQuiz: () => void;
  endQuiz: () => void;
  resetQuiz: () => void;
  pauseQuiz: () => void;
  resumeQuiz: () => void;
  saveQuizState: () => void;
  loadQuizState: () => void;
  setTotalElements: (count: number) => void;
  getCompletionSummary: () => {
    totalScore: number;
    completionPercentage: number;
    timeSpent: string;
    completedElements: number;
    totalElements: number;
  };
}

const QuizContext = createContext<QuizContextType | null>(null);

const SAVE_KEY = 'quiz_state_save';

export function QuizStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuizState>({
    currentScore: 0,
    totalScore: 0,
    progress: {},
    feedback: {},
    timeElapsed: 0,
    isPaused: false,
    isTimerActive: false,
    totalElements: 0,
    completedElements: 0
  });

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.startTime && !state.endTime && !state.isPaused) {
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.startTime, state.endTime, state.isPaused]);

  const updateScore = useCallback((elementId: string, score: number, total: number) => {
    setState(prev => {
      const newProgress: QuizState['progress'] = {
        ...prev.progress,
        [elementId]: {
          completed: prev.progress[elementId]?.completed ?? false,
          score,
          attempts: (prev.progress[elementId]?.attempts ?? 0) + 1,
          lastAttempt: new Date(),
        },
      };

      const totalScore = Object.values(newProgress).reduce((sum, item) => sum + item.score, 0);
      const maxScore = Object.values(newProgress).reduce((sum, _item) => sum + total, 0);
      const completedElements = Object.values(newProgress).filter(item => item.completed).length;

      return {
        ...prev,
        currentScore: totalScore,
        totalScore: maxScore,
        progress: newProgress,
        completedElements
      };
    });
  }, []);

  const updateProgress = useCallback((elementId: string, completed: boolean) => {
    setState(prev => {
      const existingProgress = prev.progress[elementId] ?? {
        score: 0,
        attempts: 0,
      };

      const newProgress = {
        ...prev.progress,
        [elementId]: {
          ...existingProgress,
          completed,
        },
      };

      const completedElements = Object.values(newProgress).filter(item => item.completed).length;

      return {
        ...prev,
        progress: newProgress,
        completedElements
      };
    });
  }, []);

  const setFeedback = useCallback((elementId: string, isCorrect: boolean, message?: string) => {
    setState(prev => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        [elementId]: { isCorrect, message },
      },
    }));
  }, []);

  const startQuiz = useCallback(() => {
    setState(prev => ({
      ...prev,
      startTime: new Date(),
      endTime: undefined,
      isTimerActive: true,
      isPaused: false,
      timeElapsed: 0
    }));
  }, []);

  const pauseQuiz = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: true,
      isTimerActive: false
    }));
  }, []);

  const resumeQuiz = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: false,
      isTimerActive: true
    }));
  }, []);

  const endQuiz = useCallback(() => {
    setState(prev => ({
      ...prev,
      endTime: new Date(),
      isTimerActive: false
    }));
  }, []);

  const resetQuiz = useCallback(() => {
    setState({
      currentScore: 0,
      totalScore: 0,
      progress: {},
      feedback: {},
      timeElapsed: 0,
      isPaused: false,
      isTimerActive: false,
      totalElements: 0,
      completedElements: 0
    });
  }, []);

  const saveQuizState = useCallback(() => {
    const saveState = {
      ...state,
      lastSavedState: new Date().toISOString()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveState));
  }, [state]);

  const loadQuizState = useCallback(() => {
    const savedState = localStorage.getItem(SAVE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState) as QuizState;
        if (isValidQuizState(parsedState)) {
          setState(parsedState);
        }
      } catch (error) {
        console.error('Error loading quiz state:', error);
      }
    }
  }, []);

  const setTotalElements = useCallback((count: number) => {
    setState(prev => {
      if (prev.totalElements === count) return prev;
      return {
        ...prev,
        totalElements: count
      };
    });
  }, []);

  const getCompletionSummary = useCallback(() => {
    const completionPercentage = state.totalElements > 0 
      ? (state.completedElements / state.totalElements) * 100 
      : 0;

    const formatTime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      return `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${remainingSeconds}s`;
    };

    return {
      totalScore: state.currentScore,
      completionPercentage,
      timeSpent: formatTime(state.timeElapsed),
      completedElements: state.completedElements,
      totalElements: state.totalElements
    };
  }, [state]);

  return (
    <QuizContext.Provider
      value={{
        state,
        updateScore,
        updateProgress,
        setFeedback,
        startQuiz,
        endQuiz,
        resetQuiz,
        pauseQuiz,
        resumeQuiz,
        saveQuizState,
        loadQuizState,
        setTotalElements,
        getCompletionSummary
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuizState() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuizState must be used within a QuizStateProvider');
  }
  return context;
}

function isValidQuizState(state: unknown): state is QuizState {
  return (
    typeof state === 'object' &&
    state !== null &&
    'currentScore' in state &&
    'totalScore' in state &&
    'progress' in state &&
    'feedback' in state &&
    'timeElapsed' in state &&
    'isPaused' in state &&
    'isTimerActive' in state &&
    'totalElements' in state &&
    'completedElements' in state
  );
} 