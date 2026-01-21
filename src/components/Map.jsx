import React, { useEffect, useRef } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TOMTOM_API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;

const Map = ({ lat, lng, address }) => {
    const mapElement = useRef(null);
    const mapInstance = useRef(null);
    const markerInstance = useRef(null);

    useEffect(() => {
        if (!mapElement.current || mapInstance.current) return;

        // Init map
        mapInstance.current = tt.map({
            key: TOMTOM_API_KEY,
            container: mapElement.current,
            center: [lng, lat],
            zoom: 15,
            dragPan: true,
            interactive: true,
        });

        // Add controls (zoom +/-)
        mapInstance.current.addControl(new tt.NavigationControl());

        // Cleanup when unmount
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapInstance.current || !lat || !lng) return;

        const map = mapInstance.current;
        const position = [lng, lat];

        if (markerInstance.current) {
            markerInstance.current.remove();
        }

        const popup = new tt.Popup({ offset: 30, focusAfterOpen: false }).setText(address || "Vị trí sự kiện");

        const markerElement = document.createElement('div');
        markerElement.className = 'marker-icon';

        markerInstance.current = new tt.Marker()
            .setLngLat(position)
            .setPopup(popup)
            .addTo(map);

        markerInstance.current.togglePopup();

        map.flyTo({
            center: position,
            zoom: 15,
            speed: 1.5,
            curve: 1.5,
        });

    }, [lat, lng, address]);

    const handleGetDirections = () => {
        if (!lat || !lng) return;
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(googleMapsUrl, '_blank');
    };

    return (
        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-sm border border-slate-200">
            <div ref={mapElement} className="w-full h-full min-h-[240px]" />

            <div className="absolute bottom-3 right-3 z-[1000]">
                <Button
                    size="sm"
                    onClick={handleGetDirections}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg gap-2"
                >
                    <Navigation className="size-4" />
                    Chỉ đường
                </Button>
            </div>
        </div>
    );
};

export default Map;