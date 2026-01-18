# Lucía Arana Work Management - Electron App

## Overview
Portfolio and work management desktop application built for Lucía Arana. The app manages project portfolios with media files, categorization, and project relationships.

## Project Setup
This project was created using **Electron Forge with the Vite template** (`@electron-forge/plugin-vite`), providing modern web development experience within an Electron desktop application.

## Architecture
- **Main Process**: Electron main process (Node.js environment)
- **Renderer Process**: Vite-powered React frontend with hot reload
- **Database**: PostgreSQL hosted on Neon
- **Media Storage**: Contentful CMS
- **Build System**: Electron Forge 7.11.1 with Vite Plugin handles development, packaging, and distribution
- **Development**: Vite dev server integrated with Electron Forge for fast development cycles
- **Package Manager**: pnpm 10.21.0 with hoisted node-linker for Electron compatibility

## Technology Stack
- **Desktop Framework**: Electron 37.4.0 with Electron Forge 7.11.1
- **Build Tool**: Vite 7.3.1 integrated via `@electron-forge/plugin-vite`
- **Package Manager**: pnpm 10.21.0 (hoisted mode required for Electron Forge)
- **Frontend**: React 18.3.1 + TypeScript 5.8.3
- **Styling**: Tailwind CSS 3.4.13 + shadcn/ui components + Radix UI primitives
- **Database**: PostgreSQL with @neondatabase/serverless
- **Media Storage**: Contentful integration for file storage
- **Icons**: Lucide React 0.454.0
- **Forms**: React Hook Form 7.60.0 + Zod 3.25.67 validation
- **State Management**: React hooks + custom hooks pattern

## Application Features

### Project Management
- **Hierarchical Structure**: Two-level hierarchy (Categories → Projects)
  - Parent categories (fixed, are containers)
  - Child projects (created within categories)
- **Project Operations**: Create, rename, delete projects
- **Hero Images**: Optional hero/cover images per project stored in Contentful
- **Related Projects**: Each project can link to up to 2 other related projects

### Media Management
- **File Upload**: Drag & drop interface for photos and videos
- **Contentful Integration**: All media stored in Contentful CMS
- **Database References**: File metadata and references stored in Neon PostgreSQL
- **Layout Options**: Different display layouts for media galleries
- **Media Ordering**: Drag and drop reordering of media items

### User Interface
- **Collapsible Sidebar**: Category-based navigation with expand/collapse
- **Context Menus**: Right-click menus for project operations
- **Modals & Dialogs**: Create, edit, delete confirmations
- **Search & Filter**: Project selection with category grouping and search
- **Theme Support**: Dark/light theme capabilities

### Database Schema
- **folders table**: Stores both categories (is_parent=true) and projects (is_parent=false)
  - `id`, `name`, `slug`, `parent_id`, `is_parent`
  - `hero_image_url` (Contentful URL)
  - `related_project_1_id`, `related_project_2_id` (foreign keys)
  - `created_at`, `updated_at`
- **media table**: References to Contentful files
  - `id`, `folder_id`, `contentful_asset_id`, `file_url`, `file_type`
  - `original_name`, `file_size`, `display_order`
  - `layout_type`, `created_at`, `updated_at`

## Key Components
- **ProjectSelectWithFilter**: Advanced dropdown with category grouping and search
- **RelatedProjectsSelector**: Interface for managing project relationships
- **HeroImageUpload**: Specialized hero image upload component
- **MediaDropZone**: Drag & drop media upload interface
- **FolderContextMenu**: Right-click context menu for projects

## Development Commands
**Electron Forge Commands:**
- `pnpm start` - Start development mode (Electron + Vite dev server with hot reload)
- `pnpm run package` - Package the app without creating installers
- `pnpm run make` - Create platform-specific installers (.deb, .dmg, .exe, etc.)
- `pnpm run publish` - Publish to configured distribution channels

**Custom Commands:**
- `pnpm run dev:vite` - Start Vite dev server only (for web-only development)
- `pnpm run build` - Alias for package
- `pnpm run make-installers` - Full pipeline: package + make installers
- `pnpm run lint` - Run linting (currently not configured)

**Electron Forge Configuration:**
- Uses `@electron-forge/plugin-vite` for modern development experience
- Configured makers: ZIP, Squirrel (Windows), DMG (macOS), DEB/RPM (Linux)
- Auto-unpack natives and fuses plugins enabled

**pnpm Configuration:**
- `.npmrc` configured with `node-linker=hoisted` for Electron Forge compatibility
- Hoisted mode required for proper native module compilation (fs-xattr, etc.)
- Standard pnpm symlinked structure does not work with Electron's packaging process

## Coding Conventions

### TypeScript/JavaScript Standards
- **Use `const`** for all variable declarations that don't need reassignment
- **Use proper TypeScript types** throughout the codebase
- **Avoid `let`** unless variable reassignment is necessary
- **Never use `var`** - it's deprecated and has scope issues

### React Patterns
- **Function Components**: Always use function components with hooks
- **Custom Hooks**: Extract reusable logic into custom hooks (e.g., useFolders)
- **Interface Definitions**: Define proper TypeScript interfaces for all props
- **Error Handling**: Wrap async operations in try-catch blocks

### Database Operations
- **Action Layer**: All database operations go through `/lib/actions/`
- **Type Safety**: Use proper TypeScript types for database records
- **SQL Templates**: Use template literals with the Neon SQL client
- **Transaction Safety**: Handle database errors gracefully

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

## Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui base components
│   ├── media-drop-zone.tsx
│   ├── hero-image-upload.tsx
│   ├── related-projects-selector.tsx
│   ├── project-select-with-filter.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── use-folders.ts  # Project management hook
│   └── use-media.ts    # Media management hook
├── lib/
│   ├── actions/        # Database operations
│   │   ├── folders.ts  # Project CRUD operations
│   │   ├── media.ts    # Media CRUD operations
│   │   └── upload.ts   # Contentful upload operations
│   └── utils/          # Utility functions
├── modules/
│   └── database/       # Database layer
│       ├── connection.ts
│       ├── folders.ts  # Project database queries
│       ├── media.ts    # Media database queries
│       └── types.ts    # Database type definitions
├── services/           # External service integrations
│   └── contentful.ts   # Contentful API client
├── App.tsx            # Main application component
└── electron-main.js   # Electron main process

scripts/               # Database migrations and setup
├── neon-media-table.sql
├── add-hero-field-migration.sql
└── add-related-projects-migration.sql
```

## Important Notes
- **Electron Forge + Vite**: This setup provides modern web development experience with hot reload, TypeScript support, and fast builds within an Electron app
- **pnpm with hoisted mode**: REQUIRED for Electron Forge compatibility - see `.npmrc` configuration
- **Media Storage**: All media files are stored in Contentful, only URLs are stored in the database
- **Database Schema**: The folder structure uses a parent-child relationship where categories are parents (is_parent=true)
- **Related Projects**: Each project can link to up to 2 other related projects for portfolio presentation
- **Development Experience**: Hot reload works for both React components and Electron main process changes
- **Build Pipeline**: Electron Forge handles all packaging, code signing, and installer creation across platforms
- **Vite Integration**: Full Vite features available including fast refresh, optimized builds, and modern ES modules

## Troubleshooting Build Issues

### Native Module Compilation Errors

**Problem**: `Cannot find module './build/Release/xattr'` or similar native module errors during `pnpm run make`

**Root Cause**: Native modules (like `fs-xattr` used by the DMG maker) require compilation with `node-gyp`. When using pnpm, these must be compiled in hoisted mode.

**Solution**:
1. Verify `.npmrc` contains `node-linker=hoisted`
2. Clean reinstall:
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```
3. If issues persist, rebuild native modules:
   ```bash
   pnpm rebuild
   ```

### Architecture Mismatch Errors

**Problem**: Build fails with architecture errors (x86_64 vs arm64)

**Solution**: Ensure you're building for the correct target architecture:
```bash
pnpm exec electron-forge make --platform=darwin --arch=arm64    # Apple Silicon
pnpm exec electron-forge make --platform=darwin --arch=x64     # Intel
```

### Common Build Artifacts

After successful build, artifacts are located in:
- **DMG installer**: `out/make/Lucia Arana Work Management.dmg`
- **ZIP archive**: `out/make/zip/darwin/arm64/Lucia Arana Work Management-darwin-arm64-1.0.0.zip`
- **Packaged app**: `out/Lucia Arana Work Management-darwin-arm64/`

### Why pnpm Requires Hoisted Mode

Electron Forge's packaging algorithm:
1. Scans `node_modules` to collect dependencies
2. Bundles them into the final application
3. Cannot follow symlinks (pnpm's default structure)

The `node-linker=hoisted` setting creates a flat `node_modules` structure (like npm/yarn) that Electron Forge can properly traverse and bundle.