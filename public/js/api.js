// API Client for Vehicle Tracker
class VehicleTrackerAPI {
  constructor(baseURL = '') {
    this.baseURL = baseURL || window.location.origin;
    this.token = localStorage.getItem('auth_token');
    this.ws = null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Clear authentication
  clearAuth() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (response.status === 401) {
        this.clearAuth();
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(username, password) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    this.setToken(result.token);
    return result;
  }

  async register(username, email, password) {
    const result = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    this.setToken(result.token);
    return result;
  }

  // Cameras
  async getCameras() {
    return this.request('/cameras');
  }

  async getCamera(id) {
    return this.request(`/cameras/${id}`);
  }

  async createCamera(cameraData) {
    return this.request('/cameras', {
      method: 'POST',
      body: JSON.stringify(cameraData)
    });
  }

  async updateCamera(id, cameraData) {
    return this.request(`/cameras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cameraData)
    });
  }

  async deleteCamera(id) {
    return this.request(`/cameras/${id}`, {
      method: 'DELETE'
    });
  }

  // Searches
  async getSearches(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/searches?${params}`);
  }

  async getSearch(id) {
    return this.request(`/searches/${id}`);
  }

  async createSearch(searchData) {
    return this.request('/searches', {
      method: 'POST',
      body: JSON.stringify(searchData)
    });
  }

  async updateSearch(id, searchData) {
    return this.request(`/searches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(searchData)
    });
  }

  async deleteSearch(id) {
    return this.request(`/searches/${id}`, {
      method: 'DELETE'
    });
  }

  // Detections
  async getDetectionsForSearch(searchId) {
    return this.request(`/detections/search/${searchId}`);
  }

  async getDetection(id) {
    return this.request(`/detections/${id}`);
  }

  async createDetection(detectionData) {
    return this.request('/detections', {
      method: 'POST',
      body: JSON.stringify(detectionData)
    });
  }

  async simulateDetection(searchId) {
    return this.request(`/detections/simulate/${searchId}`, {
      method: 'POST'
    });
  }

  async getDetectionStats(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/detections/stats/summary?${params}`);
  }

  // Analytics
  async getDashboardStats() {
    return this.request('/analytics/dashboard');
  }

  async getDetectionTrends(period = '7d') {
    return this.request(`/analytics/trends/detections?period=${period}`);
  }

  async getTopCameras(limit = 10) {
    return this.request(`/analytics/top-cameras?limit=${limit}`);
  }

  async getHeatmapData(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/analytics/heatmap?${params}`);
  }

  async getSearchSuccessRate() {
    return this.request('/analytics/search-success-rate');
  }

  async getActivity(limit = 50) {
    return this.request(`/analytics/activity?limit=${limit}`);
  }

  // Export
  exportDetections(searchId, format = 'json') {
    window.open(`${this.baseURL}/api/export/detections/${searchId}?format=${format}&token=${this.token}`, '_blank');
  }

  exportSearches(format = 'json') {
    window.open(`${this.baseURL}/api/export/searches?format=${format}&token=${this.token}`, '_blank');
  }

  exportReport(filters = {}, format = 'json') {
    const params = new URLSearchParams({ ...filters, format });
    window.open(`${this.baseURL}/api/export/report?${params}&token=${this.token}`, '_blank');
  }

  // WebSocket Connection
  connectWebSocket(onMessage) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsURL = `${protocol}//${window.location.host}`;

    this.ws = new WebSocket(wsURL);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) {
          onMessage(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Auto-reconnect after 5 seconds
      setTimeout(() => this.connectWebSocket(onMessage), 5000);
    };
  }

  subscribeToSearches(searchIds) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        searchIds
      }));
    }
  }

  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VehicleTrackerAPI;
}
