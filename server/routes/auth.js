const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const db = getDatabase();
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Failed to create user' });
        }

        const token = jwt.sign(
          { id: this.lastID, username, role: 'user' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          message: 'User created successfully',
          token,
          user: { id: this.lastID, username, email, role: 'user' }
        });

        db.close();
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const db = getDatabase();

    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      async (err, user) => {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          db.close();
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
          db.close();
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        });

        db.close();
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
