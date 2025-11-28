const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper function to convert to CSV
function jsonToCSV(data, headers) {
  if (!data || data.length === 0) return '';

  const csvHeaders = headers || Object.keys(data[0]);
  const csvRows = [csvHeaders.join(',')];

  data.forEach(row => {
    const values = csvHeaders.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma or newline
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

// Export detections for a search
router.get('/detections/:searchId', authenticateToken, (req, res) => {
  const { format = 'json' } = req.query;
  const db = getDatabase();

  db.all(
    `SELECT
      d.id,
      d.search_id,
      s.license_plate,
      s.make,
      s.model,
      s.color,
      d.camera_id,
      c.name as camera_name,
      c.address as camera_address,
      d.timestamp,
      d.confidence,
      d.location_lat,
      d.location_lng
     FROM detections d
     JOIN searches s ON d.search_id = s.id
     JOIN cameras c ON d.camera_id = c.id
     WHERE d.search_id = ?
     ORDER BY d.timestamp DESC`,
    [req.params.searchId],
    (err, detections) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to export detections' });
      }

      if (format === 'csv') {
        const csv = jsonToCSV(detections);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=detections_${req.params.searchId}.csv`);
        res.send(csv);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=detections_${req.params.searchId}.json`);
        res.json({ detections });
      }

      db.close();
    }
  );
});

// Export all searches
router.get('/searches', authenticateToken, (req, res) => {
  const { format = 'json' } = req.query;
  const db = getDatabase();

  let query = 'SELECT * FROM searches';
  const params = [];

  if (req.user.role !== 'admin') {
    query += ' WHERE user_id = ?';
    params.push(req.user.id);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, searches) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Failed to export searches' });
    }

    if (format === 'csv') {
      const csv = jsonToCSV(searches);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=searches.csv');
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=searches.json');
      res.json({ searches });
    }

    db.close();
  });
});

// Export comprehensive report
router.get('/report', authenticateToken, (req, res) => {
  const { search_id, start_date, end_date, format = 'json' } = req.query;
  const db = getDatabase();

  const report = {
    generated_at: new Date().toISOString(),
    generated_by: req.user.username,
    filters: { search_id, start_date, end_date }
  };

  // Build queries based on filters
  let detectionsQuery = `
    SELECT
      d.*,
      s.license_plate,
      s.make,
      s.model,
      c.name as camera_name
    FROM detections d
    JOIN searches s ON d.search_id = s.id
    JOIN cameras c ON d.camera_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (search_id) {
    detectionsQuery += ' AND d.search_id = ?';
    params.push(search_id);
  }
  if (start_date) {
    detectionsQuery += ' AND d.timestamp >= ?';
    params.push(start_date);
  }
  if (end_date) {
    detectionsQuery += ' AND d.timestamp <= ?';
    params.push(end_date);
  }

  db.all(detectionsQuery, params, (err, detections) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Failed to generate report' });
    }

    report.summary = {
      total_detections: detections.length,
      unique_cameras: [...new Set(detections.map(d => d.camera_id))].length,
      avg_confidence: detections.reduce((sum, d) => sum + d.confidence, 0) / (detections.length || 1),
      date_range: {
        start: detections.length > 0 ? detections[detections.length - 1].timestamp : null,
        end: detections.length > 0 ? detections[0].timestamp : null
      }
    };

    report.detections = detections;

    if (format === 'csv') {
      const csv = jsonToCSV(detections);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=report.json');
      res.json(report);
    }

    db.close();
  });
});

// Export camera data
router.get('/cameras', authenticateToken, authorizeRole('admin'), (req, res) => {
  const { format = 'json' } = req.query;
  const db = getDatabase();

  db.all('SELECT * FROM cameras ORDER BY name', [], (err, cameras) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Failed to export cameras' });
    }

    if (format === 'csv') {
      const csv = jsonToCSV(cameras);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=cameras.csv');
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=cameras.json');
      res.json({ cameras });
    }

    db.close();
  });
});

const { authorizeRole } = require('../middleware/auth');

module.exports = router;
