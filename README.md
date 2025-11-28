# Vehicle Tracking System

A comprehensive, real-time vehicle tracking and detection system with advanced analytics, camera management, and search capabilities.

## Features

### Core Functionality
- **Real-time Vehicle Detection**: Track vehicles across multiple camera feeds with live updates
- **Search Management**: Create and manage vehicle searches with license plate, make, model, color, and year
- **Camera Network**: Monitor and manage a network of surveillance cameras
- **Live Map Visualization**: Interactive map showing camera locations and detection hotspots
- **WebSocket Integration**: Real-time updates for detections and alerts

### Advanced Features
- **User Authentication**: Secure login and registration system with role-based access control
- **Analytics Dashboard**: Comprehensive statistics and insights including:
  - Detection trends over time
  - Top performing cameras
  - Search success rates
  - Activity feeds
  - Heatmap visualization
- **Data Export**: Export searches and detections in CSV or JSON format
- **Multi-User Support**: Admin and user roles with appropriate permissions
- **RESTful API**: Full-featured API for all operations

## Technology Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database for data persistence
- **WebSocket** (ws) for real-time communication
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React** (via CDN)
- **Tailwind CSS** for styling
- **Leaflet.js** for map visualization
- **Chart.js** for analytics charts
- **Vanilla JavaScript** for API integration

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd Vehicle-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Edit `.env` file with your configuration (important for production):
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secure-secret-key
```

5. Initialize the database:
```bash
npm run init-db
```

6. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

7. Access the application:
- Main Dashboard: http://localhost:3000
- Login Page: http://localhost:3000/login.html
- Analytics: http://localhost:3000/analytics.html

## Default Credentials

```
Username: admin
Password: admin123
```

**Important**: Change the default admin password in production!

## Project Structure

```
Vehicle-tracker/
├── server/
│   ├── index.js                 # Main server file
│   ├── database/
│   │   └── init.js             # Database initialization and schema
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── cameras.js          # Camera CRUD operations
│   │   ├── searches.js         # Search management
│   │   ├── detections.js       # Detection tracking
│   │   ├── analytics.js        # Analytics endpoints
│   │   └── export.js           # Data export functionality
│   └── services/
│       └── websocket.js        # WebSocket service
├── public/
│   ├── index.html              # Main dashboard
│   ├── login.html              # Authentication page
│   ├── analytics.html          # Analytics dashboard
│   └── js/
│       └── api.js              # API client library
├── data/
│   └── vehicle_tracker.db      # SQLite database (auto-created)
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

### Cameras

#### Get All Cameras
```http
GET /api/cameras
```

#### Get Camera by ID
```http
GET /api/cameras/:id
```

#### Create Camera (Admin only)
```http
POST /api/cameras
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "location_lat": number,
  "location_lng": number,
  "address": "string",
  "description": "string"
}
```

#### Update Camera (Admin only)
```http
PUT /api/cameras/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "status": "active|inactive",
  ...
}
```

#### Delete Camera (Admin only)
```http
DELETE /api/cameras/:id
Authorization: Bearer <token>
```

### Searches

#### Get All Searches
```http
GET /api/searches?status=active&priority=high
Authorization: Bearer <token>
```

#### Create Search
```http
POST /api/searches
Authorization: Bearer <token>
Content-Type: application/json

{
  "license_plate": "string",
  "make": "string",
  "model": "string",
  "color": "string",
  "year": "string",
  "priority": "normal|high|urgent",
  "notes": "string"
}
```

#### Update Search
```http
PUT /api/searches/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Search
```http
DELETE /api/searches/:id
Authorization: Bearer <token>
```

### Detections

#### Get Detections for Search
```http
GET /api/detections/search/:searchId
Authorization: Bearer <token>
```

#### Create Detection
```http
POST /api/detections
Authorization: Bearer <token>
Content-Type: application/json

{
  "search_id": "string",
  "camera_id": "string",
  "confidence": number,
  "location_lat": number,
  "location_lng": number
}
```

#### Simulate Detection (for testing)
```http
POST /api/detections/simulate/:searchId
Authorization: Bearer <token>
```

### Analytics

#### Dashboard Statistics
```http
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

#### Detection Trends
```http
GET /api/analytics/trends/detections?period=7d
Authorization: Bearer <token>
```

#### Top Cameras
```http
GET /api/analytics/top-cameras?limit=10
Authorization: Bearer <token>
```

#### Heatmap Data
```http
GET /api/analytics/heatmap
Authorization: Bearer <token>
```

### Export

#### Export Detections
```http
GET /api/export/detections/:searchId?format=csv
Authorization: Bearer <token>
```

#### Export Searches
```http
GET /api/export/searches?format=json
Authorization: Bearer <token>
```

#### Generate Report
```http
GET /api/export/report?search_id=xxx&format=json
Authorization: Bearer <token>
```

## WebSocket Events

Connect to WebSocket at `ws://localhost:3000`

### Client → Server

```javascript
// Subscribe to specific searches
{
  "type": "subscribe",
  "searchIds": ["SEARCH_xxx", "SEARCH_yyy"]
}

// Ping
{
  "type": "ping"
}
```

### Server → Client

```javascript
// New detection
{
  "type": "detection",
  "data": { /* detection object */ },
  "timestamp": "ISO 8601 timestamp"
}

// Alert
{
  "type": "alert",
  "data": { /* alert object */ },
  "timestamp": "ISO 8601 timestamp"
}

// Pong response
{
  "type": "pong",
  "timestamp": number
}
```

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Database Schema

### Users
- `id`: INTEGER PRIMARY KEY
- `username`: TEXT UNIQUE
- `email`: TEXT UNIQUE
- `password_hash`: TEXT
- `role`: TEXT (user/admin)
- `created_at`: DATETIME
- `last_login`: DATETIME

### Cameras
- `id`: TEXT PRIMARY KEY
- `name`: TEXT
- `location_lat`: REAL
- `location_lng`: REAL
- `status`: TEXT (active/inactive)
- `address`: TEXT
- `description`: TEXT
- `created_at`: DATETIME
- `updated_at`: DATETIME

### Searches
- `id`: TEXT PRIMARY KEY
- `user_id`: INTEGER (FK)
- `license_plate`: TEXT
- `make`: TEXT
- `model`: TEXT
- `color`: TEXT
- `year`: TEXT
- `status`: TEXT (active/completed/cancelled)
- `priority`: TEXT (normal/high/urgent)
- `notes`: TEXT
- `created_at`: DATETIME
- `updated_at`: DATETIME

### Detections
- `id`: TEXT PRIMARY KEY
- `search_id`: TEXT (FK)
- `camera_id`: TEXT (FK)
- `timestamp`: DATETIME
- `confidence`: REAL
- `location_lat`: REAL
- `location_lng`: REAL
- `image_url`: TEXT
- `metadata`: TEXT

### Alerts
- `id`: INTEGER PRIMARY KEY
- `detection_id`: TEXT (FK)
- `type`: TEXT
- `message`: TEXT
- `severity`: TEXT
- `acknowledged`: BOOLEAN
- `created_at`: DATETIME

## Security Considerations

1. **Change Default Credentials**: Always change the default admin password
2. **JWT Secret**: Use a strong, random JWT secret in production
3. **HTTPS**: Enable HTTPS in production environments
4. **Rate Limiting**: Already configured to prevent abuse
5. **Input Validation**: All inputs are validated server-side
6. **SQL Injection**: Protected through parameterized queries
7. **Password Hashing**: Uses bcrypt with salt rounds

## Performance Optimization

- **Database Indexes**: Optimized queries with proper indexes
- **Compression**: Response compression enabled
- **Caching**: Consider adding Redis for session management in production
- **WebSocket**: Efficient real-time updates without polling

## Deployment

### Docker (Recommended)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run init-db
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t vehicle-tracker .
docker run -p 3000:3000 -v $(pwd)/data:/app/data vehicle-tracker
```

### Traditional Deployment

1. Set `NODE_ENV=production` in `.env`
2. Install dependencies: `npm install --production`
3. Initialize database: `npm run init-db`
4. Start with process manager: `pm2 start server/index.js`

## Troubleshooting

### Database Issues
```bash
# Reset database
rm -rf data/
npm run init-db
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

### WebSocket Connection Failed
- Check if server is running
- Ensure no firewall blocking WebSocket connections
- Verify correct protocol (ws:// vs wss://)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Email: support@vehicletracker.com

## Roadmap

- [ ] Image upload for detections
- [ ] Machine learning integration for automatic detection
- [ ] Mobile app support
- [ ] Email/SMS notifications
- [ ] Advanced reporting with PDF export
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Video feed integration
- [ ] Geofencing alerts
- [ ] Historical playback feature

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Core vehicle tracking functionality
- User authentication
- Analytics dashboard
- Data export capabilities
- WebSocket real-time updates
- Camera management
- Search management
