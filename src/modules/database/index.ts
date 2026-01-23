export { sql, testConnection } from './connection'

export { 
  createMediaRecord, 
  getMediaByFolder, 
  updateMediaOrder, 
  updateMediaLayout,
  deleteMediaRecord,
  getMediaWithFolder
} from './media'

export {
  createFolder,
  getParentCategories,
  getProjectsByCategory,
  getCategoriesWithProjects,
  getFolderById,
  getFolderBySlug,
  getFolderWithRelatedProjects,
  getAllProjectsForSelection,
  getProjectsGroupedByCategory,
  getProjectsWithFirstImage,
  updateFolder,
  updateFolderHero,
  updateProjectOrdering,
  deleteFolder,
  toggleFolderActiveStatus
} from './folders'

export type {
  FolderRecord,
  MediaRecord,
  FolderWithChildren,
  CategoryWithProjects,
  CreateFolderParams,
  CreateMediaParams,
  UpdateMediaOrderParams,
  UpdateFolderParams,
  UpdateRelatedProjectsParams,
  FolderWithRelatedProjects,
  ProjectWithFirstImage
} from './types'