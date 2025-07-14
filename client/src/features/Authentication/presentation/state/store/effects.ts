import { fold } from 'fp-ts/Either';

import type { Failure } from '@/core/error/failure.ts';
import Encrypter from '@/core/utils/encrypter.ts';
import type {
  AuthLoginSchema,
  AuthRegisterSchema,
  AuthRequestResetPasswordSchema,
  AuthResetSchema,
} from '@/core/validation/auth.ts';
import type Auth from '@/features/Authentication/domain/entity/auth.ts';
import { getAuthUseCases } from '@/init-dependencies/auth-di.ts';

const getLoginUseCase = () => getAuthUseCases().loginUseCase;
const getRegisterUseCase = () => getAuthUseCases().registerUseCase;
const getRequestResetPasswordUseCase = () =>
  getAuthUseCases().requestResetPasswordUseCase;
const getResetPasswordUseCase = () => getAuthUseCases().resetPasswordUseCase;

export const loginEffect = async (data: AuthLoginSchema) => {
  const response = await getLoginUseCase().execute({ data });

  return fold<Failure, Auth, Auth>(
    (failure) => {
      console.error('loginEffect:', failure);
      throw new Error(failure.message);
    },
    (auth) => {
      Encrypter.setUserToken(auth.accessToken);
      return auth;
    }
  )(response);
};

export const registerEffect = async (data: AuthRegisterSchema) => {
  const response = await getRegisterUseCase().execute({ data });

  return fold<Failure, Auth, Auth>(
    (failure) => {
      console.error('registerEffect:', failure);
      throw new Error(failure.message);
    },
    (auth) => {
      Encrypter.setUserToken(auth.accessToken);
      return auth;
    }
  )(response);
};

export const requestResetPasswordEffect = async (
  data: AuthRequestResetPasswordSchema
) => {
  const response = await getRequestResetPasswordUseCase().execute({ data });

  return fold<Failure, string, string>(
    (failure) => {
      console.error('requestResetPasswordEffect:', failure);
      throw new Error(failure.message);
    },
    (auth) => auth
  )(response);
};

export const resetPasswordEffect = async (data: AuthResetSchema) => {
  const response = await getResetPasswordUseCase().execute({ data });

  return fold<Failure, string, string>(
    (failure) => {
      console.error('requestResetPasswordEffect:', failure);
      throw new Error(failure.message);
    },
    (auth) => auth
  )(response);
};
