import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import type { MemoryNode, MemoryEdge } from '../types'
import { NODE_TYPE_COLORS, NODE_TYPE_LABELS, RELATIONSHIP_LABELS } from '../types'
import { useAuth } from '../hooks/useAuth'

export default function NodeDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const [node, setNode] = useState<MemoryNode | null>(null)
  const [edges, setEdges] = useState<MemoryEdge[]>([])
  const [loading, setLoading] = useState(true)
  const [voteCount, setVoteCount] = useState(0)
  const [userVote, setUserVote] = useState(0)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return

    const load = async () => {
      setLoading(true)
      const { data: n } = await supabase
        .from('nodes')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!n) { setNotFound(true); setLoading(false); return }
      setNode(n)

      const [edgeRes, voteRes] = await Promise.all([
        supabase
          .from('edges')
          .select('*, source_node:nodes!edges_source_id_fkey(*), target_node:nodes!edges_target_id_fkey(*)')
          .or(`source_id.eq.${n.id},target_id.eq.${n.id}`),
        supabase.from('votes').select('vote_value').eq('node_id', n.id),
      ])

      setEdges((edgeRes.data as MemoryEdge[]) ?? [])
      const total = (voteRes.data ?? []).reduce((s: number, v: { vote_value: number }) => s + v.vote_value, 0)
      setVoteCount(total)

      if (user) {
        const { data: uv } = await supabase
          .from('votes')
          .select('vote_value')
          .eq('node_id', n.id)
          .eq('user_id', user.id)
          .single()
        setUserVote(uv?.vote_value ?? 0)
      }

      setLoading(false)
    }

    load()
  }, [slug, user])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center pt-14">
        <div className="w-6 h-6 border border-violet/40 rounded-full animate-spin border-t-violet" />
      </div>
    )
  }

  if (notFound || !node) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center pt-14">
        <div className="text-center">
          <p className="font-display text-3xl text-muted mb-4">Memory not found</p>
          <Link to="/graph" className="btn-primary">← Back to graph</Link>
        </div>
      </div>
    )
  }

  const color = NODE_TYPE_COLORS[node.node_type] ?? '#00d4ff'
  const outgoing = edges.filter((e) => e.source_id === node.id)
  const incoming = edges.filter((e) => e.target_id === node.id)

  return (
    <div className="min-h-screen bg-bg pt-14">
      {/* Color accent bar */}
      <div className="h-px w-full" style={{ background: `linear-gradient(to right, transparent, ${color}, transparent)` }} />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-mono text-xs text-muted">
            <Link to="/graph" className="hover:text-text transition-colors">graph</Link>
            <span>/</span>
            <span className="text-text">{node.title}</span>
          </div>

          {/* Hero */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
              />
              <span
                className="font-mono text-xs uppercase tracking-widest"
                style={{ color }}
              >
                {NODE_TYPE_LABELS[node.node_type]}
              </span>
            </div>
            <h1 className="font-display text-5xl font-light text-text mb-4">{node.title}</h1>
            <p className="font-mono text-sm text-muted leading-relaxed max-w-2xl">{node.description}</p>
          </div>

          {/* Voting */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote(1)}
                disabled={!user}
                className={`px-4 py-2 rounded border font-mono text-sm transition-all ${
                  userVote === 1 ? 'border-mint text-mint bg-mint/10' : 'border-border text-muted hover:border-mint/50 hover:text-mint'
                } disabled:opacity-40`}
              >
                ↑ Resonates
              </button>
              <span className="font-display text-2xl text-text/60 min-w-[2rem] text-center">{voteCount}</span>
              <button
                onClick={() => handleVote(-1)}
                disabled={!user}
                className={`px-4 py-2 rounded border font-mono text-sm transition-all ${
                  userVote === -1 ? 'border-rose text-rose bg-rose/10' : 'border-border text-muted hover:border-rose/50 hover:text-rose'
                } disabled:opacity-40`}
              >
                ↓ Doesn't fit
              </button>
            </div>
            {!user && <span className="font-mono text-xs text-muted italic">Sign in to vote</span>}
          </div>

          {/* Metadata */}
          <div className="flex gap-4 font-mono text-xs text-muted">
            <span>Created {new Date(node.created_at).toLocaleDateString()}</span>
            {node.sensitive_topic && (
              <span className="text-amber">⚠ Sensitive topic</span>
            )}
          </div>

          {/* Connections */}
          {(outgoing.length > 0 || incoming.length > 0) && (
            <div className="space-y-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted border-b border-border pb-3">
                Connections ({edges.length})
              </h2>

              {outgoing.length > 0 && (
                <div>
                  <p className="font-mono text-xs text-muted mb-3">From this node:</p>
                  <div className="space-y-2">
                    {outgoing.map((edge) => {
                      const target = edge.target_node as MemoryNode | undefined
                      if (!target) return null
                      const tc = NODE_TYPE_COLORS[target.node_type] ?? '#00d4ff'
                      return (
                        <Link
                          key={edge.id}
                          to={`/memory/${target.slug}`}
                          className="flex items-center gap-3 p-3 rounded border border-border hover:border-border/80 hover:bg-surface transition-all group"
                        >
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: tc }} />
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-xs text-muted italic">{RELATIONSHIP_LABELS[edge.relationship_type]}</p>
                            <p className="font-display text-lg text-text group-hover:text-cyan transition-colors">{target.title}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="h-0.5 w-16 rounded-full bg-border">
                              <div className="h-full rounded-full" style={{ width: `${edge.strength * 100}%`, backgroundColor: color }} />
                            </div>
                            <span className="font-mono text-xs text-muted">{(edge.strength * 100).toFixed(0)}%</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {incoming.length > 0 && (
                <div>
                  <p className="font-mono text-xs text-muted mb-3">Pointing here:</p>
                  <div className="space-y-2">
                    {incoming.map((edge) => {
                      const source = edge.source_node as MemoryNode | undefined
                      if (!source) return null
                      const sc = NODE_TYPE_COLORS[source.node_type] ?? '#00d4ff'
                      return (
                        <Link
                          key={edge.id}
                          to={`/memory/${source.slug}`}
                          className="flex items-center gap-3 p-3 rounded border border-border hover:border-border/80 hover:bg-surface transition-all group"
                        >
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc }} />
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-xs text-muted italic">{RELATIONSHIP_LABELS[edge.relationship_type]}</p>
                            <p className="font-display text-lg text-text group-hover:text-cyan transition-colors">{source.title}</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Link to="/graph" className="btn-ghost text-xs">← Back to graph</Link>
            <Link to="/workshop" className="btn-primary text-xs">Add connection →</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
