const defaultProjects = require("./data/projects");

const pool = null;
const contactMessages = [];

function projectPriority(item) {
  const type = String(item.type || "").toLowerCase();
  if (type.includes("cloud") || type.includes("sre") || type.includes("backend") || type.includes("devops")) {
    return 0;
  }
  if (type.includes("research") || type.includes("publication")) {
    return 1;
  }
  return 2;
}

function sortProjects(items) {
  return [...items].sort((a, b) => {
    const pr = projectPriority(a) - projectPriority(b);
    if (pr !== 0) return pr;
    const yearDiff = Number(b.year || 0) - Number(a.year || 0);
    if (yearDiff !== 0) return yearDiff;
    return Number(a.id || 0) - Number(b.id || 0);
  });
}

async function getProjects(filters = {}) {
  if (!filters.type) return sortProjects(defaultProjects);
  return sortProjects(defaultProjects.filter((item) => item.type.toLowerCase() === String(filters.type).toLowerCase()));
}

async function saveContactMessage(payload) {
  const record = {
    id: Date.now(),
    ...payload,
    created_at: new Date().toISOString(),
    persisted: false
  };
  contactMessages.push(record);
  return record;
}

module.exports = {
  getProjects,
  saveContactMessage,
  pool
};
