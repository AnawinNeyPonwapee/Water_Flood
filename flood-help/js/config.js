const MAP_CENTER = [13.730034798318417, 100.77876873816697];
const MAP_ZOOM = 15;
const MAP_MIN_ZOOM = 6;
const USE_DEMO_DATA = false;
const THAILAND_BOUNDS = [
  [5.5, 97.3],
  [20.5, 105.7],
];
const STORAGE_KEY = "flood-help";

const NEEDS = {
  food: { icon: "fa-solid fa-utensils", label: "อาหาร/น้ำดื่ม" },
  med: { icon: "fa-kit-medical", label: "ยา/อุปกรณ์แพทย์" },
  boat: { icon: "fa-sailboat", label: "ต้องการเรืออพยพ" },
  bed: { icon: "fa-bed", label: "ผู้ป่วยติดเตียง/ผู้สูงอายุ" },
};

const STATUSES = {
  wait: "ต้องการความช่วยเหลือ",
  going: "มีคนกำลังไปช่วย",
  done: "ช่วยเหลือแล้ว",
};

const FILTERS = [
  ["all", "ทั้งหมด"],
  ["wait", "ยังรอช่วย"],
  ["going", "กำลังไปช่วย"],
  ["done", "ช่วยแล้ว"],
];
