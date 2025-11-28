const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/vehicle_tracker.db';

function getDatabase() {
  // Ensure data directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err);
    }
  });
}

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME
        )
      `);

      // Cameras table
      db.run(`
        CREATE TABLE IF NOT EXISTS cameras (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          location_lat REAL NOT NULL,
          location_lng REAL NOT NULL,
          status TEXT DEFAULT 'active',
          address TEXT,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Searches table
      db.run(`
        CREATE TABLE IF NOT EXISTS searches (
          id TEXT PRIMARY KEY,
          user_id INTEGER,
          license_plate TEXT NOT NULL,
          make TEXT,
          model TEXT,
          color TEXT,
          year TEXT,
          status TEXT DEFAULT 'active',
          priority TEXT DEFAULT 'normal',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Detections table
      db.run(`
        CREATE TABLE IF NOT EXISTS detections (
          id TEXT PRIMARY KEY,
          search_id TEXT NOT NULL,
          camera_id TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          confidence REAL NOT NULL,
          location_lat REAL NOT NULL,
          location_lng REAL NOT NULL,
          image_url TEXT,
          metadata TEXT,
          FOREIGN KEY (search_id) REFERENCES searches(id),
          FOREIGN KEY (camera_id) REFERENCES cameras(id)
        )
      `);

      // Alerts table
      db.run(`
        CREATE TABLE IF NOT EXISTS alerts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          detection_id TEXT NOT NULL,
          type TEXT NOT NULL,
          message TEXT NOT NULL,
          severity TEXT DEFAULT 'info',
          acknowledged BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (detection_id) REFERENCES detections(id)
        )
      `);

      // Analytics/Stats table
      db.run(`
        CREATE TABLE IF NOT EXISTS analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          search_id TEXT,
          metric_type TEXT NOT NULL,
          metric_value REAL NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (search_id) REFERENCES searches(id)
        )
      `);

      // Create indexes for better performance
      db.run('CREATE INDEX IF NOT EXISTS idx_detections_search ON detections(search_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_detections_camera ON detections(camera_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_detections_timestamp ON detections(timestamp)');
      db.run('CREATE INDEX IF NOT EXISTS idx_searches_user ON searches(user_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_searches_status ON searches(status)');

      // Insert default admin user (password: admin123)
      db.run(`
        INSERT OR IGNORE INTO users (username, email, password_hash, role)
        VALUES ('admin', 'admin@vehicletracker.com', '$2a$10$rQZ9VYN7XQ9Y.Z9Z9Z9Z9uK9vF9F9F9F9F9F9F9F9F9F9F9F9F9F9', 'admin')
      `);

      // Insert sample cameras
      const sampleCameras = [
        ['CAM_001', 'Market St & 5th', 37.7749, -122.4194, 'active', '5th St & Market St, San Francisco, CA'],
        ['CAM_002', 'Mission St & 6th', 37.7750, -122.4180, 'active', '6th St & Mission St, San Francisco, CA'],
        ['CAM_003', 'Howard St & 4th', 37.7760, -122.4190, 'active', '4th St & Howard St, San Francisco, CA'],
        ['CAM_004', 'Folsom St & 7th', 37.7740, -122.4200, 'active', '7th St & Folsom St, San Francisco, CA'],
        ['CAM_005', 'Bryant St & 3rd', 37.7770, -122.4170, 'active', '3rd St & Bryant St, San Francisco, CA']
      ];

      const stmt = db.prepare(`
        INSERT OR IGNORE INTO cameras (id, name, location_lat, location_lng, status, address)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      sampleCameras.forEach(camera => {
        stmt.run(camera);
      });

      stmt.finalize((err) => {
        if (err) {
          reject(err);
        } else {
          db.close((err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    });
  });
}

module.exports = {
  getDatabase,
  initializeDatabase
};
