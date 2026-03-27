import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { Link } from "@tanstack/react-router";
import { Layers, MapPin, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGetIssues } from "../hooks/useQueries";
import type { Issue } from "../hooks/useQueries";

// Fix default marker icons broken by webpack/vite asset handling
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

(L.Icon.Default.prototype as any)._getIconUrl = undefined;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const CATEGORY_COLORS: Record<string, string> = {
  StreetLight: "#FFD166",
  Trash: "#00C9B1",
  RoadDamage: "#FF6B35",
  Water: "#0096C7",
  Other: "#8B8FA8",
};

const CATEGORY_LABELS: Record<string, string> = {
  StreetLight: "Street Light",
  Trash: "Trash/Waste",
  RoadDamage: "Road Damage",
  Water: "Water/Drain",
  Other: "Other",
};

function getStatusClass(status: string) {
  if (status === "Open") return "status-open";
  if (status === "InProgress") return "status-inprogress";
  return "status-resolved";
}

function createMarkerIcon(category: string, index: number) {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  const html = `
    <div style="animation: marker-drop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${index * 60}ms both">
      <div style="
        width: 32px; height: 32px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid rgba(255,255,255,0.3);
        box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 16px ${color}55;
        display: flex; align-items: center; justify-content: center;
      ">
        <div style="transform: rotate(45deg); width: 8px; height: 8px; background: rgba(255,255,255,0.9); border-radius: 50%;"></div>
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: "",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -44],
  });
}

function buildPopupHtml(issue: Issue): string {
  const catColor = CATEGORY_COLORS[issue.category] || CATEGORY_COLORS.Other;
  const catLabel = CATEGORY_LABELS[issue.category] || issue.category;
  const statusClass = getStatusClass(issue.status);
  const statusLabel =
    issue.status === "InProgress" ? "In Progress" : issue.status;
  const createdDate = new Date(
    Number(issue.createdAt) / 1_000_000,
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const shortDesc =
    issue.description.length > 100
      ? `${issue.description.slice(0, 100)}...`
      : issue.description;
  const photoHtml = issue.photoUrl
    ? `<img src="${issue.photoUrl}" alt="" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:10px;"/>`
    : "";

  return `
    <div style="min-width:220px; font-family:'DM Sans',sans-serif;">
      ${photoHtml}
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <span style="width:10px;height:10px;border-radius:50%;background:${catColor};flex-shrink:0;"></span>
        <span style="font-size:11px;color:#9ca3af;">${catLabel}</span>
      </div>
      <h3 style="margin:0 0 8px;font-family:'Pacifico',cursive;font-weight:400;font-size:15px;color:#f0e6d3;">${issue.title}</h3>
      <p style="margin:0 0 10px;font-size:12px;color:#9ca3af;line-height:1.4;">${shortDesc}</p>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span class="${statusClass}" style="font-size:11px;padding:2px 8px;border-radius:99px;font-weight:600;">${statusLabel}</span>
        <div style="display:flex;align-items:center;gap:8px;font-size:11px;color:#9ca3af;">
          <span>&#128077; ${issue.upvotes}</span>
          <span>${createdDate}</span>
        </div>
      </div>
    </div>
  `;
}

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<any>(null);
  const [heatmapEnabled, setHeatmapEnabled] = useState(true);
  const { data: issues = [] } = useGetIssues();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [40.7128, -74.006],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      },
    ).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    setTimeout(() => map.invalidateSize(), 100);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 14);
        },
        () => {},
        { timeout: 5000 },
      );
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const markersLayer = markersLayerRef.current;
    if (markersLayer) markersLayer.clearLayers();

    if (heatLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (issues.length === 0) return;

    for (const [idx, issue] of issues.entries()) {
      const icon = createMarkerIcon(issue.category, idx);
      const marker = L.marker([issue.lat, issue.lng], { icon });
      marker.bindPopup(buildPopupHtml(issue as Issue));
      markersLayer?.addLayer(marker);
    }

    if (heatmapEnabled && typeof (L as any).heatLayer !== "undefined") {
      const heatData = issues.map((issue: Issue) => [
        issue.lat,
        issue.lng,
        0.6,
      ]);
      heatLayerRef.current = (L as any)
        .heatLayer(heatData, {
          radius: 35,
          blur: 25,
          maxZoom: 17,
          gradient: { 0.2: "#00C9B1", 0.5: "#FFD166", 1.0: "#FF6B35" },
        })
        .addTo(mapInstanceRef.current);
    }
  }, [issues, heatmapEnabled]);

  return (
    <div className="relative w-full map-wrapper">
      <div
        ref={mapRef}
        className="w-full h-full"
        data-ocid="map.canvas_target"
      />

      {/* Map Legend */}
      <div
        className="absolute bottom-6 left-4 z-[400] glass-card p-3 space-y-2"
        style={{ minWidth: "160px" }}
        data-ocid="map.panel"
      >
        <p
          className="text-xs font-semibold text-white/60 uppercase tracking-wider"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          Categories
        </p>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: CATEGORY_COLORS[key] }}
            />
            <span
              className="text-xs"
              style={{ color: "#f0e6d3", opacity: 0.7 }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Heatmap toggle */}
      <button
        type="button"
        onClick={() => setHeatmapEnabled((v) => !v)}
        className={`absolute top-4 right-14 z-[400] flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          heatmapEnabled
            ? "border"
            : "glass-card text-white/60 hover:text-white"
        }`}
        style={
          heatmapEnabled
            ? {
                background: "rgba(255,107,53,0.2)",
                border: "1px solid rgba(255,107,53,0.3)",
                color: "#FF6B35",
              }
            : {}
        }
        data-ocid="map.toggle"
      >
        <Layers className="w-4 h-4" />
        <span className="hidden sm:inline">Heatmap</span>
      </button>

      {/* FAB - desktop only */}
      <Link
        to="/report"
        className="absolute bottom-6 right-4 z-[400] w-14 h-14 rounded-full transition-all duration-200 items-center justify-center shadow-coral coral-glow hidden md:flex"
        style={{ background: "#FF6B35" }}
        data-ocid="map.report.button"
      >
        <Plus className="w-6 h-6 text-white" />
      </Link>

      {/* Issue count badge */}
      {issues.length > 0 && (
        <div
          className="absolute top-4 left-4 z-[400] glass-card px-3 py-2 flex items-center gap-2"
          data-ocid="map.card"
        >
          <MapPin className="w-4 h-4" style={{ color: "#FF6B35" }} />
          <span
            className="text-sm font-medium"
            style={{ color: "#f0e6d3", opacity: 0.8 }}
          >
            {issues.length} issue{issues.length !== 1 ? "s" : ""} reported
          </span>
        </div>
      )}
    </div>
  );
}
