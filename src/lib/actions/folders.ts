import { 
  createFolder,
  getParentCategories,
  getProjectsByCategory,
  getCategoriesWithProjects,
  getFolderById,
  getFolderBySlug,
  updateFolder,
  updateFolderHero,
  deleteFolder
} from '../../modules/database'
import type { 
  FolderRecord, 
  CategoryWithProjects, 
  CreateFolderParams,
  UpdateFolderParams 
} from '../../modules/database'

export const createProjectFolder = async (
  name: string, 
  parentId: number,
  heroImageUrl?: string | null
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
      isParent: false,
      heroImageUrl
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

export const updateProjectFolder = async (
  id: number,
  name: string
): Promise<{ success: boolean; data?: FolderRecord; error?: string }> => {
  try {
    const folder = await updateFolder(id, name)
    if (folder) {
      return { success: true, data: folder }
    } else {
      return { success: false, error: 'Project not found' }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update project'
    }
  }
}

export const updateProjectFolderWithHero = async (
  params: UpdateFolderParams
): Promise<{ success: boolean; data?: FolderRecord; error?: string }> => {
  try {
    const folder = await updateFolderHero(params)
    if (folder) {
      return { success: true, data: folder }
    } else {
      return { success: false, error: 'Project not found' }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update project'
    }
  }
}

export const updateProjectHeroImage = async (
  id: number,
  heroImageUrl: string | null
): Promise<{ success: boolean; data?: FolderRecord; error?: string }> => {
  try {
    const folder = await updateFolderHero({ id, heroImageUrl })
    if (folder) {
      return { success: true, data: folder }
    } else {
      return { success: false, error: 'Project not found' }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update project hero image'
    }
  }
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