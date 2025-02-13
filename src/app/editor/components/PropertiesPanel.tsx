import { useState } from 'react';
import { 
  Palette, Type, Layout, Image as ImageIcon, 
  Eye, EyeOff, Lock, Unlock, Timer
} from 'lucide-react';
import type { CanvasElement, ElementContent } from '../types';
import MediaUploader from './MediaUploader';
import QuizSettings from './quiz/QuizSettings';

interface StyleOption {
  label: string;
  value: string;
}

const fontFamilies: StyleOption[] = [
  { label: 'Default', value: 'font-architects-daughter' },
  { label: 'Sans Serif', value: 'font-sans' },
  { label: 'Serif', value: 'font-serif' },
  { label: 'Mono', value: 'font-mono' }
];

const fontSizes: StyleOption[] = [
  { label: 'Small', value: 'text-sm' },
  { label: 'Medium', value: 'text-base' },
  { label: 'Large', value: 'text-lg' },
  { label: 'Extra Large', value: 'text-xl' }
];

interface Section {
  id: string;
  title: string;
  icon: JSX.Element;
}

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video' | 'audio';
}

interface MediaContent {
  src: string;
  alt: string;
  type: 'image' | 'video' | 'audio';
}

interface QuizSettingsType {
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

interface PropertiesPanelProps {
  selectedElement: CanvasElement | null;
  onUpdate: (elementId: string, updates: {
    content?: ElementContent;
    styles?: Record<string, string | number>;
  }) => void;
  isCollapsed: boolean;
}

const sections: Section[] = [
  { id: 'style', title: 'Style', icon: <Palette className="w-5 h-5" /> },
  { id: 'typography', title: 'Typography', icon: <Type className="w-5 h-5" /> },
  { id: 'layout', title: 'Layout', icon: <Layout className="w-5 h-5" /> },
  { id: 'media', title: 'Media', icon: <ImageIcon className="w-5 h-5" /> },
  { id: 'timing', title: 'Timing', icon: <Timer className="w-5 h-5" /> }
];

export default function PropertiesPanel({ selectedElement, onUpdate, isCollapsed }: PropertiesPanelProps) {
  const [activeSection, setActiveSection] = useState('style');
  const [visibility, setVisibility] = useState(true);
  const [locked, setLocked] = useState(false);

  const handleUpdate = (styleUpdates: Partial<Record<string, string | number>>) => {
    if (selectedElement) {
      // Convert partial record to full record by removing undefined values
      const fullStyleUpdates = Object.fromEntries(
        Object.entries(styleUpdates).filter(([_, value]) => value !== undefined)
      ) as Record<string, string | number>;
      onUpdate(selectedElement.id, { styles: fullStyleUpdates });
    }
  };

  const handleMediaUpload = (files: MediaFile[]) => {
    if (!selectedElement || !files.length) return;
    const firstFile = files[0];
    if (!firstFile) return;
    
    const mediaContent: MediaContent = {
      src: firstFile.preview,
      alt: firstFile.file.name,
      type: firstFile.type
    };
    
    onUpdate(selectedElement.id, {
      content: mediaContent
    });
  };

  const handleMediaDelete = (_fileId: string) => {
    if (!selectedElement) return;
    const mediaContent: MediaContent = {
      src: '',
      alt: '',
      type: 'image'
    };
    
    onUpdate(selectedElement.id, {
      content: mediaContent
    });
  };

  const handleQuizSettingsChange = (updates: Partial<QuizSettingsType>) => {
    if (!selectedElement) return;
    onUpdate(selectedElement.id, {
      content: {
        ...selectedElement.content,
        ...updates
      } as ElementContent
    });
  };

  const ColorPicker = ({ label, value, onChange }: { 
    label: string; 
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-600">{label}</label>
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border-2 border-gray-800"
        />
      </div>
    </div>
  );

  const Select = ({ label, options, value, onChange }: {
    label: string;
    options: StyleOption[];
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-1">
      <label className="text-sm text-gray-600">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-white border-2 border-gray-800 rounded-lg 
                   appearance-none cursor-pointer focus:outline-none focus:ring-2 
                   focus:ring-purple-500"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const Slider = ({ label, min, max, value, onChange }: {
    label: string;
    min: number;
    max: number;
    value: number;
    onChange: (value: number) => void;
  }) => (
    <div className="space-y-1">
      <div className="flex justify-between">
        <label className="text-sm text-gray-600">{label}</label>
        <span className="text-sm text-gray-500">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  );

  if (isCollapsed) {
    return (
      <div className="w-10 h-full bg-white/90 backdrop-blur-sm border-2 border-gray-800 
                    rounded-lg overflow-hidden relative flex flex-col items-center py-4 gap-4">
        {/* Decorative Corner Lines */}
        <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-gray-800" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-gray-800" />
        
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`p-2 rounded-lg transition-all duration-300
                     transform hover:-translate-y-1 active:translate-y-0
                     ${activeSection === section.id ? 'bg-gray-800 text-white' : 'hover:bg-gray-100'}`}
          >
            {section.icon}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-white/90 backdrop-blur-sm border-2 border-gray-800 
                    rounded-lg overflow-hidden relative">
      {/* Decorative Corner Lines */}
      <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-gray-800" />
      <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-gray-800" />

      {/* Header */}
      <div className="p-4 border-b-2 border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold font-architects-daughter">Properties</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVisibility(!visibility)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300
                       transform hover:-translate-y-1 active:translate-y-0"
            >
              {visibility ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
            <button
              onClick={() => setLocked(!locked)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300
                       transform hover:-translate-y-1 active:translate-y-0"
            >
              {locked ? <Lock size={20} /> : <Unlock size={20} />}
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm
                         transition-all duration-300 whitespace-nowrap font-architects-daughter
                         transform hover:-translate-y-1 active:translate-y-0
                         ${activeSection === section.id 
                           ? 'bg-gray-800 text-white' 
                           : 'hover:bg-gray-100'}`}
            >
              {section.icon}
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto thin-scrollbar">
        {activeSection === 'style' && (
          <>
            <ColorPicker
              label="Background Color"
              value="#ffffff"
              onChange={(value) => handleUpdate({ backgroundColor: value })}
            />
            <ColorPicker
              label="Border Color"
              value="#000000"
              onChange={(value) => handleUpdate({ borderColor: value })}
            />
            <Slider
              label="Opacity"
              min={0}
              max={100}
              value={100}
              onChange={(value) => handleUpdate({ opacity: value })}
            />
            <Slider
              label="Border Width"
              min={0}
              max={10}
              value={2}
              onChange={(value) => handleUpdate({ borderWidth: value })}
            />
          </>
        )}

        {activeSection === 'typography' && (
          <>
            <Select
              label="Font Family"
              options={fontFamilies}
              value="font-architects-daughter"
              onChange={(value) => handleUpdate({ fontFamily: value })}
            />
            <Select
              label="Font Size"
              options={fontSizes}
              value="text-base"
              onChange={(value) => handleUpdate({ fontSize: value })}
            />
            <ColorPicker
              label="Text Color"
              value="#000000"
              onChange={(value) => handleUpdate({ color: value })}
            />
          </>
        )}

        {activeSection === 'layout' && (
          <>
            <Slider
              label="Width"
              min={0}
              max={1000}
              value={200}
              onChange={(value) => handleUpdate({ width: value })}
            />
            <Slider
              label="Height"
              min={0}
              max={1000}
              value={200}
              onChange={(value) => handleUpdate({ height: value })}
            />
            <Slider
              label="Padding"
              min={0}
              max={100}
              value={16}
              onChange={(value) => handleUpdate({ padding: value })}
            />
            <Slider
              label="Border Radius"
              min={0}
              max={50}
              value={8}
              onChange={(value) => handleUpdate({ borderRadius: value })}
            />
          </>
        )}

        {activeSection === 'media' && selectedElement && (
          <MediaUploader
            onUpload={handleMediaUpload}
            onDelete={handleMediaDelete}
            maxFiles={1}
            acceptedTypes={['image/*', 'video/*', 'audio/*']}
          />
        )}

        {activeSection === 'timing' && selectedElement && (
          <QuizSettings
            settings={{
              title: '',
              description: '',
              shuffleQuestions: false,
              shuffleOptions: false,
              showResults: true,
              passingScore: 70,
              attemptsAllowed: 1,
              isPublic: true,
              requireLogin: false,
              showFeedback: true,
              categories: [],
              tags: [],
              ...selectedElement.content as Partial<QuizSettingsType>
            }}
            onChange={handleQuizSettingsChange}
          />
        )}

        {/* Add more sections as needed */}
      </div>
    </div>
  );
} 