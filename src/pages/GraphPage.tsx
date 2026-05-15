import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import GraphCanvas from '../components/GraphCanvas'
import NodeInfoPanel from '../components/NodeInfoPanel'
import SearchBar from '../components/SearchBar'
import { useGraphStore } from '../store/useGraphStore'
import { NODE_TYPE_COLORS, NODE_TYPE_LABELS } from '../types'
import type { NodeType, MemoryNode } from '../types'
import type { GraphNode } from '../types'

const ALL_TYPES = Object.keys(NODE_TYPE_COLORS) as NodeType[]

export default function GraphPage() {
  const { graphData, selectedNode, setSelectedNode, loadGraph, loading } = useGraphStore()
  const [activeTypes, setActiveTypes] = useState<Set<NodeType>>(new Set(ALL_TYPES))

  useEffect(() => {
    loadGraph()
  }, [])

  const toggleType = (type: NodeType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        if (next.size > 1) next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  const handleSearchSelect = (node: MemoryNode) => {
    setSelectedNode({
      id: node.id,
      name: node.title,
      nodeType: node.node_type,
      slug: node.slug,
      description: node.description,
      val: 4,
      color: NODE_TYPE_COLORS[node.node_type],
    } as GraphNode)
  }

  const visibleGraph = {
    nodes: graphData.nodes.filter((n) => activeTypes.has(n.nodeType)),
    links: graphData.links.filter((l) => {
      const srcNode = graphData.nodes.find((n) => n.id === (typeof l.source === 'string' ? l.source : (l.source as { id: string }).id))
      const tgtNode = graphData.nodes.find((n) => n.id === (typeof l.target === 'string' ? l.target : (l.target as { id: string }).id))
      return srcNode && tgtNode && activeTypes.has(srcNode.nodeType) && activeTypes.has(tgtNode.nodeType)
    }),
  }

  return (
    <div className="relative w-screen h-screen bg-bg overflow-hidden">
      {/* Graph */}
      <div className="absolute inset-0">
        <GraphCanvas />
      </div>

      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 pt-20 px-4 pointer-events-none">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="pointer-events-auto"
        >
          <div className="flex items-center gap-3 max-w-sm">
            <SearchBar onSelectNode={handleSearchSelect} />
          </div>
        </motion.div>
      </div>

      {/* Type filters - bottom left */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-6 left-4 flex flex-col gap-1.5"
      >
        {ALL_TYPES.map((type) => {
          const color = NODE_TYPE_COLORS[type]
          const active = activeTypes.has(type)
          const count = graphData.nodes.filter((n) => n.nodeType === type).length
          if (count === 0) return null
          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className="flex items-center gap-2 px-3 py-1.5 rounded transition-all duration-200 font-mono text-xs"
              style={{
                background: active ? color + '15' : 'transparent',
                border: `1px solid ${active ? color + '50' : '#1e1e3a'}`,
                opacity: active ? 1 : 0.4,
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: active ? color : '#4a4a6a', boxShadow: active ? `0 0 5px ${color}` : 'none' }}
              />
              <span style={{ color: active ? color : '#4a4a6a' }}>{NODE_TYPE_LABELS[type]}</span>
              <span className="text-muted ml-1">{count}</span>
            </button>
          )
        })}
      </motion.div>

      {/* Stats - bottom center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6">
        <span className="font-mono text-xs text-muted/60">
          {loading ? 'Loading...' : `${visibleGraph.nodes.length} nodes · ${visibleGraph.links.length} connections`}
        </span>
      </div>

      {/* Node panel */}
      <NodeInfoPanel node={selectedNode} />

      {/* Empty state */}
      {!loading && graphData.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-3 max-w-sm">
            <p className="font-display text-2xl text-text/60">The graph is empty</p>
            <p className="font-mono text-xs text-muted">
              Visit the Workshop to plant the first memory nodes.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
