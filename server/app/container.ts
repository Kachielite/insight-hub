import 'reflect-metadata';

// Import all your dependencies
import App from '@app/app';
import Server from '@app/server';
import { AppServices } from '@common/types/AppServices';
import AuthenticationController from '@controller/AuthenticationController';
import HealthCheckController from '@controller/HealthCheckController';
import AuthenticationMiddleware from '@middleware/AuthenticationMiddleware';
import GlobalExceptionMiddleware from '@middleware/GlobalExceptionMiddleware';
import PasswordResetTokenRepository from '@repository/implementation/PasswordResetTokenRepository';
import UserRepository from '@repository/implementation/UserRepository';
import AuthenticationService from '@service/implementation/AuthenticationService';
import EmailService from '@service/implementation/EmailService';
import JwtService from '@service/implementation/JwtService';
import PasswordEncoderService from '@service/implementation/PasswordEncoderService';
import UserService from '@service/implementation/UserService';
import express from 'express';
import { container } from 'tsyringe';

export function configureContainer() {
  // Register Express Router factory
  container.register<express.Router>('Router', {
    useFactory: () => express.Router(),
  });

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

  // Register controllers
  container.registerSingleton<HealthCheckController>(HealthCheckController);
  container.registerSingleton<AuthenticationController>(
    AuthenticationController
  );

  // Register Express app factory with proper dependency injection
  container.register<App>(App, {
    useFactory: (container) => {
      const services: AppServices = {
        authMiddleware: container.resolve(AuthenticationMiddleware),
        globalExceptionMiddleware: container.resolve(GlobalExceptionMiddleware),
        healthCheckController: container.resolve(HealthCheckController),
        authController: container.resolve(AuthenticationController),
      };
      return new App(express(), services);
    },
  });

  // Register server
  container.registerSingleton<Server>(Server);
}
