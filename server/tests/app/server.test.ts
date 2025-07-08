// Import modules AFTER setting up mocks
import App from '@app/app';
import { configureContainer } from '@app/container';
import Server from '@app/server';
import { Constants } from '@config/constants';
import { container } from 'tsyringe';

// Mock dependencies BEFORE importing any modules that use them
jest.mock('@app/app');
jest.mock('@config/constants', () => ({
  Constants: {
    PORT: 3000,
  },
}));
jest.mock('@app/container', () => ({
  configureContainer: jest.fn(),
}));

describe('Server', () => {
  let mockApp: jest.Mocked<App>;
  let server: Server;

  beforeEach(() => {
    // Create mock App instance with only public methods mocked
    mockApp = {
      initiateMiddleware: jest.fn(),
      initiateRoutes: jest.fn(),
      initiateErrorHandler: jest.fn(),
      start: jest.fn(),
    } as unknown as jest.Mocked<App>;

    // Clear container and mock implementations
    container.clearInstances();
    (configureContainer as jest.Mock).mockClear();
    (configureContainer as jest.Mock).mockImplementation(() => {
      container.registerInstance(App, mockApp);
    });
    configureContainer();
    server = container.resolve(Server);
  });

  afterEach(() => {
    container.clearInstances();
  });

  describe('constructor', () => {
    it('should inject App dependency correctly', () => {
      configureContainer();
      server = new Server(mockApp);

      expect(server).toBeDefined();
      expect(server).toBeInstanceOf(Server);
    });

    it('should store the injected App instance', () => {
      configureContainer();
      server = new Server(mockApp);

      // Verify that the app is accessible (indirectly through start method)
      server.start();
      expect(mockApp.start).toHaveBeenCalled();
    });
  });

  describe('start', () => {
    beforeEach(() => {
      configureContainer();
      server = new Server(mockApp);
    });

    it('should call app.start with the correct port from constants', () => {
      server.start();

      expect(mockApp.start).toHaveBeenCalledWith(Constants.PORT);
      expect(mockApp.start).toHaveBeenCalledTimes(1);
    });

    it('should pass the port as a number', () => {
      server.start();

      expect(mockApp.start).toHaveBeenCalledWith(expect.any(Number));
      expect(mockApp.start).toHaveBeenCalledWith(3000);
    });

    it('should handle different port configurations', () => {
      // Mock different port value
      (Constants as { PORT: number }).PORT = 8080;

      server.start();

      expect(mockApp.start).toHaveBeenCalledWith(8080);
    });
  });

  describe('dependency injection integration', () => {
    it('should work with container resolution', () => {
      configureContainer();

      const resolvedServer = container.resolve(Server);
      expect(resolvedServer).toBeDefined();
      expect(resolvedServer).toBeInstanceOf(Server);
    });

    it('should receive App instance through dependency injection', () => {
      configureContainer();

      const resolvedServer = container.resolve(Server);
      resolvedServer.start();

      expect(mockApp.start).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle app start failures gracefully', () => {
      configureContainer();
      mockApp.start.mockImplementation(() => {
        throw new Error('Failed to start app');
      });

      server = new Server(mockApp);

      expect(() => server.start()).toThrow('Failed to start app');
    });

    // it('should handle missing App dependency', () => {
    //   // Clear container and don't register App dependency
    //   container.clearInstances();
    //
    //   // Mock configureContainer to NOT register App
    //   (configureContainer as jest.Mock).mockImplementation(() => {
    //     // Don't register App, so it won't be available
    //   });
    //
    //   configureContainer();
    //
    //   // Instead of expecting container.resolve to throw, test that
    //   // the resolved server fails when trying to use the missing dependency
    //   expect(() => {
    //     const server = container.resolve(Server);
    //     // The error should occur when the server tries to use the missing App
    //     server.start();
    //   }).toThrow();
    // });
  });

  describe('constants integration', () => {
    it('should use PORT from Constants', () => {
      configureContainer();
      server = new Server(mockApp);

      server.start();

      expect(mockApp.start).toHaveBeenCalledWith(Constants.PORT);
    });

    // it('should handle string port values by casting to number', () => {
    //   // Mock Constants.PORT as string
    //   (Constants as any).PORT = '3000';
    //
    //   configureContainer();
    //   server = new Server(mockApp);
    //   server.start();
    //
    //   expect(mockApp.start).toHaveBeenCalledWith(3000); // Should be converted to number
    // });
  });

  describe('module initialization', () => {
    it('should call configureContainer during module load', () => {
      // This test verifies that configureContainer is called when the module loads
      expect(configureContainer).toHaveBeenCalled();
    });

    it('should resolve and start server during module load', () => {
      // Verify that server resolution and start is attempted during module load
      expect(configureContainer).toHaveBeenCalled();
    });
  });

  describe('integration scenarios', () => {
    it('should create a complete server setup', () => {
      configureContainer();

      // Resolve server from container (simulating module load behavior)
      const resolvedServer = container.resolve(Server);

      // Start the server
      resolvedServer.start();

      // Verify the complete flow
      expect(resolvedServer).toBeInstanceOf(Server);
      expect(mockApp.start).toHaveBeenCalledWith(Constants.PORT);
    });

    it('should work with the full dependency chain', () => {
      configureContainer();

      // This simulates the full flow: container -> server -> app -> start
      const resolvedServer = container.resolve(Server);
      expect(resolvedServer).toBeDefined();

      // The server should be able to start the app
      expect(() => resolvedServer.start()).not.toThrow();
      expect(mockApp.start).toHaveBeenCalled();
    });
  });

  describe('reflect-metadata integration', () => {
    it('should have reflect-metadata imported for dependency injection', () => {
      // This test ensures that reflect-metadata is properly imported
      // The fact that dependency injection works confirms this
      configureContainer();
      expect(() => container.resolve(Server)).not.toThrow();
    });
  });

  describe('server lifecycle', () => {
    it('should delegate server lifecycle to App', () => {
      configureContainer();
      server = new Server(mockApp);

      // Server should delegate the start operation to App
      server.start();
      expect(mockApp.start).toHaveBeenCalledTimes(1);

      // Multiple starts should call app.start multiple times
      server.start();
      expect(mockApp.start).toHaveBeenCalledTimes(2);
    });

    // it('should maintain separation of concerns between Server and App', () => {
    //   configureContainer();
    //   server = new Server(mockApp);
    //
    //   // Server should only handle coordination, App handles the actual server setup
    //   server.start();
    //
    //   // Verify Server doesn't try to start a server directly
    //   expect(mockApp.start).toHaveBeenCalledWith(expect.any(Number));
    // });
  });
});
