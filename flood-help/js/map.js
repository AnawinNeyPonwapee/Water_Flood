// L คือตัวแปรของ Leaflet 
const IMAGERY_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const LABELS_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

function makeIcon(className, iconName) {
  return L.divIcon({
    className: "",
    html: `<div class="pin ${className}"><i class="fa-solid ${iconName}"></i></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function createMap({ element, onSelect, onPick }) {
  const map = L.map(element, {
    minZoom: MAP_MIN_ZOOM,
    maxBounds: THAILAND_BOUNDS, // ลากออกนอกประเทศไทยไม่ได้
    maxBoundsViscosity: 1.0,
  }).setView(MAP_CENTER, MAP_ZOOM);

  // ไม่โหลดรูปใหม่ระหว่างซูม เพื่อให้ลื่นบนมือถือ
  const tileOptions = {
    maxZoom: 19,
    maxNativeZoom: 18,
    updateWhenZooming: false,
    keepBuffer: 3,
    bounds: THAILAND_BOUNDS,
  };

  // ภาพดาวเทียม + ชื่อสถานที่ซ้อนทับ
  L.tileLayer(IMAGERY_URL, {
    ...tileOptions,
    zIndex: 1,
    attribution: "Tiles © Esri — Esri, Maxar, Earthstar Geographics",
  }).addTo(map);

  L.tileLayer(LABELS_URL, { ...tileOptions, zIndex: 2 }).addTo(map);

  map.on("click", (e) => onPick(e.latlng));

  // เก็บหมุดไว้ตาม id เพื่ออัปเดตเฉพาะอันที่เปลี่ยน ไม่ต้องวาดใหม่ทั้งหมด
  const markers = new Map();
  let pendingMarker = null;

  function sync(requests, selectedId) {
    const ids = new Set(requests.map((r) => r.id));

    for (const [id, item] of markers) {
      if (!ids.has(id)) {
        item.marker.remove();
        markers.delete(id);
      }
    }

    for (const r of requests) {
      const selected = r.id === selectedId;
      const key = `${r.type}-${r.status}-${selected}`;
      const item = markers.get(r.id);
      const icon = makeIcon(
        `${r.status}${selected ? " selected" : ""}`,
        NEEDS[r.type].icon,
      );

      if (!item) {
        const marker = L.marker([r.lat, r.lng], {
          icon,
          zIndexOffset: selected ? 1000 : 0,
        })
          .on("click", () => onSelect(r.id))
          .addTo(map);
        markers.set(r.id, { marker, key });
      } else if (item.key !== key) {
        item.marker.setIcon(icon);
        item.marker.setZIndexOffset(selected ? 1000 : 0);
        item.key = key;
      }
    }
  }

  function setPending(point) {
    if (pendingMarker) {
      pendingMarker.remove();
      pendingMarker = null;
    }
    if (point) {
      pendingMarker = L.marker([point.lat, point.lng], {
        icon: makeIcon("pending", "fa-location-dot"),
        zIndexOffset: 2000,
      }).addTo(map);
    }
  }

  return {
    sync,
    setPending,
    panTo: (lat, lng) => map.panTo([lat, lng], { duration: 0.4 }),
    zoomTo: (lat, lng) => map.setView([lat, lng], 17),
  };
}
