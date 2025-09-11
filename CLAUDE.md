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
- **Build System**: Electron Forge 7.8.3 with Vite Plugin handles development, packaging, and distribution
- **Development**: Vite dev server integrated with Electron Forge for fast development cycles

## Technology Stack
- **Desktop Framework**: Electron 37.4.0 with Electron Forge 7.8.3
- **Build Tool**: Vite 7.1.2 integrated via `@electron-forge/plugin-vite`
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
- `npm start` - Start development mode (Electron + Vite dev server with hot reload)
- `npm run package` - Package the app without creating installers
- `npm run make` - Create platform-specific installers (.deb, .dmg, .exe, etc.)
- `npm run publish` - Publish to configured distribution channels

**Custom Commands:**
- `npm run dev:vite` - Start Vite dev server only (for web-only development)
- `npm run build` - Alias for package
- `npm run make-installers` - Full pipeline: package + make installers
- `npm run lint` - Run linting (currently not configured)

**Electron Forge Configuration:**
- Uses `@electron-forge/plugin-vite` for modern development experience
- Configured makers: ZIP, Squirrel (Windows), DMG (macOS), DEB/RPM (Linux)
- Auto-unpack natives and fuses plugins enabled

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
- **Media Storage**: All media files are stored in Contentful, only URLs are stored in the database
- **Database Schema**: The folder structure uses a parent-child relationship where categories are parents (is_parent=true)
- **Related Projects**: Each project can link to up to 2 other related projects for portfolio presentation
- **Development Experience**: Hot reload works for both React components and Electron main process changes
- **Build Pipeline**: Electron Forge handles all packaging, code signing, and installer creation across platforms
- **Vite Integration**: Full Vite features available including fast refresh, optimized builds, and modern ES modules