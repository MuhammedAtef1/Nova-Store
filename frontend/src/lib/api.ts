import axios from 'axios';

// Since we are running the API on localhost and making requests from Next.js Server Components, 
// we must handle potential issues with self-signed dev certificates in Node.
import https from 'https';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5160/api';
export const BASE_URL = API_URL.replace(/\/api$/, '');

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder.jpg";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}

const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV === 'production', // Ignore self-signed cert in dev
});

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies (Identity)
  httpsAgent
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optionally log errors centrally
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
