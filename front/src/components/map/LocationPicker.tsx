import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Loader2, Sparkles, Navigation } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const DEFAULT_CENTER: [number, number] = [56.8389, 60.6057] // Yekaterinburg

// Marker for selected location
const createSelectedPin = () => {
  return L.divIcon({
    className: 'custom-selected-pin',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #ef4444;
        color: #ffffff;
        font-size: 16px;
        width: 34px;
        height: 34px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg) translate(25%, -25%);
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        cursor: pointer;
      ">
        <span style="transform: rotate(45deg); font-size: 14px;">📍</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  })
}

// Marker for existing infrastructure context
const createExistingPin = (type: 'SC' | 'AN' | 'BLD') => {
  const bg = type === 'SC' ? '#1e3a8a' : type === 'AN' ? '#475569' : '#0284c7'
  const icon = type === 'SC' ? '🏢' : type === 'AN' ? '📡' : '🏠'
  return L.divIcon({
    className: 'custom-existing-pin',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: ${bg};
        color: #ffffff;
        font-size: 11px;
        width: 22px;
        height: 22px;
        border-radius: 4px;
        border: 1.5px solid #ffffff;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        opacity: 0.75;
      ">
        ${icon}
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lon: number) => void
}

function MapClickHandler({ onLocationSelect }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center)
  }, [center, map])
  return null
}

export interface ExistingLocation {
  id: string
  lat: number
  lon: number
  label: string
  type: 'SC' | 'AN' | 'BLD'
}

interface LocationPickerProps {
  lat: number
  lon: number
  onLocationChange: (lat: number, lon: number, address?: string) => void
  existingLocations?: ExistingLocation[]
  height?: string
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  lat,
  lon,
  onLocationChange,
  existingLocations = [],
  height = '280px',
}) => {
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodedAddr, setGeocodedAddr] = useState<string>('')

  const hasCoords = lat && lon && !isNaN(lat) && !isNaN(lon)
  const currentCenter: [number, number] = hasCoords ? [lat, lon] : DEFAULT_CENTER

  const handleSelectCoords = async (rawLat: number, rawLon: number) => {
    const roundedLat = Math.round(rawLat * 10000) / 10000
    const roundedLon = Math.round(rawLon * 10000) / 10000

    setIsGeocoding(true)
    let fetchedAddress = ''

    try {
      // Reverse geocoding via OpenStreetMap Nominatim
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${roundedLat}&lon=${roundedLon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'ru',
          },
        }
      )
      if (res.ok) {
        const data = await res.json()
        const addr = data.address || {}
        const city = addr.city || addr.town || addr.settlement || 'г. Екатеринбург'
        const road = addr.road || addr.street || ''
        const house = addr.house_number || ''

        if (road) {
          fetchedAddress = `${city}, ${road}${house ? `, ${house}` : ''}`
        } else if (data.display_name) {
          // Take first 2 parts of display name
          fetchedAddress = data.display_name.split(',').slice(0, 3).join(', ')
        }
      }
    } catch {
      // Offline fallback
    } finally {
      setIsGeocoding(false)
    }

    setGeocodedAddr(fetchedAddress)
    onLocationChange(roundedLat, roundedLon, fetchedAddress || undefined)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1 font-medium text-slate-700">
          <Navigation className="h-3.5 w-3.5 text-primary" />
          Кликните по карте для выбора геопозиции:
        </span>
        {isGeocoding ? (
          <span className="flex items-center gap-1 text-primary animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            Определяем адрес по карте...
          </span>
        ) : hasCoords ? (
          <span className="font-mono text-emerald-700 font-semibold">
            {lat.toFixed(4)}, {lon.toFixed(4)}
          </span>
        ) : (
          <span className="text-amber-600">Точка не выбрана</span>
        )}
      </div>

      <div
        style={{ height }}
        className="w-full rounded-lg border overflow-hidden relative shadow-inner z-0"
      >
        <MapContainer
          center={currentCenter}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onLocationSelect={handleSelectCoords} />

          {/* Existing infrastructure context */}
          {existingLocations.map((loc) => {
            if (!loc.lat || !loc.lon) return null
            return (
              <Marker
                key={`ctx-${loc.type}-${loc.id}`}
                position={[loc.lat, loc.lon]}
                icon={createExistingPin(loc.type)}
              >
                <Popup>
                  <div className="text-xs">
                    <strong>{loc.label}</strong>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* Current selected point pin */}
          {hasCoords && (
            <Marker position={[lat, lon]} icon={createSelectedPin()}>
              <Popup>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-red-600">Выбранная позиция</p>
                  <p className="font-mono">{lat.toFixed(4)}, {lon.toFixed(4)}</p>
                  {geocodedAddr && <p className="text-slate-600">{geocodedAddr}</p>}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  )
}
