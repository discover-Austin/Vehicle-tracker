const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');
const { broadcastDetection } = require('../services/websocket');

const router = express.Router();

// Get all detections for a search
router.get('/search/:searchId', authenticateToken, (req, res) => {
  const db = getDatabase();

  db.all(
    `SELECT d.*, c.name as camera_name, c.address as camera_address
     FROM detections d
     JOIN cameras c ON d.camera_id = c.id
     WHERE d.search_id = ?
     ORDER BY d.timestamp DESC`,
    [req.params.searchId],
    (err, detections) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to fetch detections' });
      }

      res.json({ detections });
      db.close();
    }
  );
});

// Get single detection
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDatabase();

  db.get(
    `SELECT d.*, c.name as camera_name, c.address as camera_address,
            s.license_plate, s.make, s.model, s.color
     FROM detections d
     JOIN cameras c ON d.camera_id = c.id
     JOIN searches s ON d.search_id = s.id
     WHERE d.id = ?`,
    [req.params.id],
    (err, detection) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to fetch detection' });
      }

      if (!detection) {
        db.close();
        return res.status(404).json({ error: 'Detection not found' });
      }

      res.json({ detection });
      db.close();
    }
  );
});

// Create new detection (simulated or from actual detection system)
router.post('/', authenticateToken, (req, res) => {
  const { search_id, camera_id, confidence, location_lat, location_lng, image_url, metadata } = req.body;

  if (!search_id || !camera_id || !confidence || !location_lat || !location_lng) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const db = getDatabase();
  const id = `DET_${uuidv4()}`;

  db.run(
    `INSERT INTO detections (id, search_id, camera_id, confidence, location_lat, location_lng, image_url, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, search_id, camera_id, confidence, location_lat, location_lng, image_url, JSON.stringify(metadata)],
    function(err) {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to create detection' });
      }

      db.get(
        `SELECT d.*, c.name as camera_name, c.address as camera_address
         FROM detections d
         JOIN cameras c ON d.camera_id = c.id
         WHERE d.id = ?`,
        [id],
        (err, detection) => {
          if (detection) {
            // Broadcast to WebSocket clients
            broadcastDetection(detection);
          }

          res.status(201).json({ detection });
          db.close();
        }
      );
    }
  );
});

// Get detection statistics
router.get('/stats/summary', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { search_id, start_date, end_date } = req.query;

  let query = `
    SELECT
      COUNT(*) as total_detections,
      AVG(confidence) as avg_confidence,
      COUNT(DISTINCT camera_id) as cameras_used,
      COUNT(DISTINCT search_id) as searches_detected,
      MIN(timestamp) as first_detection,
      MAX(timestamp) as last_detection
    FROM detections
    WHERE 1=1
  `;
  const params = [];

  if (search_id) {
    query += ' AND search_id = ?';
    params.push(search_id);
  }
  if (start_date) {
    query += ' AND timestamp >= ?';
    params.push(start_date);
  }
  if (end_date) {
    query += ' AND timestamp <= ?';
    params.push(end_date);
  }

  db.get(query, params, (err, stats) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }

    res.json({ stats: stats || {} });
    db.close();
  });
});

// Simulate detection (for testing/demo purposes)
router.post('/simulate/:searchId', authenticateToken, (req, res) => {
  const db = getDatabase();
  const searchId = req.params.searchId;

  // Get random camera
  db.get('SELECT * FROM cameras ORDER BY RANDOM() LIMIT 1', [], (err, camera) => {
    if (err || !camera) {
      db.close();
      return res.status(500).json({ error: 'Failed to simulate detection' });
    }

    const id = `DET_${uuidv4()}`;
    const confidence = 0.75 + Math.random() * 0.24;

    db.run(
      `INSERT INTO detections (id, search_id, camera_id, confidence, location_lat, location_lng)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, searchId, camera.id, confidence, camera.location_lat, camera.location_lng],
      function(err) {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Failed to create detection' });
        }

        db.get(
          `SELECT d.*, c.name as camera_name, c.address as camera_address
           FROM detections d
           JOIN cameras c ON d.camera_id = c.id
           WHERE d.id = ?`,
          [id],
          (err, detection) => {
            if (detection) {
              broadcastDetection(detection);
            }

            res.status(201).json({ detection });
            db.close();
          }
        );
      }
    );
  });
});

module.exports = router;
