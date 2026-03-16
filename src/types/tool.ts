export type ToolStatus = 'available' | 'coming-soon'
export type ToolCategory = 'workflow' | 'time' | 'data'

export interface ToolDefinition {
  id: string
  name: string
  description: string
  headline: string
  path: string
  status: ToolStatus
  category: ToolCategory
  featured?: boolean
  shortcutHint: string
  tags: string[]
}
