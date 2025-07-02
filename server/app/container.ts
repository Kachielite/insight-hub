import 'reflect-metadata';
import { container } from 'tsyringe';
import express from 'express';

// Import all your dependencies
import App from '@app/app';
import Server from '@app/server';
import UserRepository from '@repository/UserRepository';
import PasswordResetTokenRepository from '@repository/PasswordResetTokenRepository';
import { JwtService } from '@service/JwtService';
import IJwtService from '@service/implementation/IJwtService';
import { AuthenticationService } from '@service/AuthenticationService';
import IAuthenticationService from '@service/implementation/IAuthenticationService';
import { UserService } from '@service/UserService';
import IUserService from '@service/implementation/IUserService';
import { EmailService } from '@service/EmailService';
import IEmailService from '@service/implementation/IEmailService';
import { PasswordEncoderService } from '@service/PasswordEncoderService';
import IPasswordEncoderService from '@service/implementation/IPasswordEncoderService';
import AuthenticationMiddleware from '@middleware/AuthenticationMiddleware';
import GlobalExceptionMiddleware from '@middleware/GlobalExceptionMiddleware';

export function configureContainer() {
  // Register repositories
  container.registerSingleton<UserRepository>(UserRepository);
  container.registerSingleton<PasswordResetTokenRepository>(
    PasswordResetTokenRepository
  );

  // Register services with their implementations
  container.register<JwtService>('JwtService', { useClass: IJwtService });
  container.register<AuthenticationService>('AuthenticationService', {
    useClass: IAuthenticationService,
  });
  container.register<UserService>('UserService', { useClass: IUserService });
  container.register<EmailService>('EmailService', { useClass: IEmailService });
  container.register<PasswordEncoderService>('PasswordEncoderService', {
    useClass: IPasswordEncoderService,
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
