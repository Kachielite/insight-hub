import { fold } from 'fp-ts/Either';

import type { Failure } from '@/core/error/failure.ts';
import Encrypter from '@/core/utils/encrypter.ts';
import type {
  AuthLoginSchema,
  AuthRegisterSchema,
  AuthResetSchema,
} from '@/core/validation/auth.ts';
import type Auth from '@/features/Authentication/domain/entity/auth.ts';
import {
  loginUseCase,
  registerUseCase,
  requestResetPasswordUseCase,
  resetPasswordUseCase,
} from '@/init-dependencies/auth-di.ts';

export const loginEffect = async (data: AuthLoginSchema) => {
  const response = await loginUseCase.execute({ data });

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
  const response = await registerUseCase.execute({ data });

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

export const requestResetPasswordEffect = async (email: string) => {
  const response = await requestResetPasswordUseCase.execute({ email });

  return fold<Failure, string, string>(
    (failure) => {
      console.error('loginEffect:', failure);
      throw new Error(failure.message);
    },
    (auth) => auth
  )(response);
};

export const resetPasswordEffect = async (data: AuthResetSchema) => {
  const response = await resetPasswordUseCase.execute({ data });

  return fold<Failure, string, string>(
    (failure) => {
      console.error('loginEffect:', failure);
      throw new Error(failure.message);
    },
    (auth) => auth
  )(response);
};
