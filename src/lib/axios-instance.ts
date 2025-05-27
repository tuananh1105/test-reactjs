import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BINANCE_API_BASE_URL,
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
