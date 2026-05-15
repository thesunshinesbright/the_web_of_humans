import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AuthModal from '../components/AuthModal'
import { useAuth } from '../hooks/useAuth'

// Mini animated background graph (pure canvas, no deps)
function BackgroundGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const W = canvas.width = window.innerWidth
    const H = canvas.height = window.innerHeight

    const COLORS = ['#00d4ff', '#9d4edd', '#3effa0', '#ffb347', '#ff6b9d']

    const nodes = Array.from({ length: 60 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 3 + 1.5,
      color: COLORS[i % COLORS.length],
    }))

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 160) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(100, 100, 160, ${(1 - dist / 160) * 0.15})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4)
        grad.addColorStop(0, n.color + '60')
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = n.color + 'cc'
        ctx.fill()

        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
      }

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-40" />
}

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false)
  const { user } = useAuth()

  const stats = [
    { label: 'Node Types', value: '8' },
    { label: 'Relationship Types', value: '8' },
    { label: 'Open Source', value: '∞' },
  ]

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-bg">
      <BackgroundGraph />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, #02020a 70%)' }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full border border-cyan/50 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_8px_#00d4ff]" />
          </div>
          <span className="font-display text-lg text-text/80 tracking-wide">
            memory<span className="text-cyan">graph</span>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/graph" className="font-mono text-xs text-muted hover:text-text transition-colors uppercase tracking-widest">
            Explore
          </Link>
          {user ? (
            <Link to="/workshop" className="btn-primary text-xs py-1.5 px-4">Workshop →</Link>
          ) : (
            <button onClick={() => setShowAuth(true)} className="btn-primary text-xs py-1.5 px-4">
              Connect
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-mono text-xs text-violet uppercase tracking-[0.3em] mb-6">
            Collective Human Memory
          </p>

          <h1 className="font-display font-light text-[clamp(2.5rem,8vw,6rem)] leading-[1.05] text-text mb-8 max-w-4xl">
            What do humans{' '}
            <em className="text-gradient-cyan not-italic">remember</em>
            {' '}together?
          </h1>

          <p className="font-mono text-sm text-muted max-w-lg mx-auto leading-relaxed mb-12">
            An evolving graph of associations, heuristics, emotions, and cultural memory.
            Not a database of facts — a map of what we carry.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/graph" className="btn-primary px-8 py-3 text-sm tracking-wider glow-cyan">
              Enter the Graph →
            </Link>
            {!user && (
              <button
                onClick={() => setShowAuth(true)}
                className="btn-ghost px-8 py-3 text-sm tracking-wider"
              >
                Create Account
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex items-center gap-12 mt-20"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl text-cyan mb-1">{s.value}</div>
              <div className="font-mono text-xs text-muted uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent pointer-events-none" />

      {/* Sample memory pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 1 }}
        className="relative z-10 pb-12 flex flex-wrap justify-center gap-2 px-8 max-w-3xl mx-auto"
      >
        {[
          { text: 'chocolate → comfort', color: '#ffb347' },
          { text: 'rain → sadness', color: '#00d4ff' },
          { text: 'BPM → music production', color: '#3effa0' },
          { text: 'coffee → focus', color: '#ff6b9d' },
          { text: 'debugging → pattern recognition', color: '#9d4edd' },
          { text: 'childhood → summer', color: '#ffb347' },
        ].map((pill) => (
          <span
            key={pill.text}
            className="font-mono text-xs px-3 py-1 rounded-full border"
            style={{ borderColor: pill.color + '40', color: pill.color + 'cc', background: pill.color + '08' }}
          >
            {pill.text}
          </span>
        ))}
      </motion.div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
