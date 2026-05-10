/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Navigation, Layout, Shield, Phone, Bell, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Fix Leaflet marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to change map view
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.5
    });
  }, [center, zoom, map]);
  return null;
}

export default function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [statusMsg, setStatusMsg] = useState('Sistamiin qophii dha.');
  const [mapCenter, setMapCenter] = useState<[number, number]>([9.3126, 42.1239]);
  const [mapZoom, setMapZoom] = useState(13);
  const [markers, setMarkers] = useState<{ id: string, pos: [number, number], label: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const startTracking = () => {
    if (phoneNumber.length < 10) {
      setStatusMsg("Maaloo lakk. bilbilaa sirrii galchaa!");
      return;
    }
    
    setIsSearching(true);
    setStatusMsg(`${phoneNumber} hordofamaa jira...`);
    
    // Simulate tracking delay
    setTimeout(() => {
      const newPos: [number, number] = [9.3150, 42.1300];
      setMapCenter(newPos);
      setMapZoom(15);
      setMarkers(prev => [
        ...prev, 
        { id: phoneNumber, pos: newPos, label: `${phoneNumber} as jira.` }
      ]);
      setStatusMsg(`Bilbilli ${phoneNumber} argameera!`);
      setIsSearching(false);
    }, 2000);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const newPos: [number, number] = [latitude, longitude];
          setMapCenter(newPos);
          setMapZoom(16);
          setMarkers(prev => [
            ...prev.filter(m => m.id !== 'current'),
            { id: 'current', pos: newPos, label: 'Ati as jirta!' }
          ]);
          setStatusMsg("Bakki kee argameera.");
        },
        () => {
          setStatusMsg("Eeyyama bakka kee argachuuf hin dandeenye.");
        }
      );
    } else {
      setStatusMsg("Browser kee geolocation hin deeggaru.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-[1000] border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-500/30 text-white">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-blue-500 flex items-center gap-2">
              GeoGuard <span className="text-white/40 text-xs font-light tracking-normal italic uppercase">v1.0</span>
            </h1>
          </div>
        </motion.div>
        
        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <Bell size={20} />
          </button>
          <button className="hidden md:flex items-center gap-2 text-white/60 hover:text-white transition-colors mr-2">
            <Settings size={20} />
          </button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20"
          >
            Seeni
          </motion.button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl shadow-xl border border-white/5"
          >
            <div className="flex items-center gap-2 text-blue-400 mb-6 font-bold uppercase text-xs tracking-widest">
              <Search size={14} />
              <span>Nama Barbaadi</span>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                  <Phone size={18} />
                </div>
                <input 
                  type="text" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+251 9..." 
                  className="w-full bg-[#1e293b] border border-white/10 p-3 pl-10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/20"
                />
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startTracking}
                disabled={isSearching}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Navigation size={18} />
                )}
                <span>Hordoffii Jalqabi</span>
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-2xl border border-white/5 space-y-4"
          >
            <h3 className="font-bold text-white/80">Galmee Hordoffii</h3>
            <div className="space-y-3">
              {markers.length === 0 ? (
                <p className="text-white/20 text-sm italic">Hordoffiin hin jiru.</p>
              ) : (
                markers.map((marker) => (
                  <div key={marker.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg text-sm border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="truncate">{marker.label}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </aside>

        {/* Map Area */}
        <section className="lg:col-span-3 space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative glass p-1.5 rounded-[2.5rem] shadow-2xl border border-blue-500/20 overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[600px]"
          >
            <MapContainer 
              center={mapCenter} 
              zoom={mapZoom} 
              zoomControl={false}
              className="w-full h-full rounded-[2.2rem] z-10"
              style={{ background: '#0f172a' }}
            >
              <ChangeView center={mapCenter} zoom={mapZoom} />
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {markers.map((marker) => (
                <Marker key={marker.id} position={marker.pos}>
                  <Popup className="custom-popup">
                    <div className="p-1 font-sans font-medium text-slate-800">
                      {marker.label}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Floating Control */}
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={getLocation}
              className="absolute bottom-10 right-10 z-[1000] bg-white text-[#0f172a] p-4 rounded-2xl shadow-2xl hover:bg-blue-50 transition-all border-4 border-blue-500/20 group"
            >
              <MapPin size={24} className="group-hover:scale-110 transition-transform" />
            </motion.button>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={statusMsg}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 glass rounded-2xl text-white/60 text-sm flex items-center gap-3 border border-white/5"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span>{statusMsg}</span>
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto p-12 text-center text-white/20 text-xs border-t border-white/5 mt-12">
        <p>&copy; 2026 GeoGuard v1.0. All rights reserved.</p>
      </footer>
      
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          backdrop-filter: blur(8px);
        }
        .custom-popup .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.9);
        }
      `}</style>
    </div>
  );
}
