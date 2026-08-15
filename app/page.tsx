"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type {
  CircleMarker as LeafletCircleMarker,
  LayerGroup as LeafletLayerGroup,
  Map as LeafletMap,
} from "leaflet";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  Eye,
  FileText,
  Layers3,
  LocateFixed,
  LockKeyhole,
  LogIn,
  MapPin,
  Megaphone,
  Menu,
  Navigation,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trees,
  UploadCloud,
  UserRoundCheck,
  X,
} from "lucide-react";

type LayerKey = "asal" | "kemaskini" | "aduan";

type WartaRecord = {
  id: string;
  lot: string;
  warta: string;
  presint: string;
  kategori: string;
  status: "Warta Asal" | "Warta Kemaskini" | "Aduan Awam";
  layer: LayerKey;
  date: string;
  lat: number;
  lng: number;
};

const RECORDS: WartaRecord[] = [
  { id: "GW-PJ-001", lot: "PT 1201", warta: "P.U. (B) 214/2025", presint: "Presint 1", kategori: "Rizab Kerajaan", status: "Warta Asal", layer: "asal", date: "18 Dis 2025", lat: 2.9254, lng: 101.6868 },
  { id: "GW-PJ-002", lot: "PT 3456", warta: "P.U. (B) 071/2026", presint: "Presint 2", kategori: "Rizab Jalan", status: "Warta Kemaskini", layer: "kemaskini", date: "4 Mac 2026", lat: 2.9342, lng: 101.6817 },
  { id: "GW-PJ-003", lot: "Lot 882", warta: "P.U. (B) 306/2024", presint: "Presint 3", kategori: "Kawasan Lapang", status: "Warta Asal", layer: "asal", date: "12 Nov 2024", lat: 2.9394, lng: 101.6997 },
  { id: "GW-PJ-004", lot: "PT 9107", warta: "P.U. (B) 118/2026", presint: "Presint 4", kategori: "Rizab Institusi", status: "Warta Asal", layer: "asal", date: "20 Mei 2026", lat: 2.9051, lng: 101.6882 },
  { id: "GW-PJ-005", lot: "Lot 2088", warta: "P.U. (B) 019/2026", presint: "Presint 8", kategori: "Rizab Sungai", status: "Warta Kemaskini", layer: "kemaskini", date: "29 Jan 2026", lat: 2.9164, lng: 101.6849 },
  { id: "GW-PJ-006", lot: "PT 778", warta: "Aduan #AP-0063", presint: "Presint 9", kategori: "Siasatan Pencerobohan", status: "Aduan Awam", layer: "aduan", date: "8 Ogo 2026", lat: 2.9282, lng: 101.6746 },
  { id: "GW-PJ-007", lot: "Lot 1108", warta: "P.U. (B) 401/2023", presint: "Presint 11", kategori: "Kawasan Hijau", status: "Warta Asal", layer: "asal", date: "15 Sep 2023", lat: 2.9512, lng: 101.6738 },
  { id: "GW-PJ-008", lot: "PT 1415", warta: "Aduan #AP-0068", presint: "Presint 14", kategori: "Siasatan Struktur", status: "Aduan Awam", layer: "aduan", date: "12 Ogo 2026", lat: 2.9377, lng: 101.7167 },
  { id: "GW-PJ-009", lot: "PT 1502", warta: "P.U. (B) 154/2026", presint: "Presint 15", kategori: "Rizab Utiliti", status: "Warta Kemaskini", layer: "kemaskini", date: "1 Jul 2026", lat: 2.944, lng: 101.7208 },
  { id: "GW-PJ-010", lot: "Lot 1810", warta: "Aduan #AP-0057", presint: "Presint 18", kategori: "Siasatan Tanah", status: "Aduan Awam", layer: "aduan", date: "3 Ogo 2026", lat: 2.8964, lng: 101.6792 },
];

const PUTRAJAYA_BOUNDARY: [number, number][] = [
  [2.968, 101.666], [2.962, 101.704], [2.951, 101.726],
  [2.924, 101.724], [2.892, 101.707], [2.876, 101.685],
  [2.889, 101.663], [2.916, 101.657], [2.947, 101.658],
];

const LAYER_META: Record<LayerKey, { label: string; color: string; description: string }> = {
  asal: { label: "Warta Asal", color: "#0f766e", description: "Rekod pewartaan aktif" },
  kemaskini: { label: "Warta Kemaskini", color: "#f97316", description: "Rekod yang telah dipinda" },
  aduan: { label: "Plot Aduan Awam", color: "#c0264f", description: "Lokasi aduan demonstrasi" },
};

export default function Home() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerGroupsRef = useRef<Partial<Record<LayerKey, LeafletLayerGroup>>>({});
  const markerRefs = useRef<Map<string, LeafletCircleMarker>>(new Map());
  const complaintMarkerRef = useRef<LeafletCircleMarker | null>(null);
  const visibleLayersRef = useRef<Record<LayerKey, boolean>>({ asal: true, kemaskini: true, aduan: true });

  const [now, setNow] = useState<Date | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [layerOpen, setLayerOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searched, setSearched] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WartaRecord | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<Record<LayerKey, boolean>>({ asal: true, kemaskini: true, aduan: true });
  const [form, setForm] = useState({ name: "", email: "", phone: "", coordinate: "", details: "" });
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  visibleLayersRef.current = visibleLayers;

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];
    return RECORDS.filter((record) =>
      [record.lot, record.warta, record.presint, record.kategori].join(" ").toLowerCase().includes(query),
    );
  }, [searchTerm]);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;
    let cancelled = false;
    void import("leaflet").then((L) => {
      if (cancelled || !mapElementRef.current || mapRef.current) return;
      const map = L.map(mapElementRef.current, {
        center: [2.9264, 101.6964], zoom: 13, zoomControl: false, attributionControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.polygon(PUTRAJAYA_BOUNDARY, {
        color: "#0b5b7a", weight: 2, dashArray: "7 7", fillColor: "#31a6c4", fillOpacity: 0.06,
      }).addTo(map).bindTooltip("Sempadan indikatif Putrajaya", { sticky: true, direction: "top" });

      (Object.keys(LAYER_META) as LayerKey[]).forEach((layerKey) => {
        const group = L.layerGroup();
        RECORDS.filter((record) => record.layer === layerKey).forEach((record) => {
          const marker = L.circleMarker([record.lat, record.lng], {
            radius: layerKey === "aduan" ? 8 : 7, color: "#ffffff", weight: 2,
            fillColor: LAYER_META[layerKey].color, fillOpacity: 1,
          }).bindPopup(`<div class="map-popup"><span>${record.status}</span><strong>${record.lot}</strong><p>${record.warta}</p><small>${record.presint} · ${record.kategori}</small></div>`);
          marker.addTo(group);
          markerRefs.current.set(record.id, marker);
        });
        layerGroupsRef.current[layerKey] = group;
        if (visibleLayersRef.current[layerKey]) group.addTo(map);
      });

      map.on("click", (event: { latlng: { lat: number; lng: number } }) => {
        const coordinate = `${event.latlng.lat.toFixed(6)}, ${event.latlng.lng.toFixed(6)}`;
        setForm((current) => ({ ...current, coordinate }));
        if (complaintMarkerRef.current) {
          complaintMarkerRef.current.setLatLng(event.latlng);
        } else {
          complaintMarkerRef.current = L.circleMarker(event.latlng, {
            radius: 9, color: "#ffffff", weight: 3, fillColor: "#c0264f", fillOpacity: 1,
          }).addTo(map).bindTooltip("Titik aduan baharu", { direction: "top" });
        }
      });
      mapRef.current = map;
      window.setTimeout(() => map.invalidateSize(), 100);
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRefs.current.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    (Object.keys(visibleLayers) as LayerKey[]).forEach((layerKey) => {
      const group = layerGroupsRef.current[layerKey];
      if (!group) return;
      if (visibleLayers[layerKey] && !map.hasLayer(group)) group.addTo(map);
      if (!visibleLayers[layerKey] && map.hasLayer(group)) map.removeLayer(group);
    });
  }, [visibleLayers]);

  useEffect(() => {
    if (!selectedRecord || !mapRef.current) return;
    mapRef.current.setView([selectedRecord.lat, selectedRecord.lng], 16, { animate: true });
    window.setTimeout(() => markerRefs.current.get(selectedRecord.id)?.openPopup(), 300);
  }, [selectedRecord]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setSearched(true);
    if (filteredRecords.length === 1) setSelectedRecord(filteredRecords[0]);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setNotice("Pelayar ini tidak menyokong fungsi lokasi.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const coordinate = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
        setForm((current) => ({ ...current, coordinate }));
        mapRef.current?.setView([coords.latitude, coords.longitude], 16);
        setNotice("Lokasi semasa telah dipaparkan pada peta.");
      },
      () => setNotice("Kebenaran lokasi tidak diberikan. Klik peta untuk memilih lokasi."),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  function refineDetails() {
    const original = form.details.trim();
    if (!original) {
      setNotice("Masukkan ringkasan aduan sebelum menggunakan fungsi Perkemas.");
      return;
    }
    setForm((current) => ({
      ...current,
      details: `Saya ingin melaporkan kemungkinan pencerobohan tanah di lokasi yang dinyatakan. Pemerhatian di tapak: ${original}. Mohon pihak PPTGWPPj menjalankan semakan status lot dan pemeriksaan lanjut.`,
    }));
    setNotice("Teks aduan telah diperkemas secara demonstrasi.");
  }

  function submitComplaint(event: FormEvent) {
    event.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.coordinate || !form.details) {
      setNotice("Lengkapkan semua medan wajib dan pilih koordinat pada peta.");
      return;
    }
    setNotice("Aduan demonstrasi berjaya disemak. Sambungan pangkalan data belum diaktifkan.");
  }

  const dateText = now ? new Intl.DateTimeFormat("ms-MY", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kuala_Lumpur",
  }).format(now) : "Memuatkan...";
  const timeText = now ? new Intl.DateTimeFormat("ms-MY", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Asia/Kuala_Lumpur",
  }).format(now) : "--:--:--";

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true"><span>eP</span></div>
          <div>
            <div className="brand-line"><strong>ePantau Putrajaya</strong><span>PROTOTAIP 1.0</span></div>
            <p>Pejabat Tanah dan Galian Wilayah Persekutuan Putrajaya</p>
          </div>
        </div>
        <div className="top-actions">
          <div className="system-time" title="Masa Malaysia">
            <Clock3 size={18} />
            <div><strong>{dateText}</strong><span>{timeText}</span></div>
          </div>
          <div className="status-pills" aria-label="Status sistem">
            <span className="status-ring"><i /></span>
            <span className="status-dot online" title="Peta tersedia" />
            <span className="status-dot secure" title="Sambungan selamat" />
          </div>
          <button className="admin-button" onClick={() => setAdminOpen(true)}>
            <LogIn size={17} /><span>Portal Pentadbir</span>
          </button>
          <button className="mobile-menu" onClick={() => setPanelOpen((open) => !open)} aria-label="Buka panel semakan dan aduan">
            {panelOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <section className="workspace">
        <div className="map-stage">
          <div ref={mapElementRef} className="map-canvas" aria-label="Peta interaktif Putrajaya" />
          <div className="map-tint" aria-hidden="true" />
          <div className="map-toolbar">
            <button className={layerOpen ? "map-tool active" : "map-tool"} onClick={() => setLayerOpen((open) => !open)} aria-expanded={layerOpen}>
              <Layers3 size={19} /><span>Lapisan</span>
            </button>
            <button className="map-tool" onClick={useCurrentLocation}>
              <Navigation size={18} /><span>Lokasi saya</span>
            </button>
          </div>

          {layerOpen && (
            <div className="layer-card">
              <div className="layer-heading">
                <div><span>Data geospatial</span><strong>Lapisan peta</strong></div>
                <button onClick={() => setLayerOpen(false)} aria-label="Tutup lapisan"><X size={17} /></button>
              </div>
              {(Object.keys(LAYER_META) as LayerKey[]).map((layerKey) => (
                <label className="layer-row" key={layerKey}>
                  <input type="checkbox" checked={visibleLayers[layerKey]} onChange={() => setVisibleLayers((current) => ({ ...current, [layerKey]: !current[layerKey] }))} />
                  <i style={{ backgroundColor: LAYER_META[layerKey].color }} />
                  <span><strong>{LAYER_META[layerKey].label}</strong><small>{LAYER_META[layerKey].description}</small></span>
                </label>
              ))}
            </div>
          )}

          <div className="map-summary">
            <div className="summary-label"><Eye size={16} /><span>Ringkasan semasa</span></div>
            <div className="summary-stats">
              <div><strong>32</strong><span>Lot Warta</span></div>
              <div><strong>5</strong><span>Kemas Kini</span></div>
              <div><strong>3</strong><span>Aduan Aktif</span></div>
            </div>
            <div className="legend-row">
              {(Object.keys(LAYER_META) as LayerKey[]).map((layerKey) => (
                <span key={layerKey}><i style={{ backgroundColor: LAYER_META[layerKey].color }} />{LAYER_META[layerKey].label}</span>
              ))}
            </div>
          </div>
          <div className="data-badge"><ShieldCheck size={15} />Data demonstrasi · Bukan rujukan rasmi</div>
        </div>

        <aside className={panelOpen ? "side-panel open" : "side-panel"}>
          <div className="panel-scroll">
            <section className="panel-card search-card">
              <div className="card-heading">
                <div className="heading-icon blue"><Search size={18} /></div>
                <div><span>Semakan awam</span><h2>Status Lot Warta</h2></div>
              </div>
              <form className="search-form" onSubmit={handleSearch}>
                <div className="input-with-icon">
                  <Search size={17} />
                  <input value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setSearched(false); }} placeholder="No. lot, no. warta atau presint" aria-label="Carian lot warta" />
                </div>
                <button className="primary-button" type="submit">Semak rekod <ChevronRight size={17} /></button>
              </form>
              <button className="location-button" type="button" onClick={useCurrentLocation}><LocateFixed size={17} />Gunakan Lokasi Saya Semasa</button>
              {searched && (
                <div className="search-results" aria-live="polite">
                  <div className="result-count">{filteredRecords.length ? `${filteredRecords.length} rekod ditemui` : "Tiada rekod sepadan"}</div>
                  {filteredRecords.slice(0, 4).map((record) => (
                    <button type="button" key={record.id} className="result-item" onClick={() => setSelectedRecord(record)}>
                      <i style={{ backgroundColor: LAYER_META[record.layer].color }} />
                      <span><strong>{record.lot}</strong><small>{record.presint} · {record.warta}</small></span>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="panel-card complaint-card">
              <div className="card-heading">
                <div className="heading-icon orange"><Megaphone size={18} /></div>
                <div><span>Saluran maklum balas</span><h2>Aduan Pencerobohan</h2></div>
              </div>
              <p className="helper-copy">Klik lokasi pada peta, lengkapkan butiran dan sertakan bukti berkaitan.</p>
              <form className="complaint-form" onSubmit={submitComplaint}>
                <div className="field-grid">
                  <label><span>Nama pengadu *</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nama penuh" /></label>
                  <label><span>E-mel *</span><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="nama@contoh.my" /></label>
                  <label><span>No. telefon *</span><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="01X-XXXXXXX" /></label>
                  <label><span>Koordinat *</span><div className="coordinate-field"><MapPin size={16} /><input readOnly value={form.coordinate} placeholder="Klik lokasi pada peta" /></div></label>
                </div>
                <label className="details-field">
                  <span>Perincian aduan *</span>
                  <textarea value={form.details} onChange={(event) => setForm({ ...form, details: event.target.value })} placeholder="Terangkan pemerhatian, struktur atau aktiviti yang disyaki..." rows={4} />
                  <button type="button" className="ai-button" onClick={refineDetails}><Sparkles size={14} /> Perkemas</button>
                </label>
                <label className="upload-zone">
                  <input type="file" multiple accept="image/*,.pdf" onChange={(event) => setFileNames(Array.from(event.target.files ?? []).map((file) => file.name))} />
                  <UploadCloud size={22} />
                  <span><strong>{fileNames.length ? `${fileNames.length} fail dipilih` : "Muat naik gambar atau PDF"}</strong><small>{fileNames.length ? fileNames.join(", ") : "Maksimum 10 MB setiap fail"}</small></span>
                </label>
                <div className="form-actions">
                  <button type="submit" className="submit-button"><Send size={17} /> Semak Aduan</button>
                  <button type="button" className="reset-button" onClick={() => { setForm({ name: "", email: "", phone: "", coordinate: "", details: "" }); setFileNames([]); setNotice(""); }}>
                    <RotateCcw size={16} /><span>Set Semula</span>
                  </button>
                </div>
              </form>
            </section>
            <div className="panel-footer"><span><BarChart3 size={15} /> Akses demo: 1,284</span><span>Kemas kini: 13 Ogo 2026</span></div>
          </div>
        </aside>
      </section>

      {notice && (
        <div className="toast" role="status"><CheckCircle2 size={19} /><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Tutup mesej"><X size={16} /></button></div>
      )}

      {adminOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setAdminOpen(false)}>
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-top"><div className="modal-symbol"><LockKeyhole size={24} /></div><button onClick={() => setAdminOpen(false)} aria-label="Tutup portal pentadbir"><X size={19} /></button></div>
            <span className="eyebrow">Modul fasa seterusnya</span>
            <h2 id="admin-title">Portal Pentadbir ePantau</h2>
            <p>Portal ini akan mengurus rekod warta, siasatan aduan, dokumen sokongan dan analitik operasi melalui kawalan akses berperanan.</p>
            <div className="admin-features">
              <div><Database size={18} /><span><strong>Pangkalan data</strong><small>Rekod lot, warta dan audit</small></span></div>
              <div><UserRoundCheck size={18} /><span><strong>SSO / MyDigital ID</strong><small>Akses pegawai yang disahkan</small></span></div>
              <div><FileText size={18} /><span><strong>Laporan operasi</strong><small>Eksport PDF dan papan pemuka</small></span></div>
              <div><Building2 size={18} /><span><strong>Integrasi dalaman</strong><small>Kesediaan sambungan sistem agensi</small></span></div>
            </div>
            <div className="modal-note"><Trees size={17} /> Prototaip ini tidak menyimpan maklumat log masuk atau aduan.</div>
            <button className="modal-close" onClick={() => setAdminOpen(false)}>Faham</button>
          </section>
        </div>
      )}
    </main>
  );
}
