// เก็บคำขอไว้ใน localStorage จะต่อ backend ทีหลัง 
function read() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {

  }
}

let requests = read();

const getAll = () => requests;
const getById = (id) => requests.find((r) => r.id === id);

function addRequest(data) {
  const request = {
    ...data,
    id: Date.now(),
    status: "wait",
    createdAt: Date.now(),
  };
  requests = [...requests, request];
  write(requests);
  return request;
}

function setStatus(id, status) {
  requests = requests.map((r) => (r.id === id ? { ...r, status } : r));
  write(requests);
}

function removeRequest(id) {
  requests = requests.filter((r) => r.id !== id);
  write(requests);
}

function resetRequests() {
  requests = [];
  write(requests);
}

const storage = {
  getAll,
  getById,
  addRequest,
  setStatus,
  removeRequest,
  resetRequests,
};
