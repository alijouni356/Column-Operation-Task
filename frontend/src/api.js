// All API calls go through this base URL.
// In development:  reads from .env        → http://localhost:5000
// In production:   reads from .env.production → https://your-backend.up.railway.app

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default API;