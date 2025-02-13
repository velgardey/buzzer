import { useState, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Minus, Map as MapIcon, MousePointer, PlusCircle, X } from 'lucide-react';
import Image from 'next/image';

interface MapMarker {
  id: string;
  x: number;
  y: number;
  label: string;
  hint?: string;
  isCorrect: boolean;
  tolerance?: number;
}

interface Region {
  id: string;
  points: Array<{ x: number; y: number }>;
  label: string;
  hint?: string;
  isCorrect: boolean;
}

interface MapQuizProps {
  mapImage: string;
  markers: MapMarker[];
  regions: Region[];
  onChange: (updates: {
    mapImage?: string;
    markers?: MapMarker[];
    regions?: Region[];
    mode?: 'markers' | 'regions';
  }) => void;
  mode?: 'markers' | 'regions';
  isPreviewMode?: boolean;
}

// Memoized Marker component to prevent unnecessary re-renders
const Marker = memo(({ 
  marker, 
  isSelected, 
  isPreviewMode, 
  showAnswers, 
  onSelect, 
  onDragEnd,
  isDraggable
}: { 
  marker: MapMarker;
  isSelected: boolean;
  isPreviewMode: boolean;
  showAnswers: boolean;
  onSelect: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  isDraggable: boolean;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const hint = marker.hint ?? '';
  const isCorrect = marker.isCorrect ?? false;

  return (
    <motion.div
      key={marker.id}
      className={`absolute -translate-x-1/2 -translate-y-1/2 
                ${isDraggable ? 'cursor-move' : 'cursor-pointer'} 
                ${isSelected ? 'z-30' : 'z-10'}`}
      style={{ 
        left: `${marker.x}%`, 
        top: `${marker.y}%`,
        transform: `translate(-50%, -50%) scale(${isSelected ? 1.25 : 1})`
      }}
      drag={isDraggable}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info) => {
        if (!isDraggable) return;
        const element = e.target as HTMLElement;
        const parent = element.parentElement;
        if (!parent) return;

        const rect = parent.getBoundingClientRect();
        const x = ((info.point.x - rect.left) / rect.width) * 100;
        const y = ((info.point.y - rect.top) / rect.height) * 100;
        onDragEnd(marker.id, x, y);
        setIsDragging(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isDragging) {
          onSelect(marker.id);
        }
      }}
    >
      {isSelected && (
        <div className="absolute -inset-2 border-2 border-red-700 rounded-full" />
      )}
      
      <MapPin
        className={`w-6 h-6
                 ${isCorrect ? 'text-green-500' : isSelected ? 'text-red-700' : 'text-red-500'}
                 ${showAnswers && isPreviewMode ? 'opacity-100' : 
                   isSelected ? 'opacity-100' : 'opacity-70'}`}
      />
      
      {(isSelected || showAnswers || isPreviewMode) && marker.label && (
        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1
                     bg-white border-2 ${isSelected ? 'border-red-700' : 'border-gray-800'} 
                     rounded text-sm whitespace-nowrap shadow-lg`}>
          {marker.label}
          {hint && isSelected && (
            <div className="text-xs text-gray-500 mt-1">{hint}</div>
          )}
        </div>
      )}
    </motion.div>
  );
});

Marker.displayName = 'Marker';

const MapQuiz = ({ 
  mapImage, 
  markers, 
  regions = [], 
  onChange, 
  isPreviewMode = false,
  mode = 'markers' 
}: MapQuizProps) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isPlacementMode, setIsPlacementMode] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [zoom, setZoom] = useState(1);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current || isPreviewMode || !isPlacementMode) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (mode === 'markers') {
      const newMarker: MapMarker = {
        id: `marker-${Date.now()}`,
        x,
        y,
        label: 'New Location',
        isCorrect: false,
        tolerance: 5
      };
      onChange({ markers: [...markers, newMarker] });
      setSelectedItem(newMarker.id);
    } else {
      const newRegion: Region = {
        id: `region-${Date.now()}`,
        points: [{ x, y }],
        label: 'New Region',
        isCorrect: false
      };
      onChange({ regions: [...regions, newRegion] });
      setSelectedItem(newRegion.id);
    }
    setIsPlacementMode(false); // Switch to edit mode after placing
  }, [mapRef, isPreviewMode, mode, markers, regions, onChange, isPlacementMode]);

  const handleMarkerDragEnd = useCallback((markerId: string, x: number, y: number) => {
    const updatedMarkers = markers.map(marker => 
      marker.id === markerId ? { ...marker, x, y } : marker
    );
    onChange({ markers: updatedMarkers });
  }, [markers, onChange]);

  const handleItemUpdate = useCallback((itemId: string, updates: Partial<MapMarker>) => {
    onChange({
      markers: markers.map(marker =>
        marker.id === itemId ? { ...marker, ...updates } : marker
      )
    });
  }, [markers, onChange]);

  const handleMarkerDelete = useCallback((markerId: string) => {
    onChange({
      markers: markers.filter(marker => marker.id !== markerId)
    });
    setSelectedItem(null);
  }, [markers, onChange]);

  const handleZoom = useCallback((delta: number) => {
    setZoom(z => Math.max(0.5, Math.min(2, z + delta)));
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onChange({ mapImage: reader.result as string });
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const selectedMarker = markers.find(m => m.id === selectedItem);
  const markerLabel = selectedMarker?.label ?? '';
  const markerHint = selectedMarker?.hint ?? '';

  const selectedRegion = regions.find(r => r.id === selectedItem);
  const regionLabel = selectedRegion?.label ?? '';
  const regionHint = selectedRegion?.hint ?? '';

  const handleRegionUpdate = useCallback((regionId: string, updates: Partial<Region>) => {
    onChange({
      regions: regions.map(region =>
        region.id === regionId ? { ...region, ...updates } : region
      )
    });
  }, [regions, onChange]);

  const handleRegionDelete = useCallback((regionId: string) => {
    onChange({
      regions: regions.filter(region => region.id !== regionId)
    });
    setSelectedItem(null);
  }, [regions, onChange]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      {!isPreviewMode && (
        <div className="flex items-center justify-between p-5 bg-white/95 backdrop-blur-sm 
                     border-2 border-gray-800 rounded-xl shadow-sm">
          <div className="flex items-center gap-6">
            {/* Zoom controls */}
            <div className="flex items-center gap-3 pr-6 border-r-2 border-gray-200">
              <button
                onClick={() => handleZoom(-0.1)}
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <Minus size={18} />
              </button>
              <span className="text-sm font-medium w-16 text-center tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => handleZoom(0.1)}
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Zoom In"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlacementMode(true)}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors
                         ${isPlacementMode ? 'bg-red-700 text-white shadow-sm' : 
                           'text-gray-700 hover:bg-gray-100'}`}
                title={`Place New ${mode === 'markers' ? 'Markers' : 'Regions'}`}
              >
                <PlusCircle size={18} />
                <span className="text-sm font-medium">Place</span>
              </button>
              <button
                onClick={() => setIsPlacementMode(false)}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors
                         ${!isPlacementMode ? 'bg-red-700 text-white shadow-sm' : 
                           'text-gray-700 hover:bg-gray-100'}`}
                title={`Select and Edit ${mode === 'markers' ? 'Markers' : 'Regions'}`}
              >
                <MousePointer size={18} />
                <span className="text-sm font-medium">Edit</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowAnswers(s => !s)}
            className={`px-5 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors
                     ${showAnswers ? 'bg-red-700 text-white shadow-sm' : 
                       'text-gray-700 hover:bg-gray-100'}`}
          >
            {showAnswers ? 'Hide Answers' : 'Show Answers'}
          </button>
        </div>
      )}

      {/* Map Container */}
      <div className="relative">
        {/* Map Area */}
        <div 
          ref={mapRef}
          className={`relative aspect-video bg-gray-100 rounded-xl overflow-hidden
                   border-2 border-gray-800 shadow-sm
                   ${isPlacementMode ? 'cursor-crosshair' : 'cursor-default'}`}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          onClick={mode === 'markers' ? handleMapClick : undefined}
        >
          {mapImage ? (
            <Image
              src={mapImage}
              alt="Map"
              className="w-full h-full object-cover"
              width={1920}
              height={1080}
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
              <MapIcon className="w-16 h-16 text-gray-400 mb-6" />
              <label className="px-6 py-3 bg-white border-2 border-gray-800 rounded-xl
                            hover:bg-gray-50 transition-colors cursor-pointer
                            shadow-sm active:translate-y-0.5">
                Upload Map Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          )}

          {/* Markers */}
          {mode === 'markers' && markers.map(marker => (
            <Marker
              key={marker.id}
              marker={marker}
              isSelected={selectedItem === marker.id}
              isPreviewMode={isPreviewMode}
              showAnswers={showAnswers}
              onSelect={(id) => {
                if (!isPlacementMode) {
                  setSelectedItem(id);
                }
              }}
              onDragEnd={handleMarkerDragEnd}
              isDraggable={!isPlacementMode && !isPreviewMode}
            />
          ))}

          {/* Regions */}
          {mode === 'regions' && regions.map(region => (
            <div
              key={region.id}
              className={`absolute inset-0 ${
                selectedItem === region.id ? 'z-30' : 'z-10'
              }`}
              onClick={() => !isPlacementMode && setSelectedItem(region.id)}
            >
              <svg className="w-full h-full">
                <polygon
                  points={region.points.map(p => `${p.x},${p.y}`).join(' ')}
                  className={`fill-current ${
                    region.isCorrect ? 'text-green-500/30' : 'text-red-500/30'
                  } stroke-current ${
                    region.isCorrect ? 'stroke-green-500' : 'stroke-red-500'
                  } stroke-2`}
                />
              </svg>
              {(selectedItem === region.id || showAnswers) && (
                <div className="absolute top-0 left-0 mt-2 ml-2 px-3 py-1.5
                             bg-white border-2 border-gray-800 rounded-lg shadow-lg">
                  {region.label}
                </div>
              )}
            </div>
          ))}

          {/* Placement Mode Indicator */}
          {isPlacementMode && !isPreviewMode && mapImage && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 px-5 py-3 
                         bg-red-700/90 backdrop-blur-sm text-white rounded-xl 
                         shadow-lg text-sm flex items-center gap-3">
              <PlusCircle size={18} className="animate-pulse" />
              Click anywhere to place a {mode === 'markers' ? 'marker' : 'region'}
            </div>
          )}
        </div>
      </div>

      {/* Selected Item Properties Panel */}
      <AnimatePresence>
        {selectedItem && !isPreviewMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 right-6 p-6 bg-white/95 backdrop-blur-sm 
                    border-2 border-red-700 rounded-xl shadow-lg z-40
                    max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-3">
                {mode === 'markers' && (
                  <MapPin className={`w-5 h-5 ${
                    markers.find(m => m.id === selectedItem)?.isCorrect ? 'text-green-500' : 'text-red-700'
                  }`} />
                )}
                {mode === 'regions' && (
                  <MapIcon className={`w-5 h-5 ${
                    selectedRegion?.isCorrect ? 'text-green-500' : 'text-red-700'
                  }`} />
                )}
                {mode === 'markers' ? 'Marker' : 'Region'} Properties
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mode === 'markers' && (
                <>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2">Label</label>
                      <input
                        type="text"
                        value={markerLabel}
                        onChange={(e) => handleItemUpdate(selectedItem, { label: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg 
                               focus:border-red-700 focus:outline-none transition-colors"
                        placeholder="Enter location name..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Hint (optional)</label>
                      <input
                        type="text"
                        value={markerHint}
                        onChange={(e) => handleItemUpdate(selectedItem, { hint: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg 
                               focus:border-red-700 focus:outline-none transition-colors"
                        placeholder="Enter hint for students..."
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tolerance (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={markers.find(m => m.id === selectedItem)?.tolerance ?? 5}
                        onChange={(e) => handleItemUpdate(selectedItem, { tolerance: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg 
                               focus:border-red-700 focus:outline-none transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        How close students need to place their answer
                      </p>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg
                                  hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={markers.find(m => m.id === selectedItem)?.isCorrect ?? false}
                        onChange={(e) => handleItemUpdate(selectedItem, { isCorrect: e.target.checked })}
                        className="w-4 h-4 text-red-700 focus:ring-red-700 
                               border-gray-300 rounded transition-colors"
                      />
                      <span className="text-sm font-medium">Mark as Correct Location</span>
                    </label>
                  </div>
                </>
              )}
              
              {mode === 'regions' && (
                <>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2">Label</label>
                      <input
                        type="text"
                        value={regionLabel}
                        onChange={(e) => handleRegionUpdate(selectedItem, { label: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg 
                               focus:border-red-700 focus:outline-none transition-colors"
                        placeholder="Enter region name..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Hint (optional)</label>
                      <input
                        type="text"
                        value={regionHint}
                        onChange={(e) => handleRegionUpdate(selectedItem, { hint: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg 
                               focus:border-red-700 focus:outline-none transition-colors"
                        placeholder="Enter hint for students..."
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg
                                  hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedRegion?.isCorrect}
                        onChange={(e) => handleRegionUpdate(selectedItem, { isCorrect: e.target.checked })}
                        className="w-4 h-4 text-red-700 focus:ring-red-700 
                               border-gray-300 rounded transition-colors"
                      />
                      <span className="text-sm font-medium">Mark as Correct Region</span>
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              {mode === 'markers' && (
                <button
                  onClick={() => handleMarkerDelete(selectedItem)}
                  className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg 
                         transition-colors flex items-center gap-2.5"
                >
                  <X size={18} />
                  Delete Marker
                </button>
              )}
              {mode === 'regions' && (
                <button
                  onClick={() => handleRegionDelete(selectedItem)}
                  className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg 
                         transition-colors flex items-center gap-2.5"
                >
                  <X size={18} />
                  Delete Region
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

MapQuiz.displayName = 'MapQuiz';

export default MapQuiz; 