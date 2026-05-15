import { create } from 'zustand'
import type { GraphData, GraphNode, GraphLink, MemoryNode, MemoryEdge } from '../types'
import { NODE_TYPE_COLORS } from '../types'
import { supabase } from '../lib/supabase'

interface GraphStore {
  graphData: GraphData
  selectedNode: GraphNode | null
  loading: boolean
  searchQuery: string
  setSelectedNode: (node: GraphNode | null) => void
  setSearchQuery: (q: string) => void
  loadGraph: () => Promise<void>
  expandNode: (nodeId: string) => Promise<void>
}

function toGraphNode(n: MemoryNode): GraphNode {
  return {
    id: n.id,
    name: n.title,
    val: 4,
    color: NODE_TYPE_COLORS[n.node_type] ?? '#00d4ff',
    nodeType: n.node_type,
    slug: n.slug,
    description: n.description,
  }
}

function toGraphLink(e: MemoryEdge): GraphLink {
  return {
    id: e.id,
    source: e.source_id,
    target: e.target_id,
    relationship: e.relationship_type,
    strength: e.strength,
  }
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  graphData: { nodes: [], links: [] },
  selectedNode: null,
  loading: false,
  searchQuery: '',

  setSelectedNode: (node) => set({ selectedNode: node }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  loadGraph: async () => {
    set({ loading: true })
    try {
      const { data: nodes } = await supabase
        .from('nodes')
        .select('*')
        .limit(300)
        .order('created_at', { ascending: false })

      const { data: edges } = await supabase
        .from('edges')
        .select('*')
        .limit(600)

      if (!nodes || !edges) return

      const graphNodes = nodes.map(toGraphNode)
      const nodeIds = new Set(graphNodes.map((n) => n.id))
      const graphLinks = edges
        .filter((e) => nodeIds.has(e.source_id) && nodeIds.has(e.target_id))
        .map(toGraphLink)

      set({ graphData: { nodes: graphNodes, links: graphLinks } })
    } finally {
      set({ loading: false })
    }
  },

  expandNode: async (nodeId: string) => {
    const { data: edges } = await supabase
      .from('edges')
      .select('*, source_node:nodes!edges_source_id_fkey(*), target_node:nodes!edges_target_id_fkey(*)')
      .or(`source_id.eq.${nodeId},target_id.eq.${nodeId}`)

    if (!edges) return

    const { graphData } = get()
    const existingIds = new Set(graphData.nodes.map((n) => n.id))
    const existingLinkIds = new Set(graphData.links.map((l) => l.id))

    const newNodes: GraphNode[] = []
    const newLinks: GraphLink[] = []

    for (const edge of edges) {
      if (edge.source_node && !existingIds.has(edge.source_node.id)) {
        newNodes.push(toGraphNode(edge.source_node))
        existingIds.add(edge.source_node.id)
      }
      if (edge.target_node && !existingIds.has(edge.target_node.id)) {
        newNodes.push(toGraphNode(edge.target_node))
        existingIds.add(edge.target_node.id)
      }
      if (!existingLinkIds.has(edge.id)) {
        newLinks.push(toGraphLink(edge))
        existingLinkIds.add(edge.id)
      }
    }

    set({
      graphData: {
        nodes: [...graphData.nodes, ...newNodes],
        links: [...graphData.links, ...newLinks],
      },
    })
  },
}))
