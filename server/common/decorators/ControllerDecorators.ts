import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import RequestValidationMiddleware from '../../middleware/RequestValidationMiddleware';

// Types for decorator metadata
interface RouteMetadata {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  path: string;
  validationSchema?: object;
  statusCode?: number;
}

// Symbol keys for storing metadata
const ROUTES_KEY = Symbol('routes');
const BASE_PATH_KEY = Symbol('basePath');

// Controller decorator
export function Controller(basePath: string = '') {
  return function <T extends { new (...args: any[]): any }>(
    constructor: T
  ): void {
    Reflect.defineMetadata(BASE_PATH_KEY, basePath, constructor);
  };
}

// HTTP method decorators
export function Post(
  path: string,
  options?: { validate?: object; statusCode?: number }
) {
  return function (
    target: object,
    propertyKey: string,
    _descriptor: PropertyDescriptor
  ) {
    addRoute(
      target,
      {
        method: 'post',
        path,
        validationSchema: options?.validate,
        statusCode: options?.statusCode || 200,
      },
      propertyKey
    );
  };
}

export function Get(
  path: string,
  options?: { validate?: object; statusCode?: number }
) {
  return function (
    target: object,
    propertyKey: string,
    _descriptor: PropertyDescriptor
  ) {
    addRoute(
      target,
      {
        method: 'get',
        path,
        validationSchema: options?.validate,
        statusCode: options?.statusCode || 200,
      },
      propertyKey
    );
  };
}

export function Put(
  path: string,
  options?: { validate?: object; statusCode?: number }
) {
  return function (
    target: object,
    propertyKey: string,
    _descriptor: PropertyDescriptor
  ) {
    addRoute(
      target,
      {
        method: 'put',
        path,
        validationSchema: options?.validate,
        statusCode: options?.statusCode || 200,
      },
      propertyKey
    );
  };
}

export function Delete(
  path: string,
  options?: { validate?: object; statusCode?: number }
) {
  return function (
    target: object,
    propertyKey: string,
    _descriptor: PropertyDescriptor
  ) {
    addRoute(
      target,
      {
        method: 'delete',
        path,
        validationSchema: options?.validate,
        statusCode: options?.statusCode || 200,
      },
      propertyKey
    );
  };
}

// Helper function to add route metadata
function addRoute(target: object, route: RouteMetadata, methodName: string) {
  const routes = Reflect.getMetadata(ROUTES_KEY, target) || [];
  routes.push({ ...route, methodName });
  Reflect.defineMetadata(ROUTES_KEY, routes, target);
}

// Base controller class with automatic route registration
export abstract class BaseController {
  public readonly router: express.Router;

  constructor(router: express.Router) {
    this.router = router;
    this.registerRoutes();
  }

  private registerRoutes() {
    const routes = Reflect.getMetadata(ROUTES_KEY, this) || [];
    const basePath = Reflect.getMetadata(BASE_PATH_KEY, this.constructor) || '';

    routes.forEach((route: RouteMetadata & { methodName: string }) => {
      const fullPath = basePath + route.path;
      const middlewares: express.RequestHandler[] = [];

      // Add validation middleware if schema is provided
      if (route.validationSchema) {
        middlewares.push(
          RequestValidationMiddleware.validate(route.validationSchema)
        );
      }

      // Add the controller method with error handling
      middlewares.push(
        async (req: Request, res: Response, next: NextFunction) => {
          try {
            // Use 'as any' to allow method invocation, since we know the method exists
            const result = await (this as any)[route.methodName](
              req,
              res,
              next
            );

            // If the method hasn't already sent a response
            if (result !== undefined && !res.headersSent) {
              res.status(route.statusCode || 200).json(result);
            }
          } catch (error) {
            next(error);
          }
        }
      );

      // Register the route with Express
      this.router[route.method](fullPath, ...middlewares);
    });
  }
}

// Additional utility decorators
export function HttpStatus(statusCode: number) {
  return function (
    target: object,
    propertyKey: string,
    _descriptor: PropertyDescriptor
  ) {
    const existingRoutes = Reflect.getMetadata(ROUTES_KEY, target) || [];
    const routeIndex = existingRoutes.findIndex(
      (r: RouteMetadata & { methodName: string }) =>
        r.methodName === propertyKey
    );
    if (routeIndex !== -1) {
      existingRoutes[routeIndex].statusCode = statusCode;
      Reflect.defineMetadata(ROUTES_KEY, existingRoutes, target);
    }
  };
}
