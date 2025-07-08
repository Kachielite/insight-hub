import App from '@app/app';
import { configureContainer } from '@app/container';
import Server from '@app/server';
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

// Mock all dependencies
jest.mock('express');
jest.mock('@app/app');
jest.mock('@app/server');
jest.mock('@controller/AuthenticationController');
jest.mock('@controller/HealthCheckController');
jest.mock('@middleware/AuthenticationMiddleware');
jest.mock('@middleware/GlobalExceptionMiddleware');
jest.mock('@repository/implementation/UserRepository');
jest.mock('@repository/implementation/PasswordResetTokenRepository');
jest.mock('@service/implementation/AuthenticationService');
jest.mock('@service/implementation/UserService');
jest.mock('@service/implementation/EmailService');
jest.mock('@service/implementation/PasswordEncoderService');
jest.mock('@service/implementation/JwtService');

describe('Container Configuration', () => {
  beforeEach(() => {
    // Clear all registrations before each test
    container.clearInstances();

    // Mock express router factory
    (express.Router as jest.Mock) = jest.fn(() => {
      const router = {
        use: jest.fn().mockReturnThis(),
        get: jest.fn().mockReturnThis(),
        post: jest.fn().mockReturnThis(),
        put: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        all: jest.fn().mockReturnThis(),
        patch: jest.fn().mockReturnThis(),
        options: jest.fn().mockReturnThis(),
        head: jest.fn().mockReturnThis(),
        param: jest.fn().mockReturnThis(),
        route: jest.fn().mockReturnThis(),
        stack: [],
      } as unknown as jest.Mocked<express.Router>;

      return router;
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    container.clearInstances();
  });

  describe('configureContainer', () => {
    it('should configure container without throwing errors', () => {
      expect(() => configureContainer()).not.toThrow();
    });

    it('should register Express Router factory', () => {
      configureContainer();

      // Verify that Router factory is registered
      const router = container.resolve<express.Router>('Router');
      expect(router).toBeDefined();
    });

    it('should register all repositories as singletons', () => {
      configureContainer();

      // Test UserRepository singleton registration
      const userRepo1 = container.resolve(UserRepository);
      const userRepo2 = container.resolve(UserRepository);
      expect(userRepo1).toBe(userRepo2); // Should be the same instance

      // Test PasswordResetTokenRepository singleton registration
      const tokenRepo1 = container.resolve(PasswordResetTokenRepository);
      const tokenRepo2 = container.resolve(PasswordResetTokenRepository);
      expect(tokenRepo1).toBe(tokenRepo2); // Should be the same instance
    });

    it('should register all services with correct tokens', () => {
      configureContainer();

      // Verify services can be resolved
      expect(() => container.resolve<JwtService>('JwtService')).not.toThrow();
      expect(() =>
        container.resolve<AuthenticationService>('AuthenticationService')
      ).not.toThrow();
      expect(() => container.resolve<UserService>('UserService')).not.toThrow();
      expect(() =>
        container.resolve<EmailService>('EmailService')
      ).not.toThrow();
      expect(() =>
        container.resolve<PasswordEncoderService>('PasswordEncoderService')
      ).not.toThrow();
    });

    it('should register all middleware as singletons', () => {
      configureContainer();

      // Test AuthenticationMiddleware singleton registration
      const authMiddleware1 = container.resolve(AuthenticationMiddleware);
      const authMiddleware2 = container.resolve(AuthenticationMiddleware);
      expect(authMiddleware1).toBe(authMiddleware2);

      // Test GlobalExceptionMiddleware singleton registration
      const exceptionMiddleware1 = container.resolve(GlobalExceptionMiddleware);
      const exceptionMiddleware2 = container.resolve(GlobalExceptionMiddleware);
      expect(exceptionMiddleware1).toBe(exceptionMiddleware2);
    });

    it('should register all controllers as singletons', () => {
      configureContainer();

      // Test HealthCheckController singleton registration
      const healthController1 = container.resolve(HealthCheckController);
      const healthController2 = container.resolve(HealthCheckController);
      expect(healthController1).toBe(healthController2);

      // Test AuthenticationController singleton registration
      const authController1 = container.resolve(AuthenticationController);
      const authController2 = container.resolve(AuthenticationController);
      expect(authController1).toBe(authController2);
    });

    it('should register App with factory that creates proper AppServices', () => {
      configureContainer();

      const app = container.resolve(App);
      expect(app).toBeDefined();
      expect(App).toHaveBeenCalled();
    });

    it('should register Server as singleton', () => {
      configureContainer();

      // Test Server singleton registration
      const server1 = container.resolve(Server);
      const server2 = container.resolve(Server);
      expect(server1).toBe(server2);
    });
  });

  describe('dependency resolution', () => {
    beforeEach(() => {
      configureContainer();
    });

    it('should resolve complex dependency chains', () => {
      // This tests that dependencies with their own dependencies can be resolved
      expect(() => container.resolve(AuthenticationController)).not.toThrow();
      expect(() => container.resolve(HealthCheckController)).not.toThrow();
      expect(() => container.resolve(App)).not.toThrow();
      expect(() => container.resolve(Server)).not.toThrow();
    });

    it('should provide unique Router instances when requested', () => {
      const router1 = container.resolve<express.Router>('Router');
      const router2 = container.resolve<express.Router>('Router');

      // Routers should be different instances (factory pattern)
      expect(router1).not.toBe(router2);
    });

    it('should resolve services with string tokens correctly', () => {
      const jwtService = container.resolve<JwtService>('JwtService');
      const authService = container.resolve<AuthenticationService>(
        'AuthenticationService'
      );
      const userService = container.resolve<UserService>('UserService');
      const emailService = container.resolve<EmailService>('EmailService');
      const passwordService = container.resolve<PasswordEncoderService>(
        'PasswordEncoderService'
      );

      expect(jwtService).toBeDefined();
      expect(authService).toBeDefined();
      expect(userService).toBeDefined();
      expect(emailService).toBeDefined();
      expect(passwordService).toBeDefined();
    });
  });

  describe('App factory configuration', () => {
    it('should create App with all required services in AppServices', () => {
      // Mock the App constructor BEFORE configuring the container
      const mockAppConstructor = jest.fn();
      (App as jest.MockedClass<typeof App>).mockImplementation(
        mockAppConstructor
      );

      // Now configure the container with the mocked App
      configureContainer();

      container.resolve(App);

      expect(mockAppConstructor).toHaveBeenCalled();
      const [, services] = mockAppConstructor.mock.calls[0];

      // Verify that all required services are provided
      expect(services).toHaveProperty('authMiddleware');
      expect(services).toHaveProperty('globalExceptionMiddleware');
      expect(services).toHaveProperty('healthCheckController');
      expect(services).toHaveProperty('authController');
    });
  });

  describe('container state management', () => {
    it('should maintain separate instances for different registration types', () => {
      configureContainer();

      // Singletons should be the same instance
      const middleware1 = container.resolve(AuthenticationMiddleware);
      const middleware2 = container.resolve(AuthenticationMiddleware);
      expect(middleware1).toBe(middleware2);

      // Factory should create new instances
      const router1 = container.resolve<express.Router>('Router');
      const router2 = container.resolve<express.Router>('Router');
      expect(router1).not.toBe(router2);
    });

    it('should clear instances properly', () => {
      configureContainer();
      const service1 = container.resolve(AuthenticationMiddleware);

      container.clearInstances();
      configureContainer();
      const service2 = container.resolve(AuthenticationMiddleware);

      // After clearing and reconfiguring, should get new instances
      expect(service1).not.toBe(service2);
    });
  });

  describe('integration scenarios', () => {
    it('should configure all dependencies for a complete application', () => {
      configureContainer();

      // Verify that we can resolve the complete application stack
      const server = container.resolve(Server);
      expect(server).toBeDefined();

      // Verify that the server has an app dependency
      expect(Server).toHaveBeenCalled();
    });

    it('should support dependency injection throughout the application', () => {
      configureContainer();

      // Test that complex objects with multiple dependencies can be created
      expect(() => {
        container.resolve(AuthenticationController);
        container.resolve(HealthCheckController);
        container.resolve(App);
        container.resolve(Server);
      }).not.toThrow();
    });
  });
});
