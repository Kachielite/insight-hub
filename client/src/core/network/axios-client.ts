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
    this.handleUnauthorized();
  }

  setToken(token?: string) {
    this.instance.interceptors.request.use((config) => {
      if (token) {
        const setup = { ...config };
        setup.headers.Authorization = `Bearer ${Encrypter.decodeUserToken(token)}`;

        return setup;
      }
      return config;
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
