export type ToolStatus = 'available' | 'coming-soon'

export interface ToolDefinition {
  id: string
  name: string
  description: string
  path: string
  status: ToolStatus
  tags: string[]
}
