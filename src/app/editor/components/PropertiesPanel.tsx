import { useState } from 'react';
import { 
  Palette, Type, Eye, EyeOff, Lock, Unlock,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  RotateCcw, Layers, Move
} from 'lucide-react';
import type { CanvasElement, ElementContent } from '../types';

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

const alignments: StyleOption[] = [
  { label: 'Left', value: 'text-left' },
  { label: 'Center', value: 'text-center' },
  { label: 'Right', value: 'text-right' },
  { label: 'Justify', value: 'text-justify' }
];

interface Section {
  id: string;
  title: string;
  icon: JSX.Element;
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
  { id: 'typography', title: 'Typography', icon: <Type className="w-5 h-5" /> }
];

export default function PropertiesPanel({ selectedElement, onUpdate, isCollapsed }: PropertiesPanelProps) {
  const [activeSection, setActiveSection] = useState('style');
  const [visibility, setVisibility] = useState(true);
  const [locked, setLocked] = useState(false);

  const handleUpdate = (styleUpdates: Partial<Record<string, string | number>>) => {
    if (selectedElement) {
      const fullStyleUpdates = Object.fromEntries(
        Object.entries(styleUpdates).filter(([_, value]) => value !== undefined)
      ) as Record<string, string | number>;
      onUpdate(selectedElement.id, { styles: fullStyleUpdates });
    }
  };

  const handleReset = () => {
    if (selectedElement) {
      onUpdate(selectedElement.id, { 
        styles: {
          backgroundColor: '#ffffff',
          color: '#000000',
          borderColor: '#000000',
          borderWidth: 2,
          borderRadius: 8,
          opacity: 100,
          padding: 16,
          fontFamily: 'font-architects-daughter',
          fontSize: 'text-base',
          textAlign: 'text-left'
        }
      });
    }
  };

  const ColorPicker = ({ label, value, onChange }: { 
    label: string; 
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-600 flex-1">{label}</label>
      <div className="relative flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 px-2 py-1 text-sm border-2 border-gray-800 rounded-lg"
        />
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

  const Slider = ({ label, min, max, value, onChange, unit = '' }: {
    label: string;
    min: number;
    max: number;
    value: number;
    onChange: (value: number) => void;
    unit?: string;
  }) => {
    // Calculate appropriate step based on range
    const range = max - min;
    const step = range <= 10 ? 0.1 : range <= 100 ? 1 : 5;

    // Debounce the onChange handler for smoother updates
    const handleChange = (newValue: number) => {
      // Clamp the value between min and max
      const clampedValue = Math.min(Math.max(newValue, min), max);
      // Round to 1 decimal place for small ranges, otherwise whole numbers
      const roundedValue = range <= 10 ? 
        Math.round(clampedValue * 10) / 10 : 
        Math.round(clampedValue);
      onChange(roundedValue);
    };

    return (
      <div className="space-y-1">
        <div className="flex justify-between">
          <label className="text-sm text-gray-600">{label}</label>
          <span className="text-sm text-gray-500">{value}{unit}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => handleChange(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                     focus:outline-none focus:ring-2 focus:ring-purple-500
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-purple-600
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:border-2
                     [&::-webkit-slider-thumb]:border-white
                     [&::-webkit-slider-thumb]:shadow-md
                     [&::-webkit-slider-thumb]:transition-all
                     [&::-webkit-slider-thumb]:duration-150
                     [&::-webkit-slider-thumb]:hover:scale-110
                     [&::-moz-range-thumb]:appearance-none
                     [&::-moz-range-thumb]:w-4
                     [&::-moz-range-thumb]:h-4
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-purple-600
                     [&::-moz-range-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:border-2
                     [&::-moz-range-thumb]:border-white
                     [&::-moz-range-thumb]:shadow-md
                     [&::-moz-range-thumb]:transition-all
                     [&::-moz-range-thumb]:duration-150
                     [&::-moz-range-thumb]:hover:scale-110"
          />
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => handleChange(Number(e.target.value))}
            onBlur={(e) => {
              // Ensure the value is clamped on blur
              handleChange(Number(e.target.value));
            }}
            className="w-16 px-2 py-1 text-sm border-2 border-gray-800 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
    );
  };

  if (isCollapsed) {
    return (
      <div className="w-10 h-full bg-white/90 backdrop-blur-sm border-2 border-gray-800 
                    rounded-lg overflow-hidden relative flex flex-col items-center py-4 gap-4">
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

  if (!selectedElement) {
    return (
      <div className="w-80 h-full bg-white/90 backdrop-blur-sm border-2 border-gray-800 
                    rounded-lg overflow-hidden relative flex items-center justify-center">
        <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-gray-800" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-gray-800" />
        <p className="text-gray-500 text-center p-4">
          Select an element to edit its properties
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-white/90 backdrop-blur-sm border-2 border-gray-800 
                    rounded-lg overflow-hidden relative">
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
              title={visibility ? 'Hide Element' : 'Show Element'}
            >
              {visibility ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
            <button
              onClick={() => setLocked(!locked)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300
                       transform hover:-translate-y-1 active:translate-y-0"
              title={locked ? 'Unlock Element' : 'Lock Element'}
            >
              {locked ? <Lock size={20} /> : <Unlock size={20} />}
            </button>
            <button
              onClick={handleReset}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300
                       transform hover:-translate-y-1 active:translate-y-0"
              title="Reset Styles"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2">
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
        {/* Element Info */}
        <div className="p-3 bg-gray-50 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Position: {selectedElement.x}, {selectedElement.y}</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Size: {selectedElement.width} × {selectedElement.height}</span>
          </div>
        </div>

        {activeSection === 'style' && (
          <>
            <div className="space-y-4">
              <ColorPicker
                label="Background"
                value={selectedElement.styles.backgroundColor ?? '#ffffff'}
                onChange={(value) => handleUpdate({ backgroundColor: value })}
              />
              <ColorPicker
                label="Border Color"
                value={selectedElement.styles.borderColor ?? '#000000'}
                onChange={(value) => handleUpdate({ borderColor: value })}
              />
              <Slider
                label="Border Width"
                min={0}
                max={10}
                value={Number(selectedElement.styles.borderWidth ?? 2)}
                onChange={(value) => handleUpdate({ borderWidth: value })}
                unit="px"
              />
              <Slider
                label="Border Radius"
                min={0}
                max={50}
                value={Number(selectedElement.styles.borderRadius ?? 8)}
                onChange={(value) => handleUpdate({ borderRadius: value })}
                unit="px"
              />
              <Slider
                label="Opacity"
                min={0}
                max={100}
                value={Number(selectedElement.styles.opacity ?? 100)}
                onChange={(value) => handleUpdate({ opacity: value })}
                unit="%"
              />
              <Slider
                label="Padding"
                min={0}
                max={100}
                value={Number(selectedElement.styles.padding ?? 16)}
                onChange={(value) => handleUpdate({ padding: value })}
                unit="px"
              />
            </div>
          </>
        )}

        {activeSection === 'typography' && (
          <>
            <div className="space-y-4">
              <ColorPicker
                label="Text Color"
                value={String(selectedElement.styles.color ?? '#000000')}
                onChange={(value) => handleUpdate({ color: value })}
              />
              <Select
                label="Font Family"
                options={fontFamilies}
                value={String(selectedElement.styles.fontFamily ?? 'font-architects-daughter')}
                onChange={(value) => handleUpdate({ fontFamily: value })}
              />
              <Select
                label="Font Size"
                options={fontSizes}
                value={typeof selectedElement.styles.fontSize === 'number' 
                  ? `text-${selectedElement.styles.fontSize}` 
                  : (selectedElement.styles.fontSize ?? 'text-base')}
                onChange={(value) => handleUpdate({ fontSize: value })}
              />
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Text Alignment</label>
                <div className="flex gap-2">
                  {[
                    { icon: <AlignLeft size={16} />, value: 'text-left' },
                    { icon: <AlignCenter size={16} />, value: 'text-center' },
                    { icon: <AlignRight size={16} />, value: 'text-right' },
                    { icon: <AlignJustify size={16} />, value: 'text-justify' }
                  ].map((align) => (
                    <button
                      key={align.value}
                      onClick={() => handleUpdate({ textAlign: align.value })}
                      className={`p-2 rounded-lg transition-all duration-300
                               ${selectedElement.styles.textAlign === align.value 
                                 ? 'bg-gray-800 text-white' 
                                 : 'hover:bg-gray-100'}`}
                    >
                      {align.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 