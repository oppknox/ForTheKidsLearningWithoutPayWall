import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppStateProvider } from './state/ProfilesContext'
import { Mascot } from './components/Mascot'

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

function Home() {
  return (
    <main className="screen">
      <h1 className="screen-title">For The Kids</h1>
      <Mascot mood="idle" />
    </main>
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
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppStateProvider>
  )
}
