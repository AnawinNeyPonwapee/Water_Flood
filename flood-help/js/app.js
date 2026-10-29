const state = {
  tab: "map", // 'map' หรือ 'help'
  filter: "all",
  selectedId: null,
  point: null, // ตำแหน่งที่เลือกในฟอร์ม {lat, lng}
  need: "food",
};

const panel = $("#panel");
const toast = $("#toast");
let lastPanelHtml = "";

const map = createMap({
  element: $("#map"),
  onSelect: (id) => state.tab === "map" && selectRequest(id, true),
  onPick: ({ lat, lng }) => state.tab === "help" && setPoint(lat, lng),
});

// ---------- วาดหน้าจอ ----------

function drawMapPart() {
  const requests = storage.getAll();
  map.sync(requests, state.selectedId);
  map.setPending(state.point);
  $("#hint").hidden = state.tab === "map";
  $("#waitCount").textContent = requests.filter(
    (r) => r.status === "wait",
  ).length;
}

function drawList() {
  const html = listHtml(storage.getAll(), state.filter, state.selectedId);
  if (html !== lastPanelHtml) {
    panel.innerHTML = html;
    lastPanelHtml = html;
  }
}

function drawTabs() {
  document.querySelectorAll(".tabs button").forEach((btn) => {
    btn.setAttribute(
      "aria-current",
      btn.dataset.tab === state.tab ? "page" : "false",
    );
  });
}

// ฟอร์มวาดแค่ตอนสลับแท็บ เพื่อไม่ให้ข้อความที่พิมพ์อยู่หาย
function drawAll() {
  drawTabs();
  drawMapPart();
  if (state.tab === "map") {
    drawList();
  } else {
    panel.innerHTML = formHtml(state.need, state.point);
    lastPanelHtml = "";
  }
}


function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  clearTimeout(showToast.hideTimer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
    showToast.hideTimer = setTimeout(() => {
      toast.hidden = true;
    }, 300);
  }, 2200);
}


// ---------- การกระทำต่างๆ ----------

function switchTab(tab) {
  state.tab = tab;
  state.point = null;
  state.selectedId = null;
  drawAll();
}

function selectRequest(id, fromMap = false) {
  state.selectedId = state.selectedId === id && !fromMap ? null : id;
  drawMapPart();
  drawList();

  const request = storage.getById(id);
  if (!request || state.selectedId === null) return;
  map.panTo(request.lat, request.lng);
  if (fromMap) {
    document
      .querySelector(`.card[data-id="${id}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

function setPoint(lat, lng) {
  state.point = { lat: +lat.toFixed(6), lng: +lng.toFixed(6) };
  map.setPending(state.point);
  const place = $("#place");
  place.textContent = placeLabel(state.point);
  place.classList.add("ok");
  showError("");
}

function showError(message) {
  const error = $("#error");
  if (error) error.textContent = message;
}

function locateUser() {
  if (!navigator.geolocation) {
    return showError("อุปกรณ์นี้ไม่รองรับการหาตำแหน่ง กรุณาแตะบนแผนที่แทน");
  }
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      map.zoomTo(coords.latitude, coords.longitude);
      setPoint(coords.latitude, coords.longitude);
    },
    () =>
      showError(
        "หาตำแหน่งไม่ได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง หรือแตะบนแผนที่แทน",
      ),
    { enableHighAccuracy: true, timeout: 10000 },
  );
}

function submitForm() {
  const phone = $("#phone").value.trim();
  if (!state.point)
    return showError("แตะแผนที่หรือกดใช้ตำแหน่งปัจจุบันก่อนส่ง");
  if (!phone)
    return showError("กรุณากรอกเบอร์โทรเพื่อให้ผู้ช่วยเหลือติดต่อได้");

  const request = storage.addRequest({
    lat: state.point.lat,
    lng: state.point.lng,
    type: state.need,
    people: Math.max(1, Number($("#people").value) || 1),
    note: $("#note").value.trim(),
    phone,
  });

  Object.assign(state, {
    tab: "map",
    filter: "all",
    point: null,
    selectedId: request.id,
  });
  drawAll();
  showToast("ส่งคำขอความช่วยเหลือแล้ว");
}

function chooseNeed(target) {
  state.need = target.dataset.need;
  document.querySelectorAll('[data-action="need"]').forEach((btn) => {
    btn.setAttribute("aria-pressed", btn === target);
  });
}

function toggleBasemap() {
  state.basemap = state.basemap === "satellite" ? "streets" : "satellite";
  map.setBasemap(state.basemap);
  // ปุ่มบอกมุมมองที่จะสลับไป
  $("#basemapBtn span").textContent =
    state.basemap === "satellite" ? "แผนที่ถนน" : "ภาพดาวเทียม";
}

function openDirections(id) {
  const { lat, lng } = storage.getById(id);
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    "_blank",
    "noopener",
  );
}

// ---------- รับ event (ใช้ที่เดียวทั้งหน้า) ----------

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const { action, id, tab, filter } = target.dataset;
  const requestId = Number(id);

  if (action.startsWith("status-")) {
    storage.setStatus(requestId, action.slice("status-".length));
    drawMapPart();
    drawList();
    return showToast("อัปเดตสถานะแล้ว");
  }

  switch (action) {
    case "tab":
      return switchTab(tab);
    case "filter":
      state.filter = filter;
      return drawList();
    case "select":
      return selectRequest(requestId);
    case "need":
      return chooseNeed(target);
    case "locate":
      return locateUser();
    case "submit":
      return submitForm();
    case "navigate":
      return openDirections(requestId);
    case "remove":
      storage.removeRequest(requestId);
      state.selectedId = null;
      drawMapPart();
      return drawList();
    case "reset":
      storage.resetRequests();
      Object.assign(state, { selectedId: null, point: null });
      drawAll();
      return showToast("Reset successfully");
  }
});

document.addEventListener("submit", (event) => event.preventDefault());

drawAll();
