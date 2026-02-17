import { useState, useEffect } from 'react';
import { MapPin, Loader2, X, Navigation } from 'lucide-react';
import { updateLocation } from '../services/api';

const LocationPicker = ({ entryId, existingLocation, onLocationUpdate }) => {
  const [location, setLocation] = useState(existingLocation || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    setLocation(existingLocation || null);
  }, [existingLocation]);

  const getCurrentLocation = async () => {
    if (!isSupported) {
      setError('Geolocation not supported');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Try to get exact location using reverse geocoding
        let locationName = '';
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();

          const address = data.address || {};
          const city = address.city || address.town || address.village;
          const country = address.country;

          // Use city and country name
          if (city && country) {
            locationName = `${city}, ${country}`;
          } else if (city) {
            locationName = city;
          } else if (country) {
            locationName = country;
          } else {
            // Fallback to coordinates if no location found
            locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          }
        } catch (e) {
          locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }

        const newLocation = {
          name: locationName,
          coordinates: {
            lat: latitude,
            lng: longitude
          }
        };

        setLocation(newLocation);

        // Save to server if we have an entry ID
        if (entryId) {
          try {
            await updateLocation(entryId, newLocation);
          } catch (e) {
            console.error('Failed to save location');
          }
        }

        if (onLocationUpdate) {
          onLocationUpdate(newLocation);
        }

        setLoading(false);
      },
      (err) => {
        setError(getErrorMessage(err));
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const getErrorMessage = (err) => {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        return 'Location permission denied';
      case err.POSITION_UNAVAILABLE:
        return 'Location unavailable';
      case err.TIMEOUT:
        return 'Location request timed out';
      default:
        return 'Failed to get location';
    }
  };

  const clearLocation = async () => {
    setLocation(null);

    if (entryId) {
      try {
        await updateLocation(entryId, { name: '', coordinates: { lat: null, lng: null } });
      } catch (e) {
        console.error('Failed to clear location');
      }
    }

    if (onLocationUpdate) {
      onLocationUpdate(null);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {location ? (
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}
        >
          <MapPin size={14} style={{ color: 'var(--app-accent)' }} />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {location.name}
          </span>
          <button
            type="button"
            onClick={clearLocation}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:shadow-sm disabled:opacity-50"
          style={{
            background: 'var(--bg-parchment)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-light)'
          }}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span className="text-sm">Getting location...</span>
            </>
          ) : (
            <>
              <Navigation size={14} />
              <span className="text-sm">Add location</span>
            </>
          )}
        </button>
      )}

      {error && (
        <span className="text-xs" style={{ color: '#ef4444' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default LocationPicker;
