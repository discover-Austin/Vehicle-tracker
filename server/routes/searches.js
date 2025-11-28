const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all searches
router.get('/', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { status, priority } = req.query;

  let query = 'SELECT * FROM searches';
  const params = [];

  // Filter by user role
  if (req.user.role !== 'admin') {
    query += ' WHERE user_id = ?';
    params.push(req.user.id);
  }

  // Additional filters
  if (status) {
    query += params.length > 0 ? ' AND status = ?' : ' WHERE status = ?';
    params.push(status);
  }
  if (priority) {
    query += params.length > 0 ? ' AND priority = ?' : ' WHERE priority = ?';
    params.push(priority);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, searches) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Failed to fetch searches' });
    }

    res.json({ searches });
    db.close();
  });
});

// Get single search
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDatabase();

  let query = 'SELECT * FROM searches WHERE id = ?';
  const params = [req.params.id];

  if (req.user.role !== 'admin') {
    query += ' AND user_id = ?';
    params.push(req.user.id);
  }

  db.get(query, params, (err, search) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Failed to fetch search' });
    }

    if (!search) {
      db.close();
      return res.status(404).json({ error: 'Search not found' });
    }

    res.json({ search });
    db.close();
  });
});

// Create new search
router.post('/', authenticateToken, (req, res) => {
  const { license_plate, make, model, color, year, priority, notes } = req.body;

  if (!license_plate) {
    return res.status(400).json({ error: 'License plate is required' });
  }

  const db = getDatabase();
  const id = `SEARCH_${uuidv4()}`;

  db.run(
    `INSERT INTO searches (id, user_id, license_plate, make, model, color, year, priority, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, req.user.id, license_plate, make, model, color, year, priority || 'normal', notes],
    function(err) {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to create search' });
      }

      db.get('SELECT * FROM searches WHERE id = ?', [id], (err, search) => {
        res.status(201).json({ search });
        db.close();
      });
    }
  );
});

// Update search
router.put('/:id', authenticateToken, (req, res) => {
  const { license_plate, make, model, color, year, status, priority, notes } = req.body;
  const db = getDatabase();

  const updates = [];
  const values = [];

  if (license_plate) {
    updates.push('license_plate = ?');
    values.push(license_plate);
  }
  if (make !== undefined) {
    updates.push('make = ?');
    values.push(make);
  }
  if (model !== undefined) {
    updates.push('model = ?');
    values.push(model);
  }
  if (color !== undefined) {
    updates.push('color = ?');
    values.push(color);
  }
  if (year !== undefined) {
    updates.push('year = ?');
    values.push(year);
  }
  if (status) {
    updates.push('status = ?');
    values.push(status);
  }
  if (priority) {
    updates.push('priority = ?');
    values.push(priority);
  }
  if (notes !== undefined) {
    updates.push('notes = ?');
    values.push(notes);
  }

  if (updates.length === 0) {
    db.close();
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');

  let query = `UPDATE searches SET ${updates.join(', ')} WHERE id = ?`;
  values.push(req.params.id);

  if (req.user.role !== 'admin') {
    query += ' AND user_id = ?';
    values.push(req.user.id);
  }

  db.run(query, values, function(err) {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Failed to update search' });
    }

    if (this.changes === 0) {
      db.close();
      return res.status(404).json({ error: 'Search not found or unauthorized' });
    }

    db.get('SELECT * FROM searches WHERE id = ?', [req.params.id], (err, search) => {
      res.json({ search });
      db.close();
    });
  });
});

// Delete search
router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDatabase();

  let query = 'DELETE FROM searches WHERE id = ?';
  const params = [req.params.id];

  if (req.user.role !== 'admin') {
    query += ' AND user_id = ?';
    params.push(req.user.id);
  }

  db.run(query, params, function(err) {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Failed to delete search' });
    }

    if (this.changes === 0) {
      db.close();
      return res.status(404).json({ error: 'Search not found or unauthorized' });
    }

    res.json({ message: 'Search deleted successfully' });
    db.close();
  });
});

module.exports = router;
