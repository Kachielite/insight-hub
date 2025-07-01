import 'reflect-metadata';
import { container } from 'tsyringe';
import express from 'express';
import App from '@app/app';
import Server from '@app/server';

// Register a factory for App
container.register<App>(App, {
  useFactory: () => new App(express()),
});

const server = container.resolve(Server);
server.start();
