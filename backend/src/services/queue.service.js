const pool = require('../config/db');

async function generateQueueNumber() {
  const today = new Date().toISOString().slice(0, 10);

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total 
     FROM queues 
     WHERE DATE(created_at) = ?`,
    [today]
  );

  const nextNumber = Number(rows[0].total) + 1;

  return `A${String(nextNumber).padStart(3, '0')}`;
}

function getEstimatedMinutesByPriority(priorityLevel) {
  const estimationMap = {
    light: 8,
    medium: 12,
    priority: 15,
    emergency: 0,
  };

  return estimationMap[priorityLevel] || 8;
}

function classifyPriorityByComplaint(complaint = '') {
  const text = complaint.toLowerCase();

  const emergencyKeywords = [
    'pingsan',
    'sesak',
    'kejang',
    'pendarahan',
    'jatuh dari tangga',
    'nyeri dada',
    'cedera kepala',
  ];

  const priorityKeywords = [
    'cedera',
    'kecelakaan',
    'demam tinggi',
    'muntah',
    'nyeri berat',
  ];

  const mediumKeywords = [
    'demam',
    'sakit perut',
    'pusing berat',
    'mual',
    'lemas',
  ];

  if (emergencyKeywords.some((keyword) => text.includes(keyword))) {
    return 'emergency';
  }

  if (priorityKeywords.some((keyword) => text.includes(keyword))) {
    return 'priority';
  }

  if (mediumKeywords.some((keyword) => text.includes(keyword))) {
    return 'medium';
  }

  return 'light';
}

async function calculateEstimatedWaitingMinutes() {
  const [rows] = await pool.query(
    `SELECT priority_level 
     FROM queues 
     WHERE DATE(created_at) = CURDATE()
     AND status IN ('waiting', 'called', 'on_the_way', 'checked_in', 'in_checkup')`
  );

  let totalMinutes = 0;

  for (const row of rows) {
    totalMinutes += getEstimatedMinutesByPriority(row.priority_level);
  }

  return totalMinutes;
}

module.exports = {
  generateQueueNumber,
  getEstimatedMinutesByPriority,
  classifyPriorityByComplaint,
  calculateEstimatedWaitingMinutes,
};