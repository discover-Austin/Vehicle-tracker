# Vehicle Tracking System - API Reference

Complete API documentation for the Vehicle Tracking System.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

### Success Response
```json
{
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

## Endpoints

### Authentication

#### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:** `201 Created`
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Errors:**
- `400`: Missing fields or password too short
- `400`: Username or email already exists

---

#### POST /auth/login

Authenticate and receive access token.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Errors:**
- `400`: Missing credentials
- `401`: Invalid credentials

---

### Cameras

#### GET /cameras

Retrieve all cameras in the network.

**Authentication:** Not required

**Response:** `200 OK`
```json
{
  "cameras": [
    {
      "id": "CAM_001",
      "name": "Market St & 5th",
      "location_lat": 37.7749,
      "location_lng": -122.4194,
      "status": "active",
      "address": "5th St & Market St, San Francisco, CA",
      "description": null,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### GET /cameras/:id

Get details of a specific camera.

**Parameters:**
- `id` (string): Camera ID

**Response:** `200 OK`
```json
{
  "camera": {
    "id": "CAM_001",
    "name": "Market St & 5th",
    "location_lat": 37.7749,
    "location_lng": -122.4194,
    "status": "active",
    "address": "5th St & Market St, San Francisco, CA",
    "description": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `404`: Camera not found

---

#### POST /cameras

Create a new camera. **Admin only**

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "name": "New Camera Location",
  "location_lat": 37.7750,
  "location_lng": -122.4180,
  "address": "123 Main St, San Francisco, CA",
  "description": "Intersection camera"
}
```

**Response:** `201 Created`
```json
{
  "camera": {
    "id": "CAM_ABC123",
    "name": "New Camera Location",
    "location_lat": 37.7750,
    "location_lng": -122.4180,
    "status": "active",
    "address": "123 Main St, San Francisco, CA",
    "description": "Intersection camera",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `400`: Missing required fields
- `401`: Not authenticated
- `403`: Insufficient permissions

---

#### PUT /cameras/:id

Update camera details. **Admin only**

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "name": "Updated Camera Name",
  "status": "inactive",
  "description": "Under maintenance"
}
```

**Response:** `200 OK`
```json
{
  "camera": { /* updated camera object */ }
}
```

**Errors:**
- `400`: No fields to update
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Camera not found

---

#### DELETE /cameras/:id

Delete a camera. **Admin only**

**Authentication:** Required (Admin role)

**Response:** `200 OK`
```json
{
  "message": "Camera deleted successfully"
}
```

**Errors:**
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Camera not found

---

#### GET /cameras/:id/stats

Get statistics for a specific camera.

**Response:** `200 OK`
```json
{
  "stats": {
    "total_detections": 45,
    "avg_confidence": 0.87,
    "first_detection": "2024-01-01T12:00:00.000Z",
    "last_detection": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Searches

#### GET /searches

Get all searches. Users see only their searches; admins see all.

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status (active/completed/cancelled)
- `priority` (optional): Filter by priority (normal/high/urgent)

**Response:** `200 OK`
```json
{
  "searches": [
    {
      "id": "SEARCH_abc123",
      "user_id": 1,
      "license_plate": "ABC123",
      "make": "Toyota",
      "model": "Camry",
      "color": "Silver",
      "year": "2018",
      "status": "active",
      "priority": "normal",
      "notes": "Stolen vehicle",
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

#### GET /searches/:id

Get details of a specific search.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "search": { /* search object */ }
}
```

**Errors:**
- `404`: Search not found or unauthorized

---

#### POST /searches

Create a new vehicle search.

**Authentication:** Required

**Request Body:**
```json
{
  "license_plate": "ABC123",
  "make": "Toyota",
  "model": "Camry",
  "color": "Silver",
  "year": "2018",
  "priority": "high",
  "notes": "Stolen vehicle - handle with care"
}
```

**Response:** `201 Created`
```json
{
  "search": {
    "id": "SEARCH_abc123",
    "user_id": 1,
    "license_plate": "ABC123",
    "make": "Toyota",
    "model": "Camry",
    "color": "Silver",
    "year": "2018",
    "status": "active",
    "priority": "high",
    "notes": "Stolen vehicle - handle with care",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  }
}
```

**Errors:**
- `400`: License plate is required

---

#### PUT /searches/:id

Update a search.

**Authentication:** Required (owner or admin)

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Vehicle recovered"
}
```

**Response:** `200 OK`
```json
{
  "search": { /* updated search object */ }
}
```

---

#### DELETE /searches/:id

Delete a search.

**Authentication:** Required (owner or admin)

**Response:** `200 OK`
```json
{
  "message": "Search deleted successfully"
}
```

---

### Detections

#### GET /detections/search/:searchId

Get all detections for a specific search.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "detections": [
    {
      "id": "DET_abc123",
      "search_id": "SEARCH_abc123",
      "camera_id": "CAM_001",
      "camera_name": "Market St & 5th",
      "camera_address": "5th St & Market St, San Francisco, CA",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "confidence": 0.92,
      "location_lat": 37.7749,
      "location_lng": -122.4194,
      "image_url": null,
      "metadata": null
    }
  ]
}
```

---

#### GET /detections/:id

Get details of a specific detection.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "detection": {
    "id": "DET_abc123",
    "search_id": "SEARCH_abc123",
    "camera_id": "CAM_001",
    "camera_name": "Market St & 5th",
    "camera_address": "5th St & Market St, San Francisco, CA",
    "license_plate": "ABC123",
    "make": "Toyota",
    "model": "Camry",
    "color": "Silver",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "confidence": 0.92,
    "location_lat": 37.7749,
    "location_lng": -122.4194
  }
}
```

---

#### POST /detections

Create a new detection.

**Authentication:** Required

**Request Body:**
```json
{
  "search_id": "SEARCH_abc123",
  "camera_id": "CAM_001",
  "confidence": 0.92,
  "location_lat": 37.7749,
  "location_lng": -122.4194,
  "image_url": "https://example.com/image.jpg",
  "metadata": {
    "speed": "45 mph",
    "direction": "north"
  }
}
```

**Response:** `201 Created`
```json
{
  "detection": { /* detection object */ }
}
```

---

#### POST /detections/simulate/:searchId

Simulate a detection for testing purposes.

**Authentication:** Required

**Response:** `201 Created`
```json
{
  "detection": { /* simulated detection object */ }
}
```

---

#### GET /detections/stats/summary

Get detection statistics.

**Authentication:** Required

**Query Parameters:**
- `search_id` (optional): Filter by search
- `start_date` (optional): Start date (ISO 8601)
- `end_date` (optional): End date (ISO 8601)

**Response:** `200 OK`
```json
{
  "stats": {
    "total_detections": 150,
    "avg_confidence": 0.87,
    "cameras_used": 5,
    "searches_detected": 12,
    "first_detection": "2024-01-01T00:00:00.000Z",
    "last_detection": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Analytics

#### GET /analytics/dashboard

Get dashboard overview statistics.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "stats": {
    "totalSearches": 25,
    "activeSearches": 8,
    "totalDetections": 150,
    "activeCameras": 5,
    "todayDetections": 12,
    "avgConfidence": 0.87
  }
}
```

---

#### GET /analytics/trends/detections

Get detection trends over time.

**Authentication:** Required

**Query Parameters:**
- `period` (optional): Time period (24h/7d/30d/1y, default: 7d)

**Response:** `200 OK`
```json
{
  "trends": [
    {
      "period": "2024-01-15",
      "count": 12,
      "avg_confidence": 0.89
    },
    {
      "period": "2024-01-14",
      "count": 8,
      "avg_confidence": 0.85
    }
  ]
}
```

---

#### GET /analytics/top-cameras

Get cameras ranked by detection count.

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of cameras to return (default: 10)

**Response:** `200 OK`
```json
{
  "cameras": [
    {
      "id": "CAM_001",
      "name": "Market St & 5th",
      "location_lat": 37.7749,
      "location_lng": -122.4194,
      "detection_count": 45,
      "avg_confidence": 0.88
    }
  ]
}
```

---

#### GET /analytics/heatmap

Get heatmap data for map visualization.

**Authentication:** Required

**Query Parameters:**
- `start_date` (optional): Start date filter
- `end_date` (optional): End date filter

**Response:** `200 OK`
```json
{
  "heatmapData": [
    {
      "location_lat": 37.7749,
      "location_lng": -122.4194,
      "intensity": 45
    }
  ]
}
```

---

#### GET /analytics/search-success-rate

Calculate search success rate.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "totalSearches": 25,
  "successfulSearches": 18,
  "failedSearches": 7,
  "successRate": "72.00"
}
```

---

#### GET /analytics/activity

Get recent activity feed.

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of activities (default: 50)

**Response:** `200 OK`
```json
{
  "activities": [
    {
      "type": "detection",
      "id": "DET_abc123",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "camera_id": "CAM_001",
      "camera_name": "Market St & 5th",
      "license_plate": "ABC123",
      "confidence": 0.92
    }
  ]
}
```

---

### Export

#### GET /export/detections/:searchId

Export detections for a search.

**Authentication:** Required

**Query Parameters:**
- `format` (optional): Export format (json/csv, default: json)

**Response:** File download (JSON or CSV)

---

#### GET /export/searches

Export all searches.

**Authentication:** Required

**Query Parameters:**
- `format` (optional): Export format (json/csv, default: json)

**Response:** File download (JSON or CSV)

---

#### GET /export/report

Generate comprehensive report.

**Authentication:** Required

**Query Parameters:**
- `search_id` (optional): Filter by search
- `start_date` (optional): Start date
- `end_date` (optional): End date
- `format` (optional): Export format (json/csv, default: json)

**Response:** File download (JSON or CSV)

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Window**: 15 minutes
- **Max Requests**: 100 per IP address

When rate limit is exceeded:

**Response:** `429 Too Many Requests`
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Example Usage

### JavaScript (Fetch API)

```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});

const { token } = await loginResponse.json();

// Create a search
const searchResponse = await fetch('http://localhost:3000/api/searches', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    license_plate: 'ABC123',
    make: 'Toyota',
    model: 'Camry',
    color: 'Silver'
  })
});

const { search } = await searchResponse.json();
```

### cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get cameras
curl http://localhost:3000/api/cameras

# Create search (with token)
curl -X POST http://localhost:3000/api/searches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"license_plate":"ABC123","make":"Toyota"}'
```

## WebSocket API

### Connection

```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  console.log('Connected');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### Subscribe to Searches

```javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  searchIds: ['SEARCH_abc123', 'SEARCH_def456']
}));
```

### Events

#### Detection Event
```json
{
  "type": "detection",
  "data": {
    "id": "DET_abc123",
    "search_id": "SEARCH_abc123",
    "camera_name": "Market St & 5th",
    "confidence": 0.92
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Alert Event
```json
{
  "type": "alert",
  "data": {
    "message": "High priority vehicle detected",
    "severity": "high"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
