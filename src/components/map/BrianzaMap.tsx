"use client";

import { useState, useMemo, useId } from "react";
import Link from "next/link";
import { Delaunay } from "d3-delaunay";
import type { Municipality } from "@/lib/types";
import { Phone, Mail, CalendarCheck } from "lucide-react";

interface Props {
  municipalities: Municipality[];
  upcomingEventsByMunicipality?: Record<string, number>;
}

// Traced from the real administrative map of Provincia di Monza e Brianza
const PROVINCE_BOUNDARY: [number, number][] = [
  // North peak — Veduggio con Colzano
  [9.260, 45.755],
  [9.275, 45.750],
  [9.290, 45.740],
  // NE — Renate, Besana Brianza
  [9.310, 45.730],
  [9.330, 45.720],
  [9.350, 45.705],
  // East — Correzzana, Camparada
  [9.330, 45.685],
  [9.340, 45.670],
  // NE — Usmate Velate, Ronco Briantino
  [9.370, 45.665],
  [9.400, 45.675],
  [9.420, 45.680],
  // East — Bernareggio
  [9.430, 45.660],
  [9.450, 45.655],
  // Far east — Cornate d'Adda
  [9.480, 45.650],
  [9.500, 45.640],
  [9.500, 45.620],
  // SE — Busnago, Roncello
  [9.490, 45.610],
  [9.480, 45.600],
  [9.460, 45.595],
  // East — Mezzago, Bellusco, Sulbiate
  [9.440, 45.590],
  [9.430, 45.580],
  // SE — Ornago, Cavenago
  [9.420, 45.575],
  [9.400, 45.570],
  [9.380, 45.565],
  // South — Caponago, Agrate Brianza
  [9.370, 45.555],
  [9.350, 45.550],
  [9.340, 45.545],
  // South — Concorezzo, Burago
  [9.320, 45.550],
  [9.300, 45.545],
  // South — Brugherio (southernmost)
  [9.280, 45.540],
  [9.260, 45.530],
  [9.240, 45.535],
  // SW — Monza south
  [9.220, 45.540],
  [9.200, 45.545],
  // South — Muggiò, Nova Milanese
  [9.180, 45.548],
  [9.160, 45.555],
  // SW — Varedo, Limbiate
  [9.140, 45.558],
  [9.120, 45.565],
  [9.100, 45.570],
  // West — Ceriano Laghetto (far west)
  [9.075, 45.580],
  [9.055, 45.595],
  [9.040, 45.610],
  // NW — Cogliate, Misinto
  [9.040, 45.630],
  [9.045, 45.645],
  // NW — Lazzate
  [9.050, 45.660],
  [9.055, 45.680],
  [9.070, 45.690],
  // North — Lentate sul Seveso
  [9.090, 45.690],
  [9.110, 45.685],
  [9.120, 45.680],
  // North — Barlassina, Seveso, Meda
  [9.130, 45.670],
  [9.140, 45.665],
  [9.160, 45.670],
  [9.170, 45.675],
  // North — Giussano, Briosco
  [9.190, 45.690],
  [9.200, 45.700],
  [9.210, 45.710],
  [9.220, 45.720],
  // North — back to Veduggio
  [9.230, 45.735],
  [9.240, 45.745],
  [9.250, 45.752],
];

const SVG_W = 700;
const SVG_H = 600;
const PAD = 20;

const allLngs = PROVINCE_BOUNDARY.map((p) => p[0]);
const allLats = PROVINCE_BOUNDARY.map((p) => p[1]);
const MIN_LNG = Math.min(...allLngs) - 0.01;
const MAX_LNG = Math.max(...allLngs) + 0.01;
const MIN_LAT = Math.min(...allLats) - 0.01;
const MAX_LAT = Math.max(...allLats) + 0.01;

function toSvg(lng: number, lat: number): [number, number] {
  const x = PAD + ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * (SVG_W - 2 * PAD);
  const y = PAD + ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * (SVG_H - 2 * PAD);
  return [x, y];
}

export function BrianzaMap({ municipalities, upcomingEventsByMunicipality = {} }: Props) {
  const [hovered, setHovered] = useState<Municipality | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const clipId = useId();

  const { voronoiPaths, boundaryPoints, centers, validMunicipalities } =
    useMemo(() => {
      const valid = municipalities.filter((m) => m.lat && m.lng);
      const svgPoints: [number, number][] = valid.map((m) =>
        toSvg(m.lng!, m.lat!)
      );
      const bndPoints = PROVINCE_BOUNDARY.map((p) => toSvg(p[0], p[1]));

      const delaunay = Delaunay.from(svgPoints);
      const voronoi = delaunay.voronoi([-50, -50, SVG_W + 50, SVG_H + 50]);

      const paths: string[] = [];
      for (let i = 0; i < valid.length; i++) {
        const cell = voronoi.cellPolygon(i);
        if (!cell) {
          paths.push("");
          continue;
        }
        const d =
          "M" +
          cell
            .map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`)
            .join("L") +
          "Z";
        paths.push(d);
      }

      return {
        voronoiPaths: paths,
        boundaryPoints: bndPoints,
        centers: svgPoints,
        validMunicipalities: valid,
      };
    }, [municipalities]);

  const boundaryPointsStr = boundaryPoints
    .map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(" ");

  return (
    <div className="relative mx-auto max-w-4xl">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-auto"
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <clipPath id={clipId}>
            <polygon points={boundaryPointsStr} />
          </clipPath>
          <filter id="map-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation="4"
              floodColor="#1B3A6B"
              floodOpacity="0.15"
            />
          </filter>
        </defs>

        {/* Province shadow */}
        <polygon
          points={boundaryPointsStr}
          fill="#e8edf4"
          filter="url(#map-shadow)"
        />

        {/* Voronoi cells clipped to province shape */}
        <g clipPath={`url(#${clipId})`}>
          {validMunicipalities.map((m, i) => {
            const path = voronoiPaths[i];
            if (!path) return null;
            const isHovered = hovered?.id === m.id;
            const isSede = m.has_sede;

            return (
              <Link key={m.id} href={`/comuni/${m.slug}`}>
                <g
                  onMouseEnter={(e) => {
                    setHovered(m);
                    const svg = e.currentTarget.closest("svg");
                    if (svg) {
                      const rect = svg.getBoundingClientRect();
                      setTooltipPos({
                        x: (centers[i][0] / SVG_W) * rect.width,
                        y: (centers[i][1] / SVG_H) * rect.height,
                      });
                    }
                  }}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer"
                >
                  <path
                    d={path}
                    fill={
                      isHovered
                        ? isSede
                          ? "#2d5aa0"
                          : "#b8c9e0"
                        : isSede
                        ? "#1B3A6B"
                        : "#dfe6f0"
                    }
                    stroke="white"
                    strokeWidth="1.5"
                    className="transition-colors duration-150"
                  />
                </g>
              </Link>
            );
          })}

          {/* Labels on top of cells */}
          {validMunicipalities.map((m, i) => {
            const isSede = m.has_sede;
            return (
              <text
                key={`label-${m.id}`}
                x={centers[i][0]}
                y={centers[i][1]}
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none select-none"
                fill={isSede ? "white" : "#475569"}
                fontSize={
                  m.name.length > 18
                    ? "6"
                    : m.name.length > 12
                    ? "7"
                    : m.name.length > 8
                    ? "8"
                    : "9"
                }
                fontWeight={isSede ? "600" : "400"}
              >
                {m.name}
              </text>
            );
          })}
        </g>

        {/* Province border on top */}
        <polygon
          points={boundaryPointsStr}
          fill="none"
          stroke="#1B3A6B"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border bg-white px-3 py-2 shadow-lg min-w-[180px]"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 70,
            transform: "translateX(-50%)",
          }}
        >
          <p className="font-semibold text-sm text-[#1B3A6B]">
            {hovered.name}
          </p>
          {(upcomingEventsByMunicipality[hovered.id] ?? 0) > 0 && (
            <p className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
              <CalendarCheck className="h-3 w-3" />
              {upcomingEventsByMunicipality[hovered.id] === 1
                ? "Evento programmato"
                : `${upcomingEventsByMunicipality[hovered.id]} eventi programmati`}
            </p>
          )}
          {hovered.contact_phone && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Phone className="h-3 w-3" />
              {hovered.contact_phone}
            </p>
          )}
          {hovered.contact_email && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {hovered.contact_email}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
