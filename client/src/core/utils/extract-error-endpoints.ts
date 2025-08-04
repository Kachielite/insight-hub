import { AxiosError } from 'axios';

const extractErrorEndpoints = (error: unknown): string => {
  return error instanceof AxiosError
    ? error.response?.data?.message
    : 'An unknown error occurred';
};

export default extractErrorEndpoints;
