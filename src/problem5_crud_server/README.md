# Problem 5 Solution - Code Challenge

## Introduction

This project is the solution for Problem 5 of the code challenge test. The application simulates a resource collection that has a many-to-one relationship with an author collection. The tech stack including:

- **Express.js** for the server-side framework.
- **TypeScript** for static typing and enhanced code quality.
- **Prisma** for handling the ORM and interacting with the database.
- **PM2** for process management.
- **Husky** For Git hooks (commit hooks)
- **Jest** Testing framework
- **Supertest** HTTP assertion library for testing API routes

## Prerequisites

Before you start, make sure you have the following installed on your machine:

- **Docker**
- **Node.js**
- **Yarn**

## Getting Started

### Option 1: Using Docker (Recommended)

The easiest way to get started with this project is to use Docker. It will take care of setting up the environment and dependencies automatically.

1. **Copy the environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Build and start the project using Docker**:
   ```bash
   docker-compose up --build
   ```

   This will:
   - Build the Docker images.
   - Start up the application with all necessary services.

3. **Access the app** at `http://localhost:3000`.

### Option 2: Local Setup

If you prefer to run the application locally, follow these steps:

1. **Install dependencies**:
   ```bash
   yarn
   ```
2. **Start the application**:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

4. **Access the app** at `http://localhost:3000`.

### Sample Requests

In the `.http` file located in the project, you'll find some sample requests. Treat it as a **playground** to interact with the app and explore its endpoints.

