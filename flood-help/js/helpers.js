const $ = (selector) => document.querySelector(selector);

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const icon = (name) => `<i class="fa-solid ${name}"></i>`;

function timeAgo(time) {
  const minutes = Math.round((Date.now() - time) / 60000);
  if (minutes < 1) return "เมื่อสักครู่";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  return `${Math.round(minutes / 60)} ชม.ที่แล้ว`;
}
