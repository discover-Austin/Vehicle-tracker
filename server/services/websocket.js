const WebSocket = require('ws');

let wss;
const clients = new Set();

function initializeWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    clients.add(ws);

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received message:', data);

        // Handle different message types
        switch (data.type) {
          case 'subscribe':
            ws.subscribedSearches = data.searchIds || [];
            break;
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to Vehicle Tracker WebSocket',
      timestamp: new Date().toISOString()
    }));
  });

  console.log('WebSocket server initialized');
}

function broadcastDetection(detection) {
  if (!wss) return;

  const message = JSON.stringify({
    type: 'detection',
    data: detection,
    timestamp: new Date().toISOString()
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // Only send to clients subscribed to this search
      if (!client.subscribedSearches ||
          client.subscribedSearches.length === 0 ||
          client.subscribedSearches.includes(detection.search_id)) {
        client.send(message);
      }
    }
  });
}

function broadcastAlert(alert) {
  if (!wss) return;

  const message = JSON.stringify({
    type: 'alert',
    data: alert,
    timestamp: new Date().toISOString()
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function getConnectedClients() {
  return clients.size;
}

module.exports = {
  initializeWebSocket,
  broadcastDetection,
  broadcastAlert,
  getConnectedClients
};
