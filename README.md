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

- **Desktop**: Electron 37.4.0 with Electron Forge 7.8.3
- **Build Tool**: Vite 7.1.2 via `@electron-forge/plugin-vite`
- **Frontend**: React 18.3.1 + TypeScript 5.8.3
- **UI Library**: shadcn/ui + Radix UI primitives + Tailwind CSS 3.4.13
- **Database**: PostgreSQL hosted on Neon with `@neondatabase/serverless`
- **Media Storage**: Contentful CMS integration
- **Forms**: React Hook Form 7.60.0 + Zod 3.25.67 validation
- **Icons**: Lucide React 0.454.0

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (Neon)
- Contentful account for media storage

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables for database and Contentful connections

### Development

#### Start Development Mode (Recommended)
```bash
npm start
```
Launches Electron app with Vite dev server and hot reload for both React components and Electron main process.

#### Vite Only Development
```bash
npm run dev:vite
```
Starts only the Vite dev server for web-only development and testing.

## Building and Distribution

### Package Application
```bash
npm run package
```
Creates a packaged application for your current platform in the `out/` directory.

### Create Installers
```bash
npm run make
```
Creates platform-specific installers:
- **macOS**: .dmg files
- **Windows**: .exe installers via Squirrel
- **Linux**: .deb and .rpm packages

### Cross-Platform Builds
```bash
npx electron-forge make --platform=darwin --arch=arm64    # macOS Apple Silicon
npx electron-forge make --platform=darwin --arch=x64     # macOS Intel
npx electron-forge make --platform=linux --arch=x64      # Linux
npx electron-forge make --platform=win32 --arch=x64      # Windows
```

### Complete Build Pipeline
```bash
npm run make-installers
```
Runs the complete pipeline: package + create installers.

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