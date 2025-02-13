import { useState } from 'react';
import { Settings, Eye, Lock, Share2, Save, Download, BarChart } from 'lucide-react';

interface QuizSettings {
  title: string;
  description: string;
  timeLimit?: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResults: boolean;
  passingScore: number;
  attemptsAllowed: number;
  isPublic: boolean;
  requireLogin: boolean;
  showFeedback: boolean;
  categories: string[];
  tags: string[];
}

interface QuizSettingsProps {
  settings: QuizSettings;
  onChange: (updates: Partial<QuizSettings>) => void;
}

export default function QuizSettings({ settings, onChange }: QuizSettingsProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'scoring' | 'access' | 'appearance'>('general');

  const handleInputChange = (key: keyof QuizSettings, value: unknown) => {
    onChange({ [key]: value });
  };

  const handleTagsChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      const newTag = e.currentTarget.value.trim();
      if (newTag && !settings.tags.includes(newTag)) {
        handleInputChange('tags', [...settings.tags, newTag]);
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tag: string) => {
    handleInputChange('tags', settings.tags.filter(t => t !== tag));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'scoring', label: 'Scoring', icon: BarChart },
    { id: 'access', label: 'Access', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Eye }
  ];

  return (
    <div className="space-y-6 p-6 bg-white/90 backdrop-blur-sm border-2 border-gray-800 rounded-lg">
      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-gray-100 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300
                     ${activeTab === tab.id 
                       ? 'bg-gray-800 text-white' 
                       : 'hover:bg-gray-100'}`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Quiz Title"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={settings.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Quiz Description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Time Limit (minutes)</label>
            <input
              type="number"
              value={settings.timeLimit ?? ''}
              onChange={(e) => handleInputChange('timeLimit', Number(e.target.value))}
              className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="No time limit"
              min={0}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Categories</label>
            <select
              multiple
              value={settings.categories}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                handleInputChange('categories', options);
              }}
              className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="general">General Knowledge</option>
              <option value="science">Science</option>
              <option value="history">History</option>
              <option value="geography">Geography</option>
              <option value="arts">Arts</option>
              <option value="sports">Sports</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {settings.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 rounded-lg text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500 transition-colors duration-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              onKeyDown={handleTagsChange}
              className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Add tags (press Enter)"
            />
          </div>
        </div>
      )}

      {/* Scoring Settings */}
      {activeTab === 'scoring' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Passing Score (%)</label>
            <input
              type="number"
              value={settings.passingScore}
              onChange={(e) => handleInputChange('passingScore', Number(e.target.value))}
              className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
              min={0}
              max={100}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Attempts Allowed</label>
            <input
              type="number"
              value={settings.attemptsAllowed}
              onChange={(e) => handleInputChange('attemptsAllowed', Number(e.target.value))}
              className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
              min={1}
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.showResults}
              onChange={(e) => handleInputChange('showResults', e.target.checked)}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Show Results After Completion</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.showFeedback}
              onChange={(e) => handleInputChange('showFeedback', e.target.checked)}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Show Answer Feedback</span>
          </label>
        </div>
      )}

      {/* Access Settings */}
      {activeTab === 'access' && (
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.isPublic}
              onChange={(e) => handleInputChange('isPublic', e.target.checked)}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Make Quiz Public</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.requireLogin}
              onChange={(e) => handleInputChange('requireLogin', e.target.checked)}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Require Login to Attempt</span>
          </label>

          <div className="pt-4 flex gap-2">
            <button className="flex-1 px-4 py-2 border-2 border-gray-800 rounded-lg
                           hover:bg-gray-100 transition-colors duration-300
                           flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="flex-1 px-4 py-2 border-2 border-gray-800 rounded-lg
                           hover:bg-gray-100 transition-colors duration-300
                           flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      )}

      {/* Appearance Settings */}
      {activeTab === 'appearance' && (
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.shuffleQuestions}
              onChange={(e) => handleInputChange('shuffleQuestions', e.target.checked)}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Shuffle Questions</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.shuffleOptions}
              onChange={(e) => handleInputChange('shuffleOptions', e.target.checked)}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Shuffle Answer Options</span>
          </label>

          {/* Add more appearance settings as needed */}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t-2 border-gray-100">
        <button className="px-4 py-2 border-2 border-gray-800 rounded-lg
                       hover:bg-gray-100 transition-colors duration-300">
          Cancel
        </button>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg
                       hover:bg-purple-700 transition-colors duration-300
                       flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
} 