# Story Generator Frontend

Fronted of the web application for generating and managing AI-powered stories.

## Features

- Story generation and management
- Chapter content editing
- Media generation (audio, video)
- YouTube integration
- Publishing management
- Real-time status updates

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Backend service running (see backend README)

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
```bash
cd frontend
```

3. Install dependencies:
```bash
npm install
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Development

The development server will start on `http://localhost:5173` by default.

### Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API service integrations
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── App.tsx        # Main application component
├── public/            # Static assets
└── index.html         # Entry HTML file
```

### Key Technologies

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Query
- React Router

## Building for Production

1. Build the application:
```bash
npm run build
```

2. Preview the production build:
```bash
npm run preview
```

The production build will be available in the `dist` directory.
