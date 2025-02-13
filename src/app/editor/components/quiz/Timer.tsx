import { useState, useCallback, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

interface TimerProps {
  initialTime: number; // in seconds
  countDirection: 'up' | 'down';
  format: '24hour' | 'minutes' | 'seconds';
  autoStart: boolean;
  showControls: boolean;
  onTimeEnd?: () => void;
  onChange: (updates: {
    initialTime?: number;
    countDirection?: 'up' | 'down';
    format?: '24hour' | 'minutes' | 'seconds';
    autoStart?: boolean;
    showControls?: boolean;
  }) => void;
  isPreviewMode?: boolean;
}

export default function Timer({
  initialTime,
  countDirection = 'down',
  format = 'minutes',
  autoStart = false,
  showControls = true,
  onTimeEnd,
  onChange,
  isPreviewMode = false
}: TimerProps) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const formatTime = useCallback((timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    switch (format) {
      case '24hour':
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      case 'minutes':
        return `${(hours * 60 + minutes).toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      case 'seconds':
        return timeInSeconds.toString();
      default:
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }, [format]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      setTime(prevTime => {
        const newTime = countDirection === 'up' ? prevTime + 1 : prevTime - 1;
        
        if (countDirection === 'down' && newTime <= 0) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          onTimeEnd?.();
          return 0;
        }

        return newTime;
      });
    }, 1000);

    setIsRunning(true);
  }, [countDirection, onTimeEnd]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTime(initialTime);
  }, [initialTime, stopTimer]);

  useEffect(() => {
    if (autoStart && !isRunning && time > 0) {
      startTimer();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoStart, isRunning, startTimer, time]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      {/* Timer Display */}
      <div className="text-4xl font-bold font-mono mb-4">
        {formatTime(time)}
      </div>

      {/* Controls */}
      {showControls && !isPreviewMode && (
        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={stopTimer}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
            >
              <Pause className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={startTimer}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
            >
              <Play className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={resetTimer}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && !isPreviewMode && (
        <div className="mt-4 p-4 bg-white/90 backdrop-blur-sm border-2 border-gray-800 rounded-lg w-full">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Time (seconds)
              </label>
              <input
                type="number"
                value={initialTime}
                onChange={(e) => onChange({ initialTime: Math.max(0, parseInt(e.target.value)) })}
                className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg bg-white
                         focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Count Direction
              </label>
              <select
                value={countDirection}
                onChange={(e) => onChange({ countDirection: e.target.value as 'up' | 'down' })}
                className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg bg-white
                         focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="up">Count Up</option>
                <option value="down">Count Down</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Format
              </label>
              <select
                value={format}
                onChange={(e) => onChange({ format: e.target.value as '24hour' | 'minutes' | 'seconds' })}
                className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg bg-white
                         focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="24hour">24-Hour (HH:MM:SS)</option>
                <option value="minutes">Minutes (MM:SS)</option>
                <option value="seconds">Seconds Only</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoStart}
                  onChange={(e) => onChange({ autoStart: e.target.checked })}
                  className="rounded border-gray-800 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Auto Start</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showControls}
                  onChange={(e) => onChange({ showControls: e.target.checked })}
                  className="rounded border-gray-800 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Show Controls</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 