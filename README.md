# Lucía Arana Work Management

Portfolio and work management desktop application built with Electron Forge and Vite. Manages project portfolios with media files, categorization, hero images, and project relationships.

## Features

- 📁 **Hierarchical Project Management** - Categories and projects with full CRUD operations
- 🖼️ **Hero Images** - Optional cover images for each project stored in Contentful
- 🔗 **Related Projects** - Link up to 2 related projects per project for portfolio presentation  
- 📱 **Media Management** - Drag & drop upload for photos and videos with Contentful integration
- 🔍 **Advanced Search** - Project selection with category grouping and filtering
- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- 🌙 **Theme Support** - Dark/light theme capabilities
- ⚡ **Hot Reload** - Fast development with Vite integration

## Technology Stack

- **Desktop**: Electron 37.4.0 with Electron Forge 7.11.1
- **Build Tool**: Vite 7.3.1 via `@electron-forge/plugin-vite`
- **Package Manager**: pnpm 10.21.0 (with hoisted node-linker for Electron compatibility)
- **Frontend**: React 18.3.1 + TypeScript 5.8.3
- **UI Library**: shadcn/ui + Radix UI primitives + Tailwind CSS 3.4.13
- **Database**: PostgreSQL hosted on Neon with `@neondatabase/serverless`
- **Media Storage**: Contentful CMS integration
- **Forms**: React Hook Form 7.60.0 + Zod 3.25.67 validation
- **Icons**: Lucide React 0.454.0

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v10.21.0 or higher) - Install with `npm install -g pnpm` or `corepack enable`
- PostgreSQL database (Neon)
- Contentful account for media storage

### Installation

1. Clone the repository

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables for database and Contentful connections

### Important: pnpm Configuration

This project uses **pnpm with hoisted node-linker** for compatibility with Electron Forge. The `.npmrc` file is already configured with:

```
node-linker=hoisted
```

**Why hoisted?** Electron Forge's packaging process requires a flat node_modules structure to properly bundle native dependencies like `fs-xattr` (used by the DMG maker). The default pnpm symlinked structure doesn't work with Electron's module resolution.

### Development

#### Start Development Mode (Recommended)
```bash
pnpm start
```
Launches Electron app with Vite dev server and hot reload for both React components and Electron main process.

#### Vite Only Development
```bash
pnpm run dev:vite
```
Starts only the Vite dev server for web-only development and testing.

## Building and Distribution

### Package Application
```bash
pnpm run package
```
Creates a packaged application for your current platform in the `out/` directory.

### Create Installers
```bash
pnpm run make
```
Creates platform-specific installers:
- **macOS**: .dmg files
- **Windows**: .exe installers via Squirrel
- **Linux**: .deb and .rpm packages

**Output location**: `out/make/`

### Cross-Platform Builds
```bash
pnpm exec electron-forge make --platform=darwin --arch=arm64    # macOS Apple Silicon
pnpm exec electron-forge make --platform=darwin --arch=x64     # macOS Intel
pnpm exec electron-forge make --platform=linux --arch=x64      # Linux
pnpm exec electron-forge make --platform=win32 --arch=x64      # Windows
```

### Complete Build Pipeline
```bash
pnpm run make-installers
```
Runs the complete pipeline: package + create installers.

### Troubleshooting Native Module Compilation

If you encounter errors related to native modules (like `fs-xattr`) during the build process:

1. **Ensure hoisted configuration**: Verify `.npmrc` contains `node-linker=hoisted`
2. **Clean reinstall**:
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```
3. **Rebuild native modules** (if needed):
   ```bash
   pnpm rebuild
   ```

**Common issues**:
- `Cannot find module './build/Release/xattr'` → Native modules not compiled, run clean reinstall
- Architecture mismatch errors → Ensure you're building for the correct target architecture

## Project Structure

```
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── media-drop-zone.tsx
│   │   ├── hero-image-upload.tsx
│   │   ├── related-projects-selector.tsx
│   │   └── project-select-with-filter.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── use-folders.ts   # Project management
│   │   └── use-media.ts     # Media management
│   ├── lib/
│   │   ├── actions/         # Database operations
│   │   └── utils/           # Utility functions
│   ├── modules/
│   │   └── database/        # Database layer with types
│   ├── services/            # External integrations
│   │   └── contentful.ts    # Contentful API client
│   ├── App.tsx             # Main React application
│   ├── main.tsx            # React entry point
│   └── electron-main.js    # Electron main process
├── scripts/                # Database migrations
├── out/                    # Built applications (generated)
└── .vite/                  # Vite build output (generated)
```

## Database Schema

### Folders Table
Stores both categories (parent folders) and projects:
- `id`, `name`, `slug`, `parent_id`, `is_parent`
- `hero_image_url` (Contentful URL)
- `related_project_1_id`, `related_project_2_id` (foreign keys)
- `created_at`, `updated_at`

### Media Table
References to Contentful media files:
- `id`, `folder_id`, `contentful_asset_id`, `file_url`, `file_type`
- `original_name`, `file_size`, `display_order`, `layout_type`
- `created_at`, `updated_at`

## Key Features Explained

### Project Hierarchy
- **Categories**: Top-level containers (is_parent=true)
- **Projects**: Created within categories (is_parent=false)
- Full CRUD operations with context menus and modals

### Hero Images
- Optional cover images per project
- Uploaded to Contentful, URLs stored in database
- Specialized upload component with preview

### Related Projects
- Each project can link to up to 2 other projects
- Advanced selector with category grouping and search
- Useful for portfolio presentation and project relationships

### Media Management
- Drag & drop interface for photos and videos
- All files stored in Contentful CMS
- Database stores metadata and references
- Reorderable with different layout options

## Development Notes

- Uses Electron Forge with Vite plugin for modern development experience
- Hot reload works for both React frontend and Electron main process
- TypeScript throughout with strict type checking
- Custom hooks pattern for state management
- shadcn/ui component library for consistent UI
- Proper error handling and loading states

## Contributing

1. Follow the TypeScript and React patterns established in the codebase
2. Use `const` for all variable declarations unless reassignment needed
3. Implement proper TypeScript interfaces for all components
4. All database operations should go through the actions layer
5. Use template literals with Neon SQL client for database queries

## License

MIT