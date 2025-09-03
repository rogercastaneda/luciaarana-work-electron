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
  deleteFolder
} from './folders'

export type {
  FolderRecord,
  MediaRecord,
  FolderWithChildren,
  CategoryWithProjects,
  CreateFolderParams,
  CreateMediaParams,
  UpdateMediaOrderParams
} from './types'