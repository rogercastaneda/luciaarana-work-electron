import { neon } from '@neondatabase/serverless'

const getDatabaseUrl = () => {
  const url = import.meta.env.VITE_DATABASE_URL
  if (!url) {
    throw new Error('VITE_DATABASE_URL environment variable is required')
  }
  return url
}

export const sql = neon(getDatabaseUrl())

export const testConnection = async () => {
  try {
    const result = await sql`SELECT 1 as test`
    return result[0]?.test === 1
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}