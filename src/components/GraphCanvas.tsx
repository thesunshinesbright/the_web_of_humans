import { useRef, useCallback, useEffect, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import type { GraphNode, GraphLink } from '../types'
import { useGraphStore } from '../store/useGraphStore'

type FGNode = GraphNode & { x?: number; y?: number }
type FGLink = GraphLink & { source: FGNode | string; target: FGNode | string }

export default function GraphCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const fgRef = useRef<any>(undefined)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const { graphData: rawGraphData, selectedNode, setSelectedNode } = useGraphStore()
  const graphData: any = rawGraphData

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }
    update()
    const ro = new ResizeObserver(update)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Zoom to fit when data loads
  useEffect(() => {
    if (graphData.nodes.length > 0) {
      setTimeout(() => fgRef.current?.zoomToFit(800, 80), 500)
    }
  }, [graphData.nodes.length])

  const handleNodeClick = useCallback(
    (node: FGNode) => {
      setSelectedNode(node as GraphNode)
    },
    [setSelectedNode]
  )

  const paintNode = useCallback(
    (node: FGNode, ctx: CanvasRenderingContext2D) => {
      const x = node.x ?? 0
      const y = node.y ?? 0
      const isSelected = selectedNode?.id === node.id
      const color = node.color ?? '#00d4ff'
      const radius = isSelected ? 8 : 5

      // Outer glow
      const glowSize = isSelected ? 24 : 14
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize)
      gradient.addColorStop(0, color + '44')
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, glowSize, 0, 2 * Math.PI)
      ctx.fill()

      // Core circle
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fillStyle = isSelected ? color : color + 'cc'
      ctx.fill()

      // Ring for selected
      if (isSelected) {
        ctx.beginPath()
        ctx.arc(x, y, radius + 3, 0, 2 * Math.PI)
        ctx.strokeStyle = color + '80'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Label
      const fontSize = isSelected ? 11 : 9
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`
      ctx.fillStyle = isSelected ? '#f0f0ff' : '#a0a0c0'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.name, x, y + radius + fontSize)
    },
    [selectedNode]
  )

  const paintLink = useCallback((link: FGLink, ctx: CanvasRenderingContext2D) => {
    const source = link.source as FGNode
    const target = link.target as FGNode
    if (!source.x || !target.x) return

    const strength = link.strength ?? 0.5
    ctx.beginPath()
    ctx.moveTo(source.x, source.y ?? 0)
    ctx.lineTo(target.x, target.y ?? 0)
    ctx.strokeStyle = `rgba(100, 100, 160, ${strength * 0.4})`
    ctx.lineWidth = strength * 1.5
    ctx.stroke()
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full">
      {graphData.nodes.length > 0 ? (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeId="id"
          nodeLabel="name"
          nodeCanvasObject={paintNode}
          nodeCanvasObjectMode={() => 'replace'}
          linkCanvasObject={paintLink}
          linkCanvasObjectMode={() => 'replace'}
          onNodeClick={handleNodeClick}
          backgroundColor="#02020a"
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={1.5}
          linkDirectionalParticleColor={(link) => {
            const l = link as FGLink
            const source = l.source as FGNode
            return source.color ?? '#9d4edd'
          }}
          linkDirectionalParticleSpeed={0.004}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          minZoom={0.2}
          maxZoom={8}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border border-violet/40 rounded-full animate-spin border-t-violet mx-auto" />
            <p className="font-mono text-xs text-muted">Loading memory graph...</p>
          </div>
        </div>
      )}
    </div>
  )
}
