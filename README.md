# CarBroz Customer Backend

This repository contains the Node.js / Fastify backend for the CarBroz (CarWash) Customer Application. It relies heavily on a **Server-Driven UI (SDUI)** architecture to serve complete screen layouts as JSON structures directly to the mobile frontend (Compose Multiplatform/iOS).

---

## 🏗 System Architecture & SDUI Flow

When the frontend app needs to display a screen (for example, the Login screen), it doesn't have hardcoded UI elements. Instead, it asks the backend: *"What should I render on this screen?"*. 

The backend constructs a full UI tree (templates, components, rows, texts, buttons) and returns it as a JSON payload. The frontend then dynamically renders the screen based on this payload.

### Step-by-Step Request Flow

Here is the exact lifecycle of how a screen request is processed from the moment the frontend makes the API call to when the JSON is returned.

#### 1. The HTTP Request (`server.ts` & `app.ts`)
The API call begins at `server.ts` which boots up the Fastify application constructed in `app.ts`. The frontend sends a `GET` request such as:
```
GET /api/v1/screen/auth_login
```
All plugins (like CORS, Helmet, JWT) and request logging hooks process the request first.

#### 2. The UI Routes (`src/ui/ui.routes.ts`)
The request hits the UI router which uses a wildcard route catcher (`/*`). 
- It extracts the `screenId` from the URL path (in this case, `auth_login`).
- It passes the request over to the **UIController**.

#### 3. The UI Controller (`src/ui/controller/UIController.ts`)
The `UIController` acts as the conductor. 
- It checks if the user is authenticated via JWT (`request.user`).
- It prepares a `context` object containing session data.
- It asks the **ScreenFactory** to build the screen for the given `screenId`.

#### 4. The Screen Factory (`src/ui/factory/ScreenFactory.ts`)
The `ScreenFactory` is responsible for mapping screen IDs to their specific builders.
- During server startup, `ScreenFactory` dynamically scanned the `src/ui/builders/` directory and registered all available builders (classes that extend `BaseScreenBuilder`).
- It looks up the builder registered for `auth_login` (which is `AuthLoginBuilder`).
- It triggers the `build(context)` method on the selected builder.

#### 5. UI Composition Layer (e.g., `src/ui/builders/AuthLoginBuilder.ts`)
This is where the magic happens. The Builder constructs the UI layout hierarchically using the `UI` utility (`src/ui/utils/UI.ts`):
- **Template**: It initializes a `BaseTemplate` (e.g., `form_template`).
- **Components**: It creates components like `login_root_component` and sets properties like width/height/color.
- **Subcomponents & Children**: It groups atoms (buttons, images, texts) into rows or columns.
- **Actions**: It binds actions to buttons, such as `api_call` with the `auth/send_otp` endpoint.
- It returns a completely populated `IScreen` object tree.

#### 6. JSON Serialization (`src/ui/serializer/JsonSerializer.ts`)
The `UIController` receives the complex `IScreen` object tree from the factory and hands it to the `JsonSerializer`.
- The Serializer recursively flattens and formats the object tree into the precise JSON specification expected by the frontend engine.
- This ensures all layout modifiers, padding, typographies, and constraints are strictly formatted.

#### 7. The Final Response
The `UIController` sends the serialized JSON response back to the client with a `200 OK`. The frontend receives the JSON, parses the component tree, and draws the screen!

---

## 📂 Project Structure

```
backend/
├── apps/backend-api/src/
│   ├── modules/          # Business logic domains (e.g., Auth, Users)
│   │   └── auth/         # Authentication endpoints, logic, repositories
│   ├── ui/               # Server-Driven UI (SDUI) Engine
│   │   ├── builders/     # Individual screen builders (AuthLoginBuilder, etc.)
│   │   ├── components/   # Base classes for UI Components
│   │   ├── controller/   # UIController for handling /screen endpoints
│   │   ├── factory/      # Auto-loads and manages Builders
│   │   ├── models/       # TypeScript interfaces for the SDUI tree
│   │   ├── serializer/   # Converts UI objects to JSON format
│   │   └── ui.routes.ts  # Express/Fastify routes for SDUI
│   ├── plugins/          # Fastify plugins (JWT, Context)
│   ├── app.ts            # Fastify App Initialization
│   └── server.ts         # Server Entry Point
├── packages/             # Monorepo shared packages (Common, Config, DB, Logger)
└── prisma/               # Database schemas & migrations
```

## 🚀 Running Locally

Ensure you have Node.js and `pnpm` installed.

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Start the Development Server**
   ```bash
   pnpm run dev
   ```

The API will be available at `http://localhost:8080`.
