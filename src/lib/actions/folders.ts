import { 
  createFolder,
  getParentCategories,
  getProjectsByCategory,
  getCategoriesWithProjects,
  getFolderById,
  getFolderBySlug,
  deleteFolder
} from '../../modules/database'
import type { 
  FolderRecord, 
  CategoryWithProjects, 
  CreateFolderParams 
} from '../../modules/database'

export const createProjectFolder = async (
  name: string, 
  parentId: number
): Promise<{ success: boolean; data?: FolderRecord; error?: string }> => {
  try {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    const existingFolder = await getFolderBySlug(slug, parentId)
    if (existingFolder) {
      return {
        success: false,
        error: 'A project with this name already exists in this category'
      }
    }

    const folder = await createFolder({
      name,
      slug,
      parentId,
      isParent: false
    })

    return { success: true, data: folder }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create project'
    }
  }
}

export const getCategories = async (): Promise<FolderRecord[]> => {
  return await getParentCategories()
}

export const getProjectsForCategory = async (categoryId: number): Promise<FolderRecord[]> => {
  return await getProjectsByCategory(categoryId)
}

export const getCategoriesWithProjectsAction = async (): Promise<CategoryWithProjects[]> => {
  return await getCategoriesWithProjects()
}

export const getFolderAction = async (id: number): Promise<FolderRecord | null> => {
  return await getFolderById(id)
}

export const deleteProjectFolder = async (
  id: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    await deleteFolder(id)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete project'
    }
  }
}