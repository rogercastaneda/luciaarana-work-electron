# Lucía Arana Work Management

Electron application for work management built with Vite and React.

## Development

### Start Development Mode
```bash
npm start
```

### Development with Auto-rebuild
```bash
npm run dev
```
This builds the Vite components and starts the Electron application.

## Building and Packaging

### Build Application (Package for Current Platform)
```bash
npm run build-vite
```
This creates a packaged application for your current platform in the `out/` directory.

### Create Installers

#### For macOS (Silicon/ARM64 and Intel)
```bash
npm run make
```

#### For Specific Platform
You can specify the platform by modifying the make command:
```bash
npx electron-forge make --platform=darwin --arch=arm64    # macOS Silicon
npx electron-forge make --platform=darwin --arch=x64     # macOS Intel
npx electron-forge make --platform=linux --arch=x64      # Linux
npx electron-forge make --platform=win32 --arch=x64      # Windows
```

### Complete Build + Installer
```bash
npm run make-installers
```
This runs the build and then creates installers for your platform.

## Project Structure

- `src/` - Source code
  - `electron-main.js` - Main Electron process
  - `main.tsx` - React application entry point
  - `components/` - React components
  - `lib/` - Utilities and libraries
- `out/` - Built application and installers (generated)
- `.vite/` - Vite build output (generated)

## Technology Stack

- **Electron Forge** - Application packaging and distribution
- **Vite** - Frontend build tool
- **React** - UI framework  
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling