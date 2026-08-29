import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppStateProvider } from './state/AppState'
import { NavBar } from './components/NavBar'
import { Today } from './pages/Today'
import { SplitSetup } from './pages/SplitSetup'
import { Session } from './pages/Session'
import { ExercisePicker } from './pages/ExercisePicker'
import { History } from './pages/History'
import { ExerciseHistory } from './pages/ExerciseHistory'

export default function App() {
  return (
    <AppStateProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/split" element={<SplitSetup />} />
          <Route path="/session/:sessionId" element={<Session />} />
          <Route path="/session/:sessionId/add" element={<ExercisePicker />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/exercise/:exerciseId" element={<ExerciseHistory />} />
        </Routes>
        <NavBar />
      </HashRouter>
    </AppStateProvider>
  )
}
