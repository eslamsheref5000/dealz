"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { io } from "socket.io-client";
import { scaleLinear } from "d3-scale";

import {
    ComposableMap,
    Geographies,
    Geography,
    Marker
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function Watchtower() {
    const [socket, setSocket] = useState<any>(null);
    const [stats, setStats] = useState({ activeUsers: 0, totalViews: 0 });
    const [logs, setLogs] = useState<any[]>([]);
    const [markers, setMarkers] = useState<any[]>([]);

    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
        const newSocket = io(API_URL);

        newSocket.on("connect", () => {
            console.log("Connected to Watchtower");
            addLog("System", "Connected to Real-time Network");
        });

        newSocket.on("visitor_update", (data: any) => {
            setStats(prev => ({ ...prev, activeUsers: data.count }));
        });

        newSocket.on("new_action", (data: any) => {
            addLog("Action", `${data.details} (${data.city}, ${data.country})`);

            // Add marker for map
            if (data.lat && data.lng) {
                const newMarker = {
                    name: data.city,
                    coordinates: [data.lng, data.lat],
                    timestamp: Date.now()
                };
                setMarkers(prev => [...prev.slice(-30), newMarker]); // Keep last 30
            }

            setStats(prev => ({ ...prev, totalViews: prev.totalViews + 1 }));
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const addLog = (type: string, message: string) => {
        setLogs(prev => [{ id: Date.now(), type, message, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 19)]);
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen p-6 font-mono">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                <h1 className="text-3xl font-black text-red-500 tracking-wider">THE WATCHTOWER <span className="text-xs text-gray-500 font-normal">v1.0</span></h1>
                <div className="flex gap-8">
                    <div className="text-center">
                        <p className="text-xs text-gray-400 uppercase">Active Users</p>
                        <p className="text-4xl font-bold text-green-400 animate-pulse">{stats.activeUsers}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-400 uppercase">Live Actions</p>
                        <p className="text-4xl font-bold text-blue-400">{stats.totalViews}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Section */}
                <div className="lg:col-span-2 bg-gray-800 rounded-xl overflow-hidden border border-gray-700 relative h-[600px]">
                    <div className="absolute top-4 left-4 z-10 bg-black/50 px-3 py-1 rounded text-xs">Waiting for signals...</div>
                    <ComposableMap projection="geoMercator">
                        <Geographies geography={geoUrl}>
                            {({ geographies }: { geographies: any[] }) =>
                                geographies.map((geo) => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill="#2d3748"
                                        stroke="#1a202c"
                                        strokeWidth={0.5}
                                    />
                                ))
                            }
                        </Geographies>
                        {markers.map((marker, idx) => (
                            <Marker key={idx} coordinates={marker.coordinates as [number, number]}>
                                <circle r={8} fill="#F56565" fillOpacity={0.6} className="animate-ping" />
                                <circle r={4} fill="#E53E3E" />
                            </Marker>
                        ))}
                    </ComposableMap>
                </div>

                {/* Logs Section */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-700 bg-gray-750">
                        <h2 className="font-bold text-yellow-500">🔴 LIVE FEED</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-600">
                        {logs.map((log) => (
                            <div key={log.id} className="text-xs p-2 border-l-2 border-blue-500 bg-gray-900/50 rounded animate-fade-in-down">
                                <span className="text-gray-500">[{log.time}]</span> <span className="font-bold text-blue-400">{log.type}:</span> {log.message}
                            </div>
                        ))}
                        {logs.length === 0 && <p className="text-center text-gray-600 mt-10">No activity detected yet...</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
