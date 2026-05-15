import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import GraphPage from './pages/GraphPage'
import NodeDetailPage from './pages/NodeDetailPage'
import WorkshopPage from './pages/WorkshopPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing has its own nav */}
        <Route path="/" element={<LandingPage />} />

        {/* Graph page: full screen, no top navbar (it would overlap) */}
        <Route
          path="/graph"
          element={
            <>
              <Navbar />
              <GraphPage />
            </>
          }
        />

        {/* Regular pages */}
        <Route
          path="/memory/:slug"
          element={
            <>
              <Navbar />
              <NodeDetailPage />
            </>
          }
        />
        <Route
          path="/workshop"
          element={
            <>
              <Navbar />
              <WorkshopPage />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
