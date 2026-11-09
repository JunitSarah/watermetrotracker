// Backend URL. Override by creating frontend/.env with:
//   REACT_APP_API_URL=https://your-backend.example.com
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default API_BASE_URL;