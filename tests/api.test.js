// Example test file for Vehicle Tracker API
// Run with: npm test

const request = require('supertest');
const app = require('../server/index');

describe('Vehicle Tracker API Tests', () => {
  let authToken;
  let testSearchId;

  // Test Authentication
  describe('Authentication', () => {
    test('POST /api/auth/login - should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      authToken = response.body.token;
    });

    test('POST /api/auth/login - should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });

    test('POST /api/auth/register - should create new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: `testuser_${Date.now()}`,
          email: `test_${Date.now()}@example.com`,
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });
  });

  // Test Cameras
  describe('Cameras', () => {
    test('GET /api/cameras - should return all cameras', async () => {
      const response = await request(app).get('/api/cameras');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cameras');
      expect(Array.isArray(response.body.cameras)).toBe(true);
    });

    test('GET /api/cameras/:id - should return specific camera', async () => {
      const response = await request(app).get('/api/cameras/CAM_001');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('camera');
      expect(response.body.camera.id).toBe('CAM_001');
    });

    test('GET /api/cameras/:id - should return 404 for non-existent camera', async () => {
      const response = await request(app).get('/api/cameras/INVALID');

      expect(response.status).toBe(404);
    });
  });

  // Test Searches
  describe('Searches', () => {
    test('POST /api/searches - should create new search', async () => {
      const response = await request(app)
        .post('/api/searches')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          license_plate: 'TEST123',
          make: 'Toyota',
          model: 'Camry',
          color: 'Silver',
          year: '2020'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('search');
      expect(response.body.search.license_plate).toBe('TEST123');
      testSearchId = response.body.search.id;
    });

    test('POST /api/searches - should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/searches')
        .send({
          license_plate: 'TEST456'
        });

      expect(response.status).toBe(401);
    });

    test('GET /api/searches - should return all searches for user', async () => {
      const response = await request(app)
        .get('/api/searches')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('searches');
      expect(Array.isArray(response.body.searches)).toBe(true);
    });

    test('GET /api/searches/:id - should return specific search', async () => {
      const response = await request(app)
        .get(`/api/searches/${testSearchId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('search');
      expect(response.body.search.id).toBe(testSearchId);
    });

    test('PUT /api/searches/:id - should update search', async () => {
      const response = await request(app)
        .put(`/api/searches/${testSearchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'completed',
          notes: 'Vehicle found'
        });

      expect(response.status).toBe(200);
      expect(response.body.search.status).toBe('completed');
    });
  });

  // Test Detections
  describe('Detections', () => {
    test('POST /api/detections/simulate/:searchId - should simulate detection', async () => {
      const response = await request(app)
        .post(`/api/detections/simulate/${testSearchId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('detection');
    });

    test('GET /api/detections/search/:searchId - should return detections for search', async () => {
      const response = await request(app)
        .get(`/api/detections/search/${testSearchId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('detections');
      expect(Array.isArray(response.body.detections)).toBe(true);
    });
  });

  // Test Analytics
  describe('Analytics', () => {
    test('GET /api/analytics/dashboard - should return dashboard stats', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('stats');
    });

    test('GET /api/analytics/trends/detections - should return detection trends', async () => {
      const response = await request(app)
        .get('/api/analytics/trends/detections?period=7d')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('trends');
    });

    test('GET /api/analytics/top-cameras - should return top cameras', async () => {
      const response = await request(app)
        .get('/api/analytics/top-cameras?limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cameras');
    });
  });

  // Test Health Check
  describe('Health Check', () => {
    test('GET /api/health - should return OK status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });

  // Cleanup
  describe('Cleanup', () => {
    test('DELETE /api/searches/:id - should delete search', async () => {
      const response = await request(app)
        .delete(`/api/searches/${testSearchId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });
});
