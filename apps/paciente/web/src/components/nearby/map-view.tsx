"use client";

import { useMemo } from "react";

import {
  type NearbyProvider,
  type GeoPoint,
  PROVIDER_TYPE_PIN_COLORS,
} from "@/lib/services/nearby-service";

interface MapViewProps {
  providers: NearbyProvider[];
  userLocation: GeoPoint;
  radiusKm: number;
  selectedId?: string | null;
  onSelectProvider: (provider: NearbyProvider) => void;
}

const SVG_SIZE = 400;
const PADDING = 40;

export function MapView({
  providers,
  userLocation,
  radiusKm,
  selectedId,
  onSelectProvider,
}: MapViewProps) {
  // Compute the bounding box and map coordinates
  const { points, userPoint, scale } = useMemo(() => {
    if (providers.length === 0) {
      return {
        points: [],
        userPoint: { x: SVG_SIZE / 2, y: SVG_SIZE / 2 },
        scale: 1,
      };
    }

    // Include user + all providers in bounds
    const allLats = [userLocation.lat, ...providers.map((p) => p.lat)];
    const allLngs = [userLocation.lng, ...providers.map((p) => p.lng)];

    const minLat = Math.min(...allLats);
    const maxLat = Math.max(...allLats);
    const minLng = Math.min(...allLngs);
    const maxLng = Math.max(...allLngs);

    // Add some margin
    const latRange = (maxLat - minLat) || 0.01;
    const lngRange = (maxLng - minLng) || 0.01;
    const margin = 0.2;

    const adjustedMinLat = minLat - latRange * margin;
    const adjustedMaxLat = maxLat + latRange * margin;
    const adjustedMinLng = minLng - lngRange * margin;
    const adjustedMaxLng = maxLng + lngRange * margin;

    const drawW = SVG_SIZE - PADDING * 2;
    const drawH = SVG_SIZE - PADDING * 2;

    const finalLatRange = adjustedMaxLat - adjustedMinLat;
    const finalLngRange = adjustedMaxLng - adjustedMinLng;

    const toSvg = (lat: number, lng: number) => ({
      x: PADDING + ((lng - adjustedMinLng) / finalLngRange) * drawW,
      y: PADDING + ((adjustedMaxLat - lat) / finalLatRange) * drawH, // flip Y
    });

    const mappedPoints = providers.map((p) => ({
      ...toSvg(p.lat, p.lng),
      provider: p,
    }));

    return {
      points: mappedPoints,
      userPoint: toSvg(userLocation.lat, userLocation.lng),
      scale: Math.min(drawW / finalLngRange, drawH / finalLatRange),
    };
  }, [providers, userLocation]);

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <svg
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="w-full aspect-square"
        role="img"
        aria-label="Mapa de proveedores cercanos"
      >
        {/* Background */}
        <rect width={SVG_SIZE} height={SVG_SIZE} fill="#f9fafb" />

        {/* Grid lines */}
        {Array.from({ length: 9 }).map((_, i) => {
          const pos = PADDING + ((SVG_SIZE - PADDING * 2) / 8) * i;
          return (
            <g key={i}>
              <line
                x1={pos}
                y1={PADDING}
                x2={pos}
                y2={SVG_SIZE - PADDING}
                stroke="#e5e7eb"
                strokeWidth={0.5}
              />
              <line
                x1={PADDING}
                y1={pos}
                x2={SVG_SIZE - PADDING}
                y2={pos}
                stroke="#e5e7eb"
                strokeWidth={0.5}
              />
            </g>
          );
        })}

        {/* User location pulse */}
        <circle
          cx={userPoint.x}
          cy={userPoint.y}
          r={12}
          fill="#10B981"
          fillOpacity={0.15}
        >
          <animate
            attributeName="r"
            from="8"
            to="18"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill-opacity"
            from="0.2"
            to="0"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx={userPoint.x}
          cy={userPoint.y}
          r={6}
          fill="#10B981"
          stroke="white"
          strokeWidth={2}
        />

        {/* Connection lines from user to providers */}
        {points.map((pt) => (
          <line
            key={`line-${pt.provider.type}-${pt.provider.id}`}
            x1={userPoint.x}
            y1={userPoint.y}
            x2={pt.x}
            y2={pt.y}
            stroke="#e5e7eb"
            strokeWidth={0.5}
            strokeDasharray="3,3"
          />
        ))}

        {/* Provider pins */}
        {points.map((pt) => {
          const isSelected =
            selectedId === `${pt.provider.type}-${pt.provider.id}`;
          const pinColor =
            PROVIDER_TYPE_PIN_COLORS[pt.provider.type] ?? "#6B7280";

          return (
            <g
              key={`pin-${pt.provider.type}-${pt.provider.id}`}
              onClick={() => onSelectProvider(pt.provider)}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={pt.provider.name}
            >
              {/* Selection ring */}
              {isSelected && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={12}
                  fill={pinColor}
                  fillOpacity={0.15}
                  stroke={pinColor}
                  strokeWidth={1}
                />
              )}
              {/* Pin drop shape */}
              <path
                d={`M ${pt.x} ${pt.y + 10}
                    C ${pt.x - 3} ${pt.y + 4}, ${pt.x - 8} ${pt.y - 2}, ${pt.x - 8} ${pt.y - 6}
                    C ${pt.x - 8} ${pt.y - 11}, ${pt.x - 4.5} ${pt.y - 15}, ${pt.x} ${pt.y - 15}
                    C ${pt.x + 4.5} ${pt.y - 15}, ${pt.x + 8} ${pt.y - 11}, ${pt.x + 8} ${pt.y - 6}
                    C ${pt.x + 8} ${pt.y - 2}, ${pt.x + 3} ${pt.y + 4}, ${pt.x} ${pt.y + 10}
                    Z`}
                fill={pinColor}
                stroke="white"
                strokeWidth={1.5}
              />
              <circle
                cx={pt.x}
                cy={pt.y - 6}
                r={3}
                fill="white"
              />
            </g>
          );
        })}

        {/* User label */}
        <text
          x={userPoint.x}
          y={userPoint.y + 20}
          textAnchor="middle"
          className="text-[8px] fill-gray-500 font-medium"
        >
          Tu ubicacion
        </text>
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 px-4 py-2.5 border-t border-gray-100 bg-gray-50">
        {Object.entries(PROVIDER_TYPE_PIN_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-[10px] text-gray-500 capitalize">
              {type === "medico"
                ? "Medicos"
                : type === "farmacia"
                  ? "Farmacias"
                  : type === "clinica"
                    ? "Clinicas"
                    : "Labs"}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-gray-500">Tu</span>
        </div>
      </div>
    </div>
  );
}
