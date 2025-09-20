export const BASE_FOLDERS = [
  'Fotografías',
  'Diseño editorial',
  'Diseño gráfico',
  'Branding & identidad',
  'Ilustración',
  'Dirección de arte'
] as const

export type BaseFolderName = typeof BASE_FOLDERS[number]