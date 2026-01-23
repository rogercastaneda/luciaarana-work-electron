import {
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
  toggleFolderActiveStatus,
  deleteFolder
} from '../../modules/database'
import type {
  FolderRecord,
  CategoryWithProjects,
  CreateFolderParams,
  UpdateFolderParams,
  FolderWithRelatedProjects,
  ProjectWithFirstImage
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

export const getFolderWithRelatedProjectsAction = async (
  id: number
): Promise<{ success: boolean; data?: FolderWithRelatedProjects; error?: string }> => {
  try {
    const folder = await getFolderWithRelatedProjects(id)
    if (folder) {
      return { success: true, data: folder }
    } else {
      return { success: false, error: 'Project not found' }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get project with related projects'
    }
  }
}

export const getAllProjectsForSelectionAction = async (): Promise<{ success: boolean; data?: FolderRecord[]; error?: string }> => {
  try {
    const projects = await getAllProjectsForSelection()
    return { success: true, data: projects }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get projects for selection'
    }
  }
}

export const getProjectsGroupedByCategoryAction = async () => {
  try {
    const groupedProjects = await getProjectsGroupedByCategory()
    return { success: true, data: groupedProjects }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get grouped projects'
    }
  }
}

export const updateProjectRelatedProjects = async (
  projectId: number,
  relatedProject1Id: number | null,
  relatedProject2Id: number | null
): Promise<{ success: boolean; data?: FolderRecord; error?: string }> => {
  try {
    const result = await updateFolderHero({
      id: projectId,
      relatedProject1Id,
      relatedProject2Id
    })
    if (result) {
      return { success: true, data: result }
    } else {
      return { success: false, error: 'Project not found' }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update related projects'
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

export const getProjectsWithFirstImageAction = async (
  categoryId: number
): Promise<{ success: boolean; data?: ProjectWithFirstImage[]; error?: string }> => {
  try {
    const projects = await getProjectsWithFirstImage(categoryId)
    return { success: true, data: projects }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get projects with first image'
    }
  }
}

export const updateProjectOrderingAction = async (
  projectId: number,
  newOrdering: number
): Promise<{ success: boolean; data?: FolderRecord; error?: string }> => {
  try {
    const project = await updateProjectOrdering(projectId, newOrdering)
    if (project) {
      return { success: true, data: project }
    } else {
      return { success: false, error: 'Project not found' }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update project ordering'
    }
  }
}

export const toggleProjectActiveStatusAction = async (
  projectId: number,
  isActive: boolean
): Promise<{ success: boolean; data?: FolderRecord; error?: string }> => {
  try {
    const project = await toggleFolderActiveStatus(projectId, isActive)
    if (project) {
      return { success: true, data: project }
    } else {
      return { success: false, error: 'Project not found' }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle project active status'
    }
  }
}