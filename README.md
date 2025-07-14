# 📊 InsightHub – Enterprise-Grade SaaS Dashboard

InsightHub is a full-stack SaaS dashboard built with **Clean Architecture** and **Domain-Driven Design** principles. Designed for scalability and maintainability, it helps teams manage projects, track productivity, and visualize performance through rich data insights.

> 🚧 **Status**: Active Development | Production-Ready Architecture

---

## 🏗️ Architecture Overview

This application follows **Clean Architecture** principles with clear separation of concerns:

### Backend Architecture (Node.js/TypeScript)

- **Layered Architecture**: Controller → Service → Repository → Database
- **Dependency Injection**: Using `tsyringe` for IoC container management
- **Interface Segregation**: Abstract interfaces for all services and repositories
- **Domain-Driven Design**: Clear domain models and business logic separation

### Frontend Architecture (React/TypeScript)

- **Clean Architecture**: Presentation → Domain → Data layers
- **Feature-Based Structure**: Organized by business domains
- **Functional Programming**: Using `fp-ts` for error handling with Either monads
- **Dependency Injection**: `tsyringe` for consistent DI across client and server
- **Use Case Pattern**: Business logic encapsulated in use cases

---

## 🔧 Tech Stack

### Backend

- **Runtime**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Architecture**: Clean Architecture + DDD
- **DI Container**: TSyringe for dependency injection
- **Security**: JWT Authentication + Bcrypt + Helmet
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with comprehensive test coverage
- **Logging**: Winston for structured logging

### Frontend

- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router v6 with protected routes
- **State Management**: Custom hooks + Context (considering Zustand)
- **Error Handling**: fp-ts Either monads for functional error handling
- **HTTP Client**: Axios with interceptors
- **Theme**: next-themes for dark/light mode
- **Testing**: Jest + React Testing Library

### DevOps & Quality

- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Git Hooks**: Commitlint for conventional commits
- **Testing**: Unit, Integration, and E2E test coverage
- **CI/CD**: GitHub Actions (planned)
- **Code Quality**: SonarQube integration

---

## 📁 Project Structure

### Backend (Clean Architecture)

```
server/
├── app/                   # Application entry point & DI container
│   ├── app.ts             # Express app configuration
│   ├── container.ts       # Dependency injection setup
│   └── server.ts          # Server bootstrap
├── controller/            # API controllers (Presentation layer)
├── service/               # Business logic (Application layer)
│   ├── I*.ts             # Service interfaces
│   └── implementation/   # Concrete service implementations
├── repository/           # Data access (Infrastructure layer)
│   ├── I*.ts            # Repository interfaces
│   └── implementation/  # Repository implementations
├── dto/                 # Data Transfer Objects
├── middleware/          # Express middleware
├── prisma/             # Database schema & migrations
└── utils/              # Shared utilities
```

### Frontend (Feature-Based Clean Architecture)

```
client/src/
├── core/                   # Shared application core
│   ├── common/             # Shared UI components & layouts
│   ├── error/              # Error handling utilities
│   ├── network/            # HTTP client configuration
│   ├── routes/             # Application routing
│   ├── use-case/           # Base use case abstractions
│   └── validation/         # Shared validation schemas
├── features/               # Feature modules (DDD bounded contexts)
│   └── Authentication/     # Example feature module
│       ├── data/           # Data layer (repositories, datasources)
│       │   ├── datasource/    # External data sources
│       │   ├── model/         # Data models
│       │   └── repositories/  # Repository implementations
│       ├── domain/         # Domain layer (business logic)
│       │   ├── entity/        # Domain entities
│       |   ├── repositories/  # Repository interfaces
│       │   └── use-case/      # Business use cases
│       └── presentation/  # Presentation layer (UI)
│           ├── components/    # Feature-specific components
│           ├── hooks/         # Custom React hooks
│           └── pages/         # Page components
└── init-dependencies/     # Dependency injection configuration
```

---

## 🏛️ Design Patterns & Principles

### Backend Patterns

- **Repository Pattern**: Data access abstraction
- **Service Layer Pattern**: Business logic encapsulation
- **Dependency Injection**: Loose coupling via IoC container
- **Middleware Pattern**: Cross-cutting concerns (auth, logging, errors)
- **DTO Pattern**: Data transfer and validation

### Frontend Patterns

- **Clean Architecture**: Dependency rule enforcement
- **Use Case Pattern**: Business logic isolation
- **Repository Pattern**: Data access abstraction
- **Either Monad**: Functional error handling
- **Presentation-Domain Separation**: UI logic separation

### SOLID Principles

- ✅ **Single Responsibility**: Each class has one reason to change
- ✅ **Open/Closed**: Open for extension, closed for modification
- ✅ **Liskov Substitution**: Interfaces are substitutable
- ✅ **Interface Segregation**: Focused, minimal interfaces
- ✅ **Dependency Inversion**: Depend on abstractions, not concretions

---

## 🔐 Authentication & Security

- **JWT-based Authentication** with refresh token rotation
- **Role-based Access Control** (RBAC) with middleware guards
- **Password Security** with bcrypt hashing and salt rounds
- **Route Protection** with React Router loaders
- **CORS Configuration** for cross-origin requests
- **Request Validation** with Zod schemas
- **Security Headers** via Helmet middleware

---

## 📦 Features

- 🔐 **Enterprise Authentication**: JWT + RBAC + Password reset flows
- 👥 **User Management**: Role-based user administration
- 📊 **Analytics Dashboard**: Performance metrics and insights
- 🏗️ **Scalable Architecture**: Clean Architecture + DDD principles
- 🧪 **Comprehensive Testing**: Unit, integration, and E2E tests
- 🎨 **Modern UI/UX**: Dark/light themes + responsive design
- 📱 **Mobile-First Design**: Progressive web app capabilities
- 🔍 **API Documentation**: Interactive Swagger documentation
- 📈 **Performance Monitoring**: Request logging and error tracking

---

## 🧑 Author

**Derrick Onyekachi**  
Software Engineer | JavaScript Enthusiast

## [LinkedIn](https://www.linkedin.com/in/derrick-madumere/) | [Email](mailto:derrick.madumere@gmail.com)

_Made with 💻 in progress. Follow along as the project evolves!_
