import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AppStateProvider } from './state/AppState'
import { NavBar } from './components/NavBar'
import { Today } from './pages/Today'
import { SplitSetup } from './pages/SplitSetup'
import { Session } from './pages/Session'
import { ExercisePicker } from './pages/ExercisePicker'
import { History } from './pages/History'
import { ExerciseHistory } from './pages/ExerciseHistory'
import { ExerciseLibrary } from './pages/ExerciseLibrary'
import { Volume } from './pages/Volume'
import { BodyWeight } from './pages/BodyWeight'

// Keying on pathname gives this wrapper a fresh DOM node on every real
// navigation, which replays the page-enter CSS animation — without needing
// to touch every individual page file.
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-enter flex flex-1 flex-col">
      <Routes location={location}>
        <Route path="/" element={<Today />} />
        <Route path="/split" element={<SplitSetup />} />
        <Route path="/session/:sessionId" element={<Session />} />
        <Route path="/session/:sessionId/add" element={<ExercisePicker />} />
        <Route path="/history" element={<History />} />
        <Route path="/history/volume" element={<Volume />} />
        <Route path="/history/bodyweight" element={<BodyWeight />} />
        <Route path="/history/exercise/:exerciseId" element={<ExerciseHistory />} />
        <Route path="/exercises" element={<ExerciseLibrary />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AppStateProvider>
      <HashRouter>
        <AnimatedRoutes />
        <NavBar />
      </HashRouter>
    </AppStateProvider>
  )
}
