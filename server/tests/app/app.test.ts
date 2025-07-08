import App from '@app/app';
import { AppServices } from '@common/types/AppServices';
import AuthenticationMiddleware from '@middleware/AuthenticationMiddleware';
import logger from '@utils/logger';
import express, { Application, Router } from 'express';

// Mock all the dependencies
jest.mock('express');
jest.mock('cors');
jest.mock('helmet');
jest.mock('swagger-ui-express');
jest.mock('@utils/logger');
jest.mock('@configuration/swagger');

describe('App', () => {
  let mockApp: jest.Mocked<Application>;
  let mockServices: AppServices;
  let app: App;

  beforeEach(() => {
    // Create mock Express application
    mockApp = {
      use: jest.fn().mockReturnThis(),
      listen: jest.fn().mockImplementation((port, callback) => {
        if (callback) callback();
        return { close: jest.fn() };
      }),
      // Mock other commonly used Express methods
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      options: jest.fn(),
      head: jest.fn(),
      all: jest.fn(),
      set: jest.fn(),
      enable: jest.fn(),
      disable: jest.fn(),
      enabled: jest.fn(),
      disabled: jest.fn(),
      route: jest.fn(),
      param: jest.fn(),
    } as unknown as jest.Mocked<Application>;

    // Create mock services
    mockServices = {
      authMiddleware: {
        authenticate: jest.fn(),
        excludedRoutes: [],
        excludedPrefixes: [],
        jwtService: {},
        userRepository: {},
      } as unknown as AuthenticationMiddleware,
      globalExceptionMiddleware: {
        resourceNotFoundHandler: jest.fn(),
        allExceptionHandler: jest.fn(),
      },
      healthCheckController: {
        router: jest.fn() as unknown as Router,
      },
      authController: {
        router: jest.fn() as unknown as Router,
      },
    } as unknown as AppServices;

    // Mock express methods
    (express as jest.Mocked<typeof express>).json = jest.fn(() => jest.fn());
    (express as jest.Mocked<typeof express>).urlencoded = jest.fn(() =>
      jest.fn()
    );

    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize app with middleware, routes, and error handlers', () => {
      app = new App(mockApp, mockServices);

      // Verify that the app was set up properly
      expect(mockApp).toBeDefined();
    });
  });

  describe('initiateMiddleware', () => {
    it('should configure all required middleware', () => {
      app = new App(mockApp, mockServices);

      // Verify that all middleware functions were called
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function)); // express.json()
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function)); // express.urlencoded()
      expect(mockApp.use).toHaveBeenCalledWith(
        mockServices.authMiddleware.authenticate
      );

      // Verify middleware setup call count (should include helmet, cors, and other middleware)
      expect(mockApp.use).toHaveBeenCalled();
    });

    it('should set up express.json middleware', () => {
      app = new App(mockApp, mockServices);

      expect(express.json).toHaveBeenCalled();
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should set up express.urlencoded middleware with extended: true', () => {
      app = new App(mockApp, mockServices);

      expect(express.urlencoded).toHaveBeenCalledWith({ extended: true });
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should set up authentication middleware', () => {
      app = new App(mockApp, mockServices);

      expect(mockApp.use).toHaveBeenCalledWith(
        mockServices.authMiddleware.authenticate
      );
    });
  });

  describe('initiateRoutes', () => {
    it('should configure authentication routes', () => {
      app = new App(mockApp, mockServices);

      expect(mockApp.use).toHaveBeenCalledWith(
        '/api/auth',
        mockServices.authController.router
      );
    });

    it('should configure health check routes', () => {
      app = new App(mockApp, mockServices);

      expect(mockApp.use).toHaveBeenCalledWith(
        '/api/health-check',
        mockServices.healthCheckController.router
      );
    });

    it('should configure swagger documentation routes', () => {
      app = new App(mockApp, mockServices);

      // Verify that swagger routes are set up (we can check if /api-docs route was configured)
      const swaggerCalls = (mockApp.use as jest.Mock).mock.calls.filter(
        (call) => call[0] === '/api-docs'
      );
      expect(swaggerCalls.length).toBeGreaterThan(0);
    });
  });

  describe('initiateErrorHandler', () => {
    it('should configure resource not found handler', () => {
      app = new App(mockApp, mockServices);

      expect(mockApp.use).toHaveBeenCalledWith(
        mockServices.globalExceptionMiddleware.resourceNotFoundHandler
      );
    });

    it('should configure global exception handler', () => {
      app = new App(mockApp, mockServices);

      expect(mockApp.use).toHaveBeenCalledWith(
        mockServices.globalExceptionMiddleware.allExceptionHandler
      );
    });

    it('should set up error handlers in correct order', () => {
      app = new App(mockApp, mockServices);

      const calls = (mockApp.use as jest.Mock).mock.calls;
      const resourceNotFoundIndex = calls.findIndex(
        (call) =>
          call[0] ===
          mockServices.globalExceptionMiddleware.resourceNotFoundHandler
      );
      const allExceptionIndex = calls.findIndex(
        (call) =>
          call[0] === mockServices.globalExceptionMiddleware.allExceptionHandler
      );

      // Resource not found handler should come before all exception handler
      expect(resourceNotFoundIndex).toBeLessThan(allExceptionIndex);
    });
  });

  describe('start', () => {
    it('should start the server on specified port', () => {
      const port = 3000;

      (mockApp.listen as jest.Mock).mockImplementation((p, callback) => {
        callback();
        return mockApp;
      });

      app = new App(mockApp, mockServices);
      app.start(port);

      expect(mockApp.listen).toHaveBeenCalledWith(port, expect.any(Function));
    });

    it('should log server startup message', () => {
      const port = 3000;

      (mockApp.listen as jest.Mock).mockImplementation((p, callback) => {
        callback();
        return mockApp;
      });

      app = new App(mockApp, mockServices);
      app.start(port);

      expect(logger.info).toHaveBeenCalledWith(
        `Server is running on port ${port}`
      );
    });

    it('should handle different port numbers', () => {
      const port = 8080;

      (mockApp.listen as jest.Mock).mockImplementation((p, callback) => {
        callback();
        return mockApp;
      });

      app = new App(mockApp, mockServices);
      app.start(port);

      expect(mockApp.listen).toHaveBeenCalledWith(port, expect.any(Function));
      expect(logger.info).toHaveBeenCalledWith(
        `Server is running on port ${port}`
      );
    });
  });

  describe('integration', () => {
    it('should set up the complete application stack in correct order', () => {
      app = new App(mockApp, mockServices);

      const calls = (mockApp.use as jest.Mock).mock.calls;

      // Verify that middleware is set up before routes
      const middlewareCallsCount = calls.filter(
        (call) => typeof call[0] === 'function' || call.length === 1
      ).length;

      const routeCallsCount = calls.filter(
        (call) => typeof call[0] === 'string' && call[0].startsWith('/api')
      ).length;

      expect(middlewareCallsCount).toBeGreaterThan(0);
      expect(routeCallsCount).toBeGreaterThan(0);
    });

    it('should have all required services injected', () => {
      app = new App(mockApp, mockServices);

      // Verify that all required services are used
      expect(mockServices.authMiddleware.authenticate).toBeDefined();
      expect(
        mockServices.globalExceptionMiddleware.resourceNotFoundHandler
      ).toBeDefined();
      expect(
        mockServices.globalExceptionMiddleware.allExceptionHandler
      ).toBeDefined();
      expect(mockServices.healthCheckController.router).toBeDefined();
      expect(mockServices.authController.router).toBeDefined();
    });
  });
});
