import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LocationsMap from '../components/LocationsMap';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { Badge } from '../components/ui';
import { LoadingSpinner } from '../components/common';
import {
  MapPin,
  Search,
  Filter,
  Navigation,
  Calendar,
  Droplets,
  Info,
  ExternalLink,
  Map as MapIcon,
  List,
  RefreshCw
} from 'lucide-react';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

  const regions = [
    { value: 'all', label: 'All Regions', range: null },
    { value: 'upper', label: 'Upper Ganga', range: [0, 500] },
    { value: 'middle', label: 'Middle Ganga', range: [500, 1000] },
    { value: 'lower-middle', label: 'Lower Middle', range: [1000, 1500] },
    { value: 'delta', label: 'Delta Region', range: [1500, Infinity] }
  ];

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    filterLocations();
  }, [locations, searchTerm, selectedRegion]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/locations');
      const data = await response.json();
      
      if (data.success) {
        setLocations(data.data);
        setError(null);
      } else {
        setError('Failed to fetch locations');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterLocations = () => {
    let filtered = [...locations];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by region
    if (selectedRegion !== 'all') {
      const region = regions.find(r => r.value === selectedRegion);
      if (region && region.range) {
        filtered = filtered.filter(location =>
          location.riverKm >= region.range[0] && location.riverKm < region.range[1]
        );
      }
    }

    setFilteredLocations(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLocationColor = (riverKm) => {
    if (riverKm < 500) return 'bg-green-100 text-green-800';
    else if (riverKm < 1000) return 'bg-blue-100 text-blue-800';
    else if (riverKm < 1500) return 'bg-yellow-100 text-yellow-800';
    else return 'bg-red-100 text-red-800';
  };

  const getLocationRegion = (riverKm) => {
    if (riverKm < 500) return 'Upper Ganga';
    else if (riverKm < 1000) return 'Middle Ganga';
    else if (riverKm < 1500) return 'Lower Middle Ganga';
    else return 'Delta Region';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchLocations}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Monitoring Locations</h1>
              <p className="text-gray-600">Explore water quality monitoring stations along the Ganga river</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLocations}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Locations</p>
                <p className="text-xl font-bold text-gray-900">{locations.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">River Coverage</p>
                <p className="text-xl font-bold text-gray-900">
                  {locations.length > 0 ? Math.max(...locations.map(l => l.riverKm)) : 0} km
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <MapIcon className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">States Covered</p>
                <p className="text-xl font-bold text-gray-900">
                  {new Set(locations.map(l => l.state)).size}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Filtered Results</p>
                <p className="text-xl font-bold text-gray-900">{filteredLocations.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search locations, cities, or states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Region Filter */}
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {regions.map(region => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MapIcon className="h-4 w-4" />
              Map View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
              List View
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'map' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div style={{ height: '600px' }}>
            <LocationsMap
              locations={filteredLocations}
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location) => (
            <Card key={location._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">{location.name}</CardTitle>
                    <p className="text-sm text-gray-600">{location.city}, {location.state}</p>
                  </div>
                  <Badge className={`text-xs ${getLocationColor(location.riverKm)}`}>
                    {getLocationRegion(location.riverKm)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Distance:</span>
                  <span className="text-gray-700">{location.riverKm} km from source</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Coordinates:</span>
                  <span className="text-gray-700">
                    {location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Since:</span>
                  <span className="text-gray-700">{formatDate(location.installationDate)}</span>
                </div>

                {location.description && (
                  <div className="flex items-start gap-2 text-sm pt-2 border-t border-gray-200">
                    <Info className="h-4 w-4 text-gray-500 mt-0.5" />
                    <p className="text-gray-600 leading-relaxed">{location.description}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <Link
                    to={`/location/${location._id}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Details
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredLocations.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or region filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedRegion('all');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Locations;