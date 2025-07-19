import axios from 'axios';
import { injectable } from 'tsyringe';

import Encrypter from '../utils/encrypter.ts';

import type { AxiosInstance } from 'axios';

@injectable()
class AxiosClient {
  //TODO: add refresh token logic
  private readonly instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_BACKEND_URL,
      withCredentials: true,
    });
    this.setupRequestInterceptor();
    this.handleUnauthorized();
  }

  setupRequestInterceptor() {
    this.instance.interceptors.request.use((config) => {
      // Try to get token from localStorage or sessionStorage
      const token =
        window.localStorage.getItem('token') ??
        window.sessionStorage.getItem('token');
      console.log('[AxiosClient] Raw token from storage:', token);
      if (token) {
        const decodedToken = Encrypter.decodeUserToken(token);
        console.log('[AxiosClient] Decoded token:', decodedToken);
        config.headers.Authorization = `Bearer ${decodedToken}`;
        console.log(
          '[AxiosClient] Authorization header:',
          config.headers.Authorization
        );
        console.log('[AxiosClient] Full request config:', config);
        return config;
      } else {
        console.warn('[AxiosClient] No token found, redirecting to login.');
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.replace('/login');
        // Prevent request from being sent
        return Promise.reject(new Error('No token found'));
      }
    });
  }

  handleUnauthorized() {
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (
          error.response?.status === 401 ||
          error.response?.data?.detail === 'Could not validate credentials'
        ) {
          window.localStorage.clear();
          window.sessionStorage.clear();
          window.location.replace('/login');
          return error;
        }
        return Promise.reject(error);
      }
    );
  }

  getInstance(): AxiosInstance {
    return this.instance;
  }
}

export default AxiosClient;
