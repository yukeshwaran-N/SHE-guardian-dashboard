// src/pages/delivery/DeliveryMapView.tsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Navigation,
  MapPin,
  Truck,
  Home,
  Phone,
  Package,
  LocateFixed,
  Compass,
  Maximize2,
  Minimize2,
  Satellite,
  Map as MapIcon,
  ArrowLeft,
  Clock,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string, type: string) => {
  return L.divIcon({
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background-color: ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        animation: bounce 2s infinite;
        border: 2px solid white;
        cursor: pointer;
      ">
        ${type === 'truck' ? '🚚' : '🏠'}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Map controller component
const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
};

interface LocationState {
  lat: number;
  lng: number;
  address: string;
  womanName: string;
  id: string;
  scheduledTime?: string;
  distance?: string;
  contact?: string;
  items?: string[];
  status?: string;
  priority?: string;
}

export default function DeliveryMapView() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    state ? [state.lat, state.lng] : [28.6139, 77.2090]
  );
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [compassHeading, setCompassHeading] = useState(0);
  const [showPopup, setShowPopup] = useState(true);

  // Simulate compass
  useEffect(() => {
    const interval = setInterval(() => {
      setCompassHeading(prev => (prev + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {}
      );
    }
  }, []);

  const centerOnUser = () => {
    if (userLocation) {
      setMapCenter(userLocation);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in-transit': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!state) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No delivery location selected</p>
            <Button className="mt-4" onClick={() => navigate('/delivery/assigned')}>
              Back to Assigned Deliveries
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/delivery/assigned')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{state.womanName}</h1>
            <div className="flex items-center gap-2 mt-1">
              {state.priority && (
                <Badge className={getPriorityColor(state.priority)}>
                  {state.priority} priority
                </Badge>
              )}
              {state.status && (
                <Badge className={getStatusColor(state.status)}>
                  {state.status}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: compassHeading }}
            transition={{ duration: 0.1, ease: "linear" }}
            className="bg-blue-100 p-1.5 rounded-full"
          >
            <Compass className="h-4 w-4 text-blue-600" />
          </motion.div>
          <Button variant="outline" size="sm" onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}>
            {mapType === 'street' ? <Satellite className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={centerOnUser}>
            <LocateFixed className="h-4 w-4 mr-2" />
            Center
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Map */}
      <Card className="overflow-hidden">
        <div className={`relative transition-all duration-300 ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[600px]'}`}>
          <MapContainer
            key={mapType}
            center={mapCenter}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <MapController center={mapCenter} />
            
            <TileLayer
              url={mapType === 'street' 
                ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              }
              attribution='&copy; OpenStreetMap'
            />

            {/* User Location */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={L.divIcon({
                  html: '<div style="width: 16px; height: 16px; background-color: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.5); animation: pulse 2s infinite;"></div>',
                  iconSize: [16, 16]
                })}
              >
                <Popup>
                  <div className="p-2">
                    <strong>Your Location</strong>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Destination Marker - Shows popup on click/hover */}
            <Marker
              position={[state.lat, state.lng]}
              icon={createCustomIcon('#10b981', 'home')}
            >
              <Popup autoPan={true}>
                <div className="p-3 min-w-[250px]">
                  {/* Header with name and badges */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{state.womanName}</h3>
                    <div className="flex gap-1">
                      {state.priority && (
                        <Badge className={getPriorityColor(state.priority)}>
                          {state.priority}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                    <p className="text-sm">{state.address}</p>
                  </div>

                  {/* Delivery Details Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    {state.scheduledTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span>{state.scheduledTime}</span>
                      </div>
                    )}
                    {state.distance && (
                      <div className="flex items-center gap-1">
                        <Navigation className="h-3 w-3 text-gray-500" />
                        <span>{state.distance}</span>
                      </div>
                    )}
                  </div>

                  {/* Contact */}
                  {state.contact && (
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{state.contact}</span>
                    </div>
                  )}

                  {/* Items */}
                  {state.items && state.items.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Items:</p>
                      <div className="flex flex-wrap gap-1">
                        {state.items.map((item, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            <Package className="h-3 w-3 mr-1" />
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${state.lat},${state.lng}`, '_blank')}
                    >
                      <Navigation className="h-3 w-3 mr-2" />
                      Navigate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.location.href = `tel:${state.contact}`}
                    >
                      <Phone className="h-3 w-3 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>

          {/* Bottom Info Card */}
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 border z-[1000]">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Delivering to</p>
                <h3 className="font-semibold text-lg">{state.womanName}</h3>
                <p className="text-sm text-muted-foreground mt-1">{state.address}</p>
                
                {/* Quick Info Row */}
                <div className="flex items-center gap-4 mt-2 text-sm">
                  {state.scheduledTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {state.scheduledTime}
                    </span>
                  )}
                  {state.distance && (
                    <span className="flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      {state.distance}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.location.href = `tel:${state.contact}`}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  className="bg-blue-600"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${state.lat},${state.lng}`, '_blank')}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Start
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}