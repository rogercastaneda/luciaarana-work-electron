import { useState, useEffect, useCallback } from 'react'
import { 
  getCategories,
  getProjectsForCategory,
  getCategoriesWithProjectsAction,
  createProjectFolder,
  updateProjectFolder,
  deleteProjectFolder
} from '../lib/actions'
import type { FolderRecord, CategoryWithProjects } from '../modules/database'

type UseFoldersState = {
  categories: FolderRecord[]
  categoriesWithProjects: CategoryWithProjects[]
  loading: boolean
  error: string | null
}

export const useFolders = () => {
  const [state, setState] = useState<UseFoldersState>({
    categories: [],
    categoriesWithProjects: [],
    loading: true,
    error: null
  })

  const loadCategories = useCallback(async () => {
    try {
      const categories = await getCategories()
      setState(prev => ({ ...prev, categories, error: null }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load categories'
      }))
    }
  }, [])

  const loadCategoriesWithProjects = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))
    
    try {
      const categoriesWithProjects = await getCategoriesWithProjectsAction()
      setState(prev => ({
        ...prev,
        categoriesWithProjects,
        loading: false,
        error: null
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load categories with projects'
      }))
    }
  }, [])

  const createProject = useCallback(async (name: string, parentId: number) => {
    try {
      const result = await createProjectFolder(name, parentId)
      
      if (result.success) {
        await loadCategoriesWithProjects()
      } else {
        setState(prev => ({ ...prev, error: result.error || 'Failed to create project' }))
      }
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project'
      setState(prev => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [loadCategoriesWithProjects])

  const updateProject = useCallback(async (id: number, name: string) => {
    try {
      const result = await updateProjectFolder(id, name)
      
      if (result.success) {
        await loadCategoriesWithProjects()
      } else {
        setState(prev => ({ ...prev, error: result.error || 'Failed to update project' }))
      }
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project'
      setState(prev => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [loadCategoriesWithProjects])

  const deleteProject = useCallback(async (id: number) => {
    try {
      const result = await deleteProjectFolder(id)
      
      if (result.success) {
        await loadCategoriesWithProjects()
      } else {
        setState(prev => ({ ...prev, error: result.error || 'Failed to delete project' }))
      }
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project'
      setState(prev => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [loadCategoriesWithProjects])

  const refresh = useCallback(async () => {
    await Promise.all([
      loadCategories(),
      loadCategoriesWithProjects()
    ])
  }, [loadCategories, loadCategoriesWithProjects])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    ...state,
    createProject,
    updateProject,
    deleteProject,
    refresh
  }
}