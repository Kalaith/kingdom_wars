# Kingdom Wars - Text-Based Strategy Game

## Overview
Kingdom Wars is a browser-based text strategy game built with React, TypeScript, and Vite. Players build kingdoms, manage resources, train armies, and engage in strategic warfare with other kingdoms.

## Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kingdom-wars/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API integration layer
│   ├── components/
│   │   ├── game/         # Game-specific components
│   │   └── ui/           # Reusable UI components
│   ├── data/             # Game data and configurations
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # Zustand state management
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions and constants
│   └── assets/           # Static assets
├── public/               # Public assets
└── dist/                 # Build output
```

## Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand with persist middleware
- **Animation**: Framer Motion
- **Routing**: React Router DOM
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint
- **Formatting**: Prettier

## Features

### Kingdom Management
- Resource system (Gold, Food, Wood, Stone)
- Building construction and upgrades
- Population and happiness management

### Military Strategy
- Multiple unit types with different strengths
- Combat system with attack/defense calculations
- Training queue management

### Research and Technology
- Technology tree for strategic advancement
- Research bonuses for economy and military

### Multiplayer Elements
- Enemy kingdoms to attack
- Alliance system for cooperation

## Development

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Husky for git hooks (planned)

### Testing
- Unit tests with Vitest
- Integration tests with Testing Library
- Test coverage reporting

### State Management
- Zustand for global state
- Automatic persistence with localStorage
- Selective state persistence

## Deployment

1. Build the project:
```bash
npm run build
```

2. The build artifacts will be stored in the `dist/` directory.

3. Serve the `dist` folder with any static hosting service.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the individual component README files for details.

Part of the WebHatchery game collection.