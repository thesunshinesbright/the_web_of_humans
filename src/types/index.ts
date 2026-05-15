export type NodeType =
  | 'fact'
  | 'belief'
  | 'experience'
  | 'heuristic'
  | 'cultural'
  | 'profession'
  | 'emotion'
  | 'sensory'

export type RelationshipType =
  | 'associated_with'
  | 'emotionally_linked_to'
  | 'profession_specific_to'
  | 'commonly_confused_with'
  | 'sensory_association'
  | 'remembered_with'
  | 'caused_by'
  | 'opposite_of'

export interface MemoryNode {
  id: string
  title: string
  slug: string
  description: string
  node_type: NodeType
  created_by: string | null
  created_at: string
  ad_safe: boolean
  sensitive_topic: boolean
  vote_count?: number
  tags?: Tag[]
}

export interface MemoryEdge {
  id: string
  source_id: string
  target_id: string
  relationship_type: RelationshipType
  strength: number
  created_by: string | null
  source_node?: MemoryNode
  target_node?: MemoryNode
}

export interface Vote {
  id: string
  user_id: string
  node_id: string
  vote_value: 1 | -1
}

export interface Tag {
  id: string
  name: string
}

export interface Profile {
  id: string
  username: string
  email: string
  reputation: number
  created_at: string
}

// Graph visualization types
export interface GraphNode {
  id: string
  name: string
  val: number
  color: string
  nodeType: NodeType
  slug: string
  description: string
  x?: number
  y?: number
  fx?: number
  fy?: number
}

export interface GraphLink {
  source: string
  target: string
  relationship: RelationshipType
  strength: number
  id: string
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export const NODE_TYPE_COLORS: Record<NodeType, string> = {
  fact: '#00d4ff',
  belief: '#9d4edd',
  experience: '#ffb347',
  heuristic: '#3effa0',
  cultural: '#ff6b9d',
  profession: '#ffd700',
  emotion: '#ff8fa3',
  sensory: '#7df9ff',
}

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  fact: 'Fact',
  belief: 'Belief',
  experience: 'Experience',
  heuristic: 'Heuristic',
  cultural: 'Cultural',
  profession: 'Profession',
  emotion: 'Emotion',
  sensory: 'Sensory',
}

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  associated_with: 'associated with',
  emotionally_linked_to: 'emotionally linked to',
  profession_specific_to: 'profession-specific to',
  commonly_confused_with: 'commonly confused with',
  sensory_association: 'sensory association',
  remembered_with: 'remembered with',
  caused_by: 'caused by',
  opposite_of: 'opposite of',
}
