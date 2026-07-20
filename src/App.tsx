import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppStateProvider } from './state/ProfilesContext'
import { WhoIsPlaying } from './screens/WhoIsPlaying'
import { ParentGate } from './screens/ParentGate'
import { ProfileEditor } from './screens/ProfileEditor'

function Clouds() {
  const clouds = [
    { top: '8%', duration: 70, delay: -20, scale: 1 },
    { top: '22%', duration: 95, delay: -60, scale: 0.7 },
    { top: '55%', duration: 110, delay: -35, scale: 0.5 },
  ]
  return (
    <div className="cloud-layer" aria-hidden="true">
      {clouds.map((c, i) => (
        <span
          key={i}
          className="cloud"
          style={{
            top: c.top,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
            transform: `scale(${c.scale})`,
          }}
        />
      ))}
    </div>
  )
}

export default function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <div className="app-shell">
          <div className="sky" />
          <Clouds />
          <Routes>
            <Route path="/" element={<WhoIsPlaying />} />
            <Route path="/grown-ups" element={<ParentGate />} />
            <Route path="/grown-ups/edit/:id?" element={<ProfileEditor />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppStateProvider>
  )
}
