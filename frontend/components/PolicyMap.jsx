'use client';

import { useEffect, useRef, useState } from 'react';

export default function PolicyMap({ apiKey, heatmapData = [], onClusterClick, filters, onFilterChange }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatmapRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const countryFilters = ['ALL', 'IN', 'BR', 'ZA', 'RU', 'CN'];
  const distressFilters = ['ALL', 'WAGES', 'HEALTH', 'SAFETY', 'MIGRATION'];
  const countryLabels = { ALL: 'All Nations', IN: '🇮🇳 India', BR: '🇧🇷 Brazil', ZA: '🇿🇦 S. Africa', RU: '🇷🇺 Russia', CN: '🇨🇳 China' };

  useEffect(() => {
    if (!apiKey) {
      // Show placeholder map without Google Maps
      setIsLoaded(false);
      return;
    }

    const loadMap = async () => {
      try {
        const { Loader } = await import('@googlemaps/js-api-loader');
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['visualization']
        });

        const google = await loader.load();

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 20, lng: 40 },
          zoom: 2,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a9a' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f1624' }] },
            { featureType: 'road', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi', stylers: [{ visibility: 'off' }] }
          ],
          disableDefaultUI: true,
          zoomControl: true
        });

        mapInstanceRef.current = map;
        setIsLoaded(true);
      } catch (err) {
        console.error('Google Maps load error:', err);
      }
    };

    loadMap();
  }, [apiKey]);

  // Update heatmap when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || !window.google) return;

    // Remove existing heatmap
    if (heatmapRef.current) {
      heatmapRef.current.setMap(null);
    }

    if (heatmapData.length === 0) return;

    const points = heatmapData.map(p => ({
      location: new window.google.maps.LatLng(p.lat, p.lng),
      weight: p.weight || 1
    }));

    heatmapRef.current = new window.google.maps.visualization.HeatmapLayer({
      data: points,
      map: mapInstanceRef.current,
      radius: 30,
      opacity: 0.8,
      gradient: [
        'rgba(0, 0, 0, 0)',
        'rgba(255, 153, 51, 0.4)',
        'rgba(255, 153, 51, 0.6)',
        'rgba(255, 69, 0, 0.7)',
        'rgba(220, 38, 38, 0.8)',
        'rgba(220, 38, 38, 1)'
      ]
    });

    // Add click listeners for clusters
    if (onClusterClick) {
      mapInstanceRef.current.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const nearby = heatmapData.filter(p => 
          Math.abs(p.lat - lat) < 2 && Math.abs(p.lng - lng) < 2
        );
        if (nearby.length > 0) {
          onClusterClick(nearby, { lat, lng });
        }
      });
    }
  }, [heatmapData, isLoaded]);

  return (
    <div className="h-full flex flex-col">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 p-3 bg-slate-900 border-b border-slate-700">
        <div className="flex gap-1">
          {countryFilters.map(f => (
            <button
              key={f}
              onClick={() => onFilterChange?.({ ...filters, country: f })}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-colors
                ${filters?.country === f
                  ? 'bg-[#FF9933] text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
            >
              {countryLabels[f] || f}
            </button>
          ))}
        </div>
        <div className="w-px h-6 bg-slate-700 mx-1" />
        <div className="flex gap-1">
          {distressFilters.map(f => (
            <button
              key={f}
              onClick={() => onFilterChange?.({ ...filters, distressType: f })}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-colors
                ${filters?.distressType === f
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} className="flex-1 relative">
        {!apiKey && (
          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-slate-400">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-lg font-semibold text-slate-300 mb-2">Heatmap Preview</p>
              <p className="text-sm mb-4">Configure GOOGLE_MAPS_API_KEY to enable interactive heatmap</p>
              {/* Fallback: Show data points as list */}
              <div className="text-left bg-slate-800 rounded-lg p-4 max-w-sm mx-auto text-xs space-y-2">
                <p className="text-[#FF9933] font-semibold mb-2">📊 {heatmapData.length} data points loaded:</p>
                {heatmapData.slice(0, 6).map((p, i) => (
                  <div key={i} className="flex justify-between text-slate-300">
                    <span>{p.country} — {p.type}</span>
                    <span className={p.weight > 2 ? 'text-red-400' : 'text-green-400'}>
                      Weight: {p.weight}
                    </span>
                  </div>
                ))}
                {heatmapData.length > 6 && (
                  <p className="text-slate-500">...and {heatmapData.length - 6} more</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
