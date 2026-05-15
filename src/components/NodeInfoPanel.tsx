import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { GraphNode, MemoryEdge } from '../types'
import { NODE_TYPE_COLORS, NODE_TYPE_LABELS, RELATIONSHIP_LABELS } from '../types'
import { supabase } from '../lib/supabase'
import { useGraphStore } from '../store/useGraphStore'
import { useAuth } from '../hooks/useAuth'

interface Props {
  node: GraphNode | null
}

export default function NodeInfoPanel({ node }: Props) {
  const { expandNode, setSelectedNode } = useGraphStore()
  const { user } = useAuth()
  const [edges, setEdges] = useState<MemoryEdge[]>([])
  const [voteCount, setVoteCount] = useState(0)
  const [userVote, setUserVote] = useState<number>(0)
  const [expanding, setExpanding] = useState(false)

  useEffect(() => {
    if (!node) return
    setEdges([])
    setVoteCount(0)
    setUserVote(0)

    supabase
      .from('edges')
      .select('*, source_node:nodes!edges_source_id_fkey(id,title,slug,node_type), target_node:nodes!edges_target_id_fkey(id,title,slug,node_type)')
      .or(`source_id.eq.${node.id},target_id.eq.${node.id}`)
      .limit(10)
      .then(({ data }) => setEdges((data as MemoryEdge[]) ?? []))

    supabase
      .from('votes')
      .select('vote_value', { count: 'exact' })
      .eq('node_id', node.id)
      .then(({ data }) => {
        const total = (data ?? []).reduce((s: number, v: { vote_value: number }) => s + v.vote_value, 0)
        setVoteCount(total)
      })

    if (user) {
      supabase
        .from('votes')
        .select('vote_value')
        .eq('node_id', node.id)
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => setUserVote(data?.vote_value ?? 0))
    }
  }, [node, user])

  const handleVote = async (value: 1 | -1) => {
    if (!user || !node) return
    const newVal = userVote === value ? 0 : value

    if (newVal === 0) {
      await supabase.from('votes').delete().eq('node_id', node.id).eq('user_id', user.id)
    } else {
      await supabase.from('votes').upsert({ user_id: user.id, node_id: node.id, vote_value: newVal })
    }
    setVoteCount((c) => c - userVote + newVal)
    setUserVote(newVal)
  }

  const handleExpand = async () => {
    if (!node) return
    setExpanding(true)
    await expandNode(node.id)
    setExpanding(false)
  }

  const color = node ? (NODE_TYPE_COLORS[node.nodeType] ?? '#00d4ff') : '#00d4ff'

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          key={node.id}
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-4 top-4 bottom-4 w-72 glass rounded-lg overflow-hidden flex flex-col"
        >
          {/* Color accent bar */}
          <div className="h-0.5 w-full" style={{ background: `linear-gradient(to right, transparent, ${color}, transparent)` }} />

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                  <span className="font-mono text-xs uppercase tracking-widest" style={{ color }}>
                    {NODE_TYPE_LABELS[node.nodeType]}
                  </span>
                </div>
                <h3 className="font-display text-xl text-text leading-tight">{node.name}</h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-muted hover:text-text transition-colors flex-shrink-0 mt-0.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Description */}
            <p className="font-mono text-xs text-muted leading-relaxed">{node.description}</p>

            {/* Voting */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleVote(1)}
                disabled={!user}
                className={`flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded border transition-all ${
                  userVote === 1
                    ? 'border-mint text-mint bg-mint/10'
                    : 'border-border text-muted hover:border-mint/50 hover:text-mint'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                ↑ <span>{voteCount > 0 ? voteCount : ''}</span>
              </button>
              <button
                onClick={() => handleVote(-1)}
                disabled={!user}
                className={`flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded border transition-all ${
                  userVote === -1
                    ? 'border-rose text-rose bg-rose/10'
                    : 'border-border text-muted hover:border-rose/50 hover:text-rose'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                ↓
              </button>
              {!user && <span className="font-mono text-xs text-muted italic">sign in to vote</span>}
            </div>

            {/* Connections */}
            {edges.length > 0 && (
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">Connections</p>
                <div className="space-y-1.5">
                  {edges.slice(0, 6).map((edge) => {
                    const isSource = edge.source_id === node.id
                    const related = isSource ? edge.target_node : edge.source_node
                    if (!related) return null
                    const relColor = NODE_TYPE_COLORS[(related as { node_type: string }).node_type as keyof typeof NODE_TYPE_COLORS] ?? '#00d4ff'
                    return (
                      <div key={edge.id} className="flex items-start gap-2 text-xs">
                        <span className="text-muted mt-0.5 flex-shrink-0">{isSource ? '→' : '←'}</span>
                        <div>
                          <span className="font-mono text-xs text-muted italic">
                            {RELATIONSHIP_LABELS[edge.relationship_type]}
                          </span>
                          <br />
                          <button
                            onClick={() => {
                              const related2 = isSource ? edge.target_node : edge.source_node
                              if (related2) {
                                setSelectedNode({
                                  id: (related2 as { id: string }).id,
                                  name: (related2 as { title: string }).title,
                                  nodeType: (related2 as { node_type: string }).node_type as GraphNode['nodeType'],
                                  slug: (related2 as { slug: string }).slug,
                                  description: '',
                                  val: 4,
                                  color: relColor,
                                })
                              }
                            }}
                            className="font-mono text-xs text-text hover:text-cyan transition-colors"
                          >
                            {(related as { title: string }).title}
                          </button>
                        </div>
                        <span className="ml-auto font-mono text-xs text-muted/50 flex-shrink-0">
                          {(edge.strength * 100).toFixed(0)}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="p-4 border-t border-border/50 flex gap-2">
            <button
              onClick={handleExpand}
              disabled={expanding}
              className="btn-ghost text-xs py-1.5 flex-1 disabled:opacity-50"
            >
              {expanding ? '...' : 'Expand'}
            </button>
            <Link
              to={`/memory/${node.slug}`}
              className="btn-primary text-xs py-1.5 flex-1 text-center"
            >
              Full page →
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
