import 'reflect-metadata';
import { container } from 'tsyringe';
import express from 'express';

// Import all your dependencies
import App from '@app/app';
import Server from '@app/server';
import PasswordResetTokenRepository from '@repository/implementation/PasswordResetTokenRepository';
import AuthenticationService from '@service/implementation/AuthenticationService';
import UserService from '@service/implementation/UserService';
import EmailService from '@service/implementation/EmailService';
import PasswordEncoderService from '@service/implementation/PasswordEncoderService';
import AuthenticationMiddleware from '@middleware/AuthenticationMiddleware';
import GlobalExceptionMiddleware from '@middleware/GlobalExceptionMiddleware';
import UserRepository from '@repository/implementation/UserRepository';
import JwtService from '@service/implementation/JwtService';

export function configureContainer() {
  // Register repositories
  container.registerSingleton<UserRepository>(UserRepository);
  container.registerSingleton<PasswordResetTokenRepository>(
    PasswordResetTokenRepository
  );

  // Register services with their implementations
  container.register<JwtService>('JwtService', { useClass: JwtService });
  container.register<AuthenticationService>('AuthenticationService', {
    useClass: AuthenticationService,
  });
  container.register<UserService>('UserService', { useClass: UserService });
  container.register<EmailService>('EmailService', { useClass: EmailService });
  container.register<PasswordEncoderService>('PasswordEncoderService', {
    useClass: PasswordEncoderService,
  });

  // Register middleware
  container.registerSingleton<AuthenticationMiddleware>(
    AuthenticationMiddleware
  );
  container.registerSingleton<GlobalExceptionMiddleware>(
    GlobalExceptionMiddleware
  );

  // Register Express app factory with proper dependency injection
  container.register<App>(App, {
    useFactory: (container) => {
      const authMiddleware = container.resolve(AuthenticationMiddleware);
      const globalExceptionMiddleware = container.resolve(
        GlobalExceptionMiddleware
      );
      return new App(express(), authMiddleware, globalExceptionMiddleware);
    },
  });

  // Register server
  container.registerSingleton<Server>(Server);
}
