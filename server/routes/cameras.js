const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/init');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all cameras
router.get('/', (req, res) => {
  const db = getDatabase();

  db.all('SELECT * FROM cameras ORDER BY created_at DESC', [], (err, cameras) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Failed to fetch cameras' });
    }

    res.json({ cameras });
    db.close();
  });
});

// Get single camera
router.get('/:id', (req, res) => {
  const db = getDatabase();

  db.get('SELECT * FROM cameras WHERE id = ?', [req.params.id], (err, camera) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Failed to fetch camera' });
    }

    if (!camera) {
      db.close();
      return res.status(404).json({ error: 'Camera not found' });
    }

    res.json({ camera });
    db.close();
  });
});

// Create new camera (admin only)
router.post('/', authenticateToken, authorizeRole('admin'), (req, res) => {
  const { name, location_lat, location_lng, address, description } = req.body;

  if (!name || !location_lat || !location_lng) {
    return res.status(400).json({ error: 'Name and location are required' });
  }

  const db = getDatabase();
  const id = `CAM_${uuidv4().substring(0, 8).toUpperCase()}`;

  db.run(
    `INSERT INTO cameras (id, name, location_lat, location_lng, address, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, location_lat, location_lng, address, description],
    function(err) {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to create camera' });
      }

      db.get('SELECT * FROM cameras WHERE id = ?', [id], (err, camera) => {
        res.status(201).json({ camera });
        db.close();
      });
    }
  );
});

// Update camera (admin only)
router.put('/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  const { name, location_lat, location_lng, status, address, description } = req.body;
  const db = getDatabase();

  const updates = [];
  const values = [];

  if (name) {
    updates.push('name = ?');
    values.push(name);
  }
  if (location_lat) {
    updates.push('location_lat = ?');
    values.push(location_lat);
  }
  if (location_lng) {
    updates.push('location_lng = ?');
    values.push(location_lng);
  }
  if (status) {
    updates.push('status = ?');
    values.push(status);
  }
  if (address !== undefined) {
    updates.push('address = ?');
    values.push(address);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }

  if (updates.length === 0) {
    db.close();
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.params.id);

  db.run(
    `UPDATE cameras SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function(err) {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to update camera' });
      }

      if (this.changes === 0) {
        db.close();
        return res.status(404).json({ error: 'Camera not found' });
      }

      db.get('SELECT * FROM cameras WHERE id = ?', [req.params.id], (err, camera) => {
        res.json({ camera });
        db.close();
      });
    }
  );
});

// Delete camera (admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  const db = getDatabase();

  db.run('DELETE FROM cameras WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Failed to delete camera' });
    }

    if (this.changes === 0) {
      db.close();
      return res.status(404).json({ error: 'Camera not found' });
    }

    res.json({ message: 'Camera deleted successfully' });
    db.close();
  });
});

// Get camera statistics
router.get('/:id/stats', (req, res) => {
  const db = getDatabase();

  db.get(
    `SELECT
      COUNT(d.id) as total_detections,
      AVG(d.confidence) as avg_confidence,
      MIN(d.timestamp) as first_detection,
      MAX(d.timestamp) as last_detection
     FROM cameras c
     LEFT JOIN detections d ON c.id = d.camera_id
     WHERE c.id = ?
     GROUP BY c.id`,
    [req.params.id],
    (err, stats) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to fetch statistics' });
      }

      res.json({ stats: stats || { total_detections: 0 } });
      db.close();
    }
  );
});

module.exports = router;
