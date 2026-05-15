import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import SearchBar from '../components/SearchBar'
import type { NodeType, RelationshipType, MemoryNode } from '../types'
import { NODE_TYPE_COLORS, NODE_TYPE_LABELS, RELATIONSHIP_LABELS } from '../types'
import AuthModal from '../components/AuthModal'

type Tab = 'node' | 'edge'

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function WorkshopPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('node')
  const [showAuth, setShowAuth] = useState(false)

  // Node form
  const [nodeTitle, setNodeTitle] = useState('')
  const [nodeType, setNodeType] = useState<NodeType>('fact')
  const [nodeDesc, setNodeDesc] = useState('')
  const [nodeSensitive, setNodeSensitive] = useState(false)
  const [nodeLoading, setNodeLoading] = useState(false)
  const [nodeError, setNodeError] = useState('')
  const [nodeSuccess, setNodeSuccess] = useState('')

  // Edge form
  const [sourceNode, setSourceNode] = useState<MemoryNode | null>(null)
  const [targetNode, setTargetNode] = useState<MemoryNode | null>(null)
  const [relType, setRelType] = useState<RelationshipType>('associated_with')
  const [strength, setStrength] = useState(0.7)
  const [edgeLoading, setEdgeLoading] = useState(false)
  const [edgeError, setEdgeError] = useState('')
  const [edgeSuccess, setEdgeSuccess] = useState('')

  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { setShowAuth(true); return }
    setNodeError(''); setNodeSuccess(''); setNodeLoading(true)

    const slug = slugify(nodeTitle)
    const { error } = await supabase.from('nodes').insert({
      title: nodeTitle.trim(),
      slug,
      description: nodeDesc.trim(),
      node_type: nodeType,
      created_by: user.id,
      ad_safe: !nodeSensitive,
      sensitive_topic: nodeSensitive,
    })

    setNodeLoading(false)
    if (error) {
      setNodeError(error.message.includes('duplicate') ? 'A node with this title already exists.' : error.message)
    } else {
      setNodeSuccess(`"${nodeTitle}" added to the graph.`)
      setNodeTitle(''); setNodeDesc(''); setNodeSensitive(false)
    }
  }

  const handleCreateEdge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { setShowAuth(true); return }
    if (!sourceNode || !targetNode) { setEdgeError('Select both nodes.'); return }
    if (sourceNode.id === targetNode.id) { setEdgeError('Cannot connect a node to itself.'); return }
    setEdgeError(''); setEdgeSuccess(''); setEdgeLoading(true)

    const { error } = await supabase.from('edges').insert({
      source_id: sourceNode.id,
      target_id: targetNode.id,
      relationship_type: relType,
      strength,
      created_by: user.id,
    })

    setEdgeLoading(false)
    if (error) {
      setEdgeError(error.message)
    } else {
      setEdgeSuccess(`Connection created: ${sourceNode.title} → ${targetNode.title}`)
      setSourceNode(null); setTargetNode(null)
    }
  }

  return (
    <div className="min-h-screen bg-bg pt-14">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <p className="font-mono text-xs text-violet uppercase tracking-[0.3em] mb-3">Memory Workshop</p>
            <h1 className="font-display text-4xl font-light text-text mb-3">Forge new memories</h1>
            <p className="font-mono text-xs text-muted leading-relaxed">
              Contribute to the collective graph. Every node and connection you add
              becomes part of humanity's shared cognitive map.
            </p>
          </div>

          {/* Auth notice */}
          {!user && (
            <div className="flex items-center justify-between p-4 rounded border border-violet/30 bg-violet/5">
              <p className="font-mono text-xs text-muted">You must be signed in to contribute.</p>
              <button onClick={() => setShowAuth(true)} className="btn-primary text-xs py-1.5 px-4">
                Sign in
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-border">
            {(['node', 'edge'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3 font-mono text-xs uppercase tracking-widest transition-all border-b-2 -mb-px ${
                  tab === t
                    ? 'border-cyan text-cyan'
                    : 'border-transparent text-muted hover:text-text'
                }`}
              >
                {t === 'node' ? 'New Node' : 'New Connection'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'node' ? (
              <motion.form
                key="node"
                onSubmit={handleCreateNode}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5"
              >
                <div>
                  <label className="label">Title *</label>
                  <input
                    value={nodeTitle}
                    onChange={(e) => setNodeTitle(e.target.value)}
                    className="input-field"
                    placeholder="e.g. The smell of petrichor"
                    required
                    maxLength={80}
                  />
                  <p className="font-mono text-xs text-muted mt-1">{nodeTitle.length}/80</p>
                </div>

                <div>
                  <label className="label">Node Type *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(NODE_TYPE_COLORS) as NodeType[]).map((t) => {
                      const c = NODE_TYPE_COLORS[t]
                      const active = nodeType === t
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNodeType(t)}
                          className="py-2 px-3 rounded border font-mono text-xs transition-all"
                          style={{
                            borderColor: active ? c + '80' : '#1e1e3a',
                            color: active ? c : '#4a4a6a',
                            background: active ? c + '12' : 'transparent',
                          }}
                        >
                          {NODE_TYPE_LABELS[t]}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="label">Description *</label>
                  <textarea
                    value={nodeDesc}
                    onChange={(e) => setNodeDesc(e.target.value)}
                    className="input-field resize-none"
                    rows={4}
                    placeholder="What do humans typically associate or remember about this? Why is it memorable?"
                    required
                    maxLength={500}
                  />
                  <p className="font-mono text-xs text-muted mt-1">{nodeDesc.length}/500</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setNodeSensitive(!nodeSensitive)}
                    className={`w-10 h-5 rounded-full transition-all relative ${nodeSensitive ? 'bg-amber/40' : 'bg-border'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${nodeSensitive ? 'left-5.5 bg-amber' : 'left-0.5 bg-muted'}`} />
                  </button>
                  <label className="font-mono text-xs text-muted cursor-pointer" onClick={() => setNodeSensitive(!nodeSensitive)}>
                    Sensitive topic (trauma, addiction, grief, etc.)
                  </label>
                </div>

                {nodeError && <p className="font-mono text-xs text-rose">{nodeError}</p>}
                {nodeSuccess && (
                  <div className="flex items-center justify-between p-3 rounded border border-mint/30 bg-mint/5">
                    <p className="font-mono text-xs text-mint">{nodeSuccess}</p>
                    <Link to="/graph" className="font-mono text-xs text-cyan hover:underline">View graph →</Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={nodeLoading || !nodeTitle.trim() || !nodeDesc.trim()}
                  className="btn-primary w-full justify-center py-3 disabled:opacity-40"
                >
                  {nodeLoading ? 'Adding to graph...' : 'Add Memory Node →'}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="edge"
                onSubmit={handleCreateEdge}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <p className="font-mono text-xs text-muted">
                  Connect two existing nodes with a typed relationship.
                </p>

                <div>
                  <label className="label">Source node (from)</label>
                  {sourceNode ? (
                    <div className="flex items-center gap-3 p-3 rounded border border-border bg-surface">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: NODE_TYPE_COLORS[sourceNode.node_type] }} />
                      <span className="font-mono text-sm text-text">{sourceNode.title}</span>
                      <button type="button" onClick={() => setSourceNode(null)} className="ml-auto text-muted hover:text-text">✕</button>
                    </div>
                  ) : (
                    <SearchBar onSelectNode={setSourceNode} />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="font-mono text-xs text-muted">connects to</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div>
                  <label className="label">Target node (to)</label>
                  {targetNode ? (
                    <div className="flex items-center gap-3 p-3 rounded border border-border bg-surface">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: NODE_TYPE_COLORS[targetNode.node_type] }} />
                      <span className="font-mono text-sm text-text">{targetNode.title}</span>
                      <button type="button" onClick={() => setTargetNode(null)} className="ml-auto text-muted hover:text-text">✕</button>
                    </div>
                  ) : (
                    <SearchBar onSelectNode={setTargetNode} />
                  )}
                </div>

                <div>
                  <label className="label">Relationship type *</label>
                  <select
                    value={relType}
                    onChange={(e) => setRelType(e.target.value as RelationshipType)}
                    className="input-field"
                  >
                    {(Object.keys(RELATIONSHIP_LABELS) as RelationshipType[]).map((r) => (
                      <option key={r} value={r}>{RELATIONSHIP_LABELS[r]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Strength: {(strength * 100).toFixed(0)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={strength}
                    onChange={(e) => setStrength(parseFloat(e.target.value))}
                    className="w-full accent-violet h-1"
                  />
                  <div className="flex justify-between font-mono text-xs text-muted mt-1">
                    <span>Weak association</span>
                    <span>Strong association</span>
                  </div>
                </div>

                {edgeError && <p className="font-mono text-xs text-rose">{edgeError}</p>}
                {edgeSuccess && (
                  <div className="flex items-center justify-between p-3 rounded border border-mint/30 bg-mint/5">
                    <p className="font-mono text-xs text-mint">{edgeSuccess}</p>
                    <Link to="/graph" className="font-mono text-xs text-cyan hover:underline">View graph →</Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={edgeLoading || !sourceNode || !targetNode}
                  className="btn-primary w-full justify-center py-3 disabled:opacity-40"
                >
                  {edgeLoading ? 'Creating connection...' : 'Forge Connection →'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
