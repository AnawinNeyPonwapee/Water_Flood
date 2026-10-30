function button(label, action, { id, style = "", iconName } = {}) {
  const idAttr = id ? ` data-id="${id}"` : "";
  return `<button class="btn ${style}" data-action="${action}"${idAttr}>${iconName ? icon(iconName) : ""}${label}</button>`;
}

function card(r, open) {
  const need = NEEDS[r.type];
  const phone =
    r.status === "going"
      ? `${icon("fa-phone")}${escapeHtml(r.phone)}`
      : `${icon("fa-lock")}เบอร์โทรจะแสดงเมื่อมีผู้รับงาน`;

  const buttons = open
    ? `
    <div class="card-btns">
      ${r.status === "wait" ? button("ฉันไปช่วยได้", "status-going", { id: r.id, style: "btn-dark", iconName: "fa-hand" }) : ""}
      ${r.status !== "done" ? button("ได้รับความช่วยเหลือแล้ว", "status-done", { id: r.id, iconName: "fa-check" }) : ""}
      ${r.status !== "wait" ? button("ยังต้องการอยู่", "status-wait", { id: r.id, iconName: "fa-rotate-left" }) : ""}
      ${button("นำทาง", "navigate", { id: r.id, iconName: "fa-diamond-turn-right" })}
      ${button("ลบ", "remove", { id: r.id, style: "btn-red", iconName: "fa-trash" })}
    </div>`
    : "";

  return `
    <article class="card${open ? " open" : ""}" data-action="select" data-id="${r.id}">
      <div class="card-top">
        <h2 class="card-title">${icon(need.icon)}${need.label}</h2>
        <span class="badge ${r.status}">${STATUSES[r.status]}</span>
      </div>
      ${r.note ? `<p class="card-note">${escapeHtml(r.note)}</p>` : ""}
      <div class="card-info">
        <span>${icon("fa-users")}${r.people} คน</span>
        <span>${icon("fa-clock")}${timeAgo(r.createdAt)}</span>
        ${open ? `<span>${phone}</span>` : ""}
      </div>
      ${buttons}
    </article>`;
}

function listHtml(requests, filter, selectedId) {
  const shown = requests
    .filter((r) => filter === "all" || r.status === filter)
    .sort((a, b) => b.createdAt - a.createdAt);

  const chips = FILTERS.map(
    ([key, label]) =>
      `<button class="chip" data-action="filter" data-filter="${key}" aria-pressed="${filter === key}">${label}</button>`,
  ).join("");

  const cards = shown.length
    ? shown.map((r) => card(r, r.id === selectedId)).join("")
    : '<p class="empty">ยังไม่มีคำขอ<br>ไปที่เมนู “ขอความช่วยเหลือ” เพื่อเพิ่มคำขอ</p>';

  return `<div class="chips">${chips}</div>${cards}`;
}

function placeLabel(point) {
  return point
    ? `เลือกตำแหน่งแล้ว (${point.lat}, ${point.lng})`
    : "แตะบนแผนที่ด้านบน หรือกดปุ่มใช้ตำแหน่งปัจจุบัน";
}

function formHtml(need, point) {
  const choices = Object.entries(NEEDS)
    .map(
      ([key, n]) =>
        `<button type="button" class="choice" data-action="need" data-need="${key}" aria-pressed="${need === key}">${icon(n.icon)}${n.label}</button>`,
    )
    .join("");

  return `
    <form id="helpForm" novalidate>
      <div class="field">
        <span class="label">ต้องการให้ช่วยเหลืออะไร</span>
        <div class="choices">${choices}</div>
      </div>
      <div class="field">
        <label class="label" for="people">จำนวนคนที่ต้องการความช่วยเหลือ</label>
        <input class="input" id="people" type="number" min="1" value="1" inputmode="numeric">
      </div>
      <div class="field">
        <label class="label" for="phone">เบอร์โทรติดต่อ</label>
        <input class="input" id="phone" type="tel" inputmode="tel" placeholder="เช่น 081-234-5678">
      </div>
      <div class="field">
        <label class="label" for="note">รายละเอียดเพิ่มเติม</label>
        <textarea class="input" id="note" rows="3" placeholder="เช่น น้ำสูงเท่าไร มีใครต้องดูแลเป็นพิเศษ"></textarea>
      </div>
      <div class="field">
        <span class="label">ตำแหน่งของคุณ</span>
        <div class="place${point ? " ok" : ""}" id="place">${placeLabel(point)}</div>
        ${button("ตำแหน่งปัจจุบันของฉัน", "locate", { iconName: "fa-location-crosshairs" })}
      </div>
      <p class="error" id="error" role="alert"></p>
      ${button("ส่งคำขอความช่วยเหลือ", "submit", { style: "btn-dark btn-full", iconName: "fa-paper-plane" })}
    </form>`;
}
