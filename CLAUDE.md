# Lucía Arana Electron Project

## Project Setup
This project was created using Electron Forge with the Vite template and then integrated with existing Vite project code.

## Architecture
- **Main Process**: Electron main process (Node.js environment)
- **Renderer Process**: Vite-powered frontend with modern web technologies
- **Build System**: Electron Forge handles packaging and distribution

## Coding Conventions

### TypeScript/JavaScript Standards
- **Use `const`** for all variable declarations that don't need reassignment
- **Use proper TypeScript types** throughout the codebase
- **Avoid `let`** unless variable reassignment is necessary
- **Never use `var`** - it's deprecated and has scope issues

### Example:
```typescript
// ✅ Good
const config: AppConfig = {
  theme: 'dark',
  version: '1.0.0'
};

const users: User[] = await fetchUsers();

// ❌ Avoid
let config = { theme: 'dark' };
var version = '1.0.0';
```

## Development Commands
- `npm start` - Start development mode
- `npm run build` - Build for production
- `npm run lint` - Run linting (if configured)
- `npm run typecheck` - Type checking (if configured)

## Project Structure
- `src/` - Source code
- `src/electron-main.js` - Main Electron process
- Vite configuration handles the renderer process build