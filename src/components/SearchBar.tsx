import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { MemoryNode } from '../types'
import { NODE_TYPE_COLORS } from '../types'
import { useNavigate } from 'react-router-dom'

interface Props {
  onSelectNode?: (node: MemoryNode) => void
}

export default function SearchBar({ onSelectNode }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MemoryNode[]>([])
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('nodes')
        .select('*')
        .ilike('title', `%${query}%`)
        .limit(8)

      setResults(data ?? [])
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (node: MemoryNode) => {
    setQuery('')
    setResults([])
    if (onSelectNode) {
      onSelectNode(node)
    } else {
      navigate(`/memory/${node.slug}`)
    }
  }

  return (
    <div className="relative w-full">
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded border font-mono text-sm transition-all duration-200 ${
        focused
          ? 'border-violet/60 bg-surface shadow-[0_0_20px_rgba(157,78,221,0.15)]'
          : 'border-border bg-surface/60'
      }`}>
        <svg className="w-3.5 h-3.5 text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search memories..."
          className="bg-transparent outline-none text-text placeholder-muted flex-1 text-sm"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]) }}
            className="text-muted hover:text-text transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {results.length > 0 && focused && (
        <div className="absolute top-full left-0 right-0 mt-1 glass rounded border border-border overflow-hidden z-50">
          {results.map((node) => (
            <button
              key={node.id}
              onClick={() => handleSelect(node)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-2 transition-colors text-left"
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: NODE_TYPE_COLORS[node.node_type], boxShadow: `0 0 6px ${NODE_TYPE_COLORS[node.node_type]}` }}
              />
              <span className="font-mono text-sm text-text truncate">{node.title}</span>
              <span className="ml-auto font-mono text-xs text-muted capitalize flex-shrink-0">{node.node_type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
