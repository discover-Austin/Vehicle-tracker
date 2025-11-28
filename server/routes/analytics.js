const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard overview statistics
router.get('/dashboard', authenticateToken, (req, res) => {
  const db = getDatabase();

  const queries = {
    totalSearches: 'SELECT COUNT(*) as count FROM searches',
    activeSearches: 'SELECT COUNT(*) as count FROM searches WHERE status = "active"',
    totalDetections: 'SELECT COUNT(*) as count FROM detections',
    activeCameras: 'SELECT COUNT(*) as count FROM cameras WHERE status = "active"',
    todayDetections: `SELECT COUNT(*) as count FROM detections WHERE DATE(timestamp) = DATE('now')`,
    avgConfidence: 'SELECT AVG(confidence) as avg FROM detections'
  };

  const stats = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.get(query, [], (err, result) => {
      if (!err && result) {
        stats[key] = result.count !== undefined ? result.count : result.avg;
      } else {
        stats[key] = 0;
      }

      completed++;
      if (completed === total) {
        res.json({ stats });
        db.close();
      }
    });
  });
});

// Get detection trends over time
router.get('/trends/detections', authenticateToken, (req, res) => {
  const { period = '7d' } = req.query;
  const db = getDatabase();

  let dateGroup;
  let dateFilter;

  switch(period) {
    case '24h':
      dateGroup = "strftime('%Y-%m-%d %H:00', timestamp)";
      dateFilter = "timestamp >= datetime('now', '-24 hours')";
      break;
    case '7d':
      dateGroup = "DATE(timestamp)";
      dateFilter = "timestamp >= datetime('now', '-7 days')";
      break;
    case '30d':
      dateGroup = "DATE(timestamp)";
      dateFilter = "timestamp >= datetime('now', '-30 days')";
      break;
    case '1y':
      dateGroup = "strftime('%Y-%m', timestamp)";
      dateFilter = "timestamp >= datetime('now', '-1 year')";
      break;
    default:
      dateGroup = "DATE(timestamp)";
      dateFilter = "timestamp >= datetime('now', '-7 days')";
  }

  db.all(
    `SELECT
      ${dateGroup} as period,
      COUNT(*) as count,
      AVG(confidence) as avg_confidence
     FROM detections
     WHERE ${dateFilter}
     GROUP BY period
     ORDER BY period ASC`,
    [],
    (err, trends) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to fetch trends' });
      }

      res.json({ trends });
      db.close();
    }
  );
});

// Get top cameras by detection count
router.get('/top-cameras', authenticateToken, (req, res) => {
  const { limit = 10 } = req.query;
  const db = getDatabase();

  db.all(
    `SELECT
      c.id,
      c.name,
      c.location_lat,
      c.location_lng,
      COUNT(d.id) as detection_count,
      AVG(d.confidence) as avg_confidence
     FROM cameras c
     LEFT JOIN detections d ON c.id = d.camera_id
     GROUP BY c.id
     ORDER BY detection_count DESC
     LIMIT ?`,
    [parseInt(limit)],
    (err, cameras) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to fetch camera statistics' });
      }

      res.json({ cameras });
      db.close();
    }
  );
});

// Get heatmap data for map visualization
router.get('/heatmap', authenticateToken, (req, res) => {
  const { start_date, end_date } = req.query;
  const db = getDatabase();

  let query = `
    SELECT
      location_lat,
      location_lng,
      COUNT(*) as intensity
    FROM detections
    WHERE 1=1
  `;
  const params = [];

  if (start_date) {
    query += ' AND timestamp >= ?';
    params.push(start_date);
  }
  if (end_date) {
    query += ' AND timestamp <= ?';
    params.push(end_date);
  }

  query += ' GROUP BY location_lat, location_lng';

  db.all(query, params, (err, heatmapData) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Failed to fetch heatmap data' });
    }

    res.json({ heatmapData });
    db.close();
  });
});

// Get search success rate
router.get('/search-success-rate', authenticateToken, (req, res) => {
  const db = getDatabase();

  db.all(
    `SELECT
      s.id,
      s.license_plate,
      s.status,
      s.created_at,
      COUNT(d.id) as detection_count,
      CASE WHEN COUNT(d.id) > 0 THEN 1 ELSE 0 END as has_detections
     FROM searches s
     LEFT JOIN detections d ON s.id = d.search_id
     GROUP BY s.id`,
    [],
    (err, searches) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to calculate success rate' });
      }

      const totalSearches = searches.length;
      const successfulSearches = searches.filter(s => s.has_detections).length;
      const successRate = totalSearches > 0 ? (successfulSearches / totalSearches) * 100 : 0;

      res.json({
        totalSearches,
        successfulSearches,
        failedSearches: totalSearches - successfulSearches,
        successRate: successRate.toFixed(2)
      });
      db.close();
    }
  );
});

// Get recent activity feed
router.get('/activity', authenticateToken, (req, res) => {
  const { limit = 50 } = req.query;
  const db = getDatabase();

  db.all(
    `SELECT
      'detection' as type,
      d.id,
      d.timestamp,
      d.camera_id,
      c.name as camera_name,
      s.license_plate,
      d.confidence
     FROM detections d
     JOIN cameras c ON d.camera_id = c.id
     JOIN searches s ON d.search_id = s.id
     ORDER BY d.timestamp DESC
     LIMIT ?`,
    [parseInt(limit)],
    (err, activities) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to fetch activity' });
      }

      res.json({ activities });
      db.close();
    }
  );
});

module.exports = router;
