import type { CanvasElement } from './types';

type PresetKey = 'traditional' | 'crossword' | 'grid-puzzle' | 'map-quiz' | 'slides' | 'rapid-fire';

export const quizPresets: Record<PresetKey, CanvasElement[]> = {
  traditional: [
    {
      id: 'question-1',
      type: 'text',
      x: 100,
      y: 50,
      width: 600,
      height: 100,
      content: { text: 'Enter your question here...' },
      styles: { fontSize: '24px', fontWeight: 'bold' }
    },
    {
      id: 'multiple-choice-1',
      type: 'multiple-choice',
      x: 100,
      y: 200,
      width: 600,
      height: 300,
      content: {
        question: 'Enter your question here...',
        options: [
          { id: `option-1-${Date.now()}`, text: 'Option 1', isCorrect: false },
          { id: `option-2-${Date.now()}`, text: 'Option 2', isCorrect: false },
          { id: `option-3-${Date.now()}`, text: 'Option 3', isCorrect: false },
          { id: `option-4-${Date.now()}`, text: 'Option 4', isCorrect: false }
        ],
        allowMultiple: false,
        shuffleOptions: false
      },
      styles: {}
    }
  ],
  
  crossword: [
    {
      id: 'crossword-grid',
      type: 'crossword',
      x: 100,
      y: 50,
      width: 500,
      height: 500,
      content: {
        cells: [{
          id: `cell-0-0-${Date.now()}`,
          letter: '',
          isBlocked: false,
          row: 0,
          col: 0
        }],
        clues: [{
          id: `clue-1-${Date.now()}`,
          number: 1,
          direction: 'across',
          text: 'Enter your clue here...',
          answer: '',
          startCell: { row: 0, col: 0 }
        }]
      },
      styles: {}
    },
    {
      id: 'clues-panel',
      type: 'text',
      x: 650,
      y: 50,
      width: 300,
      height: 500,
      content: { text: 'Clues will appear here...' },
      styles: { fontSize: '16px' }
    }
  ],

  'grid-puzzle': [
    {
      id: 'grid-puzzle-1',
      type: 'grid-puzzle',
      x: 100,
      y: 50,
      width: 600,
      height: 600,
      content: {
        rows: 3,
        columns: 3,
        cells: Array(9).fill(null).map((_, i) => ({
          id: `cell-${i}-${Date.now()}`,
          content: '',
          hint: '',
          type: 'text' as const,
          isRevealed: false,
          backgroundColor: '#ffffff'
        })),
        revealStyle: 'click' as const
      },
      styles: {}
    }
  ],

  'map-quiz': [
    {
      id: 'map-container',
      type: 'map-quiz',
      x: 50,
      y: 50,
      width: 800,
      height: 500,
      content: {
        mapImage: '',
        markers: [],
        regions: [],
        mode: 'markers'
      },
      styles: {}
    },
    {
      id: 'instructions',
      type: 'text',
      x: 50,
      y: 10,
      width: 800,
      height: 30,
      content: {
        text: 'Click anywhere on the map to add markers. Drag markers to position them.'
      },
      styles: {
        fontSize: '14px',
        textAlign: 'center',
        color: '#666666'
      }
    }
  ],

  slides: [
    {
      id: 'slide-1',
      type: 'text',
      x: 100,
      y: 50,
      width: 800,
      height: 100,
      content: { text: 'Slide Title' },
      styles: { fontSize: '32px', fontWeight: 'bold', textAlign: 'center' }
    },
    {
      id: 'slide-content',
      type: 'text',
      x: 100,
      y: 200,
      width: 800,
      height: 300,
      content: { text: 'Slide content goes here...' },
      styles: { fontSize: '18px' }
    }
  ],

  'rapid-fire': [
    {
      id: 'timer',
      type: 'timer',
      x: 700,
      y: 50,
      width: 200,
      height: 100,
      content: {
        initialTime: 60,
        countDirection: 'down' as const,
        format: 'seconds' as const,
        autoStart: false,
        showControls: true
      },
      styles: {}
    },
    {
      id: 'question',
      type: 'text',
      x: 100,
      y: 50,
      width: 550,
      height: 100,
      content: { text: 'Enter rapid-fire question...' },
      styles: { fontSize: '24px', fontWeight: 'bold' }
    },
    {
      id: 'answer-input',
      type: 'text',
      x: 100,
      y: 200,
      width: 550,
      height: 80,
      content: { text: 'Type your answer here...' },
      styles: { fontSize: '18px', backgroundColor: '#f3f4f6' }
    }
  ]
}; 