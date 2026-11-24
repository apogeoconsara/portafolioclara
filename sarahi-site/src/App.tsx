import Layout from './components/Layout'
import { PlanProvider, usePage } from './lib/store'
import About from './pages/About'
import Adoption from './pages/Adoption'
import Ask from './pages/Ask'
import Brief from './pages/Brief'
import FitPage from './pages/FitPage'
import Flow from './pages/Flow'
import Impact from './pages/Impact'
import Profile from './pages/Profile'
import Prototype from './pages/Prototype'
import Readiness from './pages/Readiness'
import UseCases from './pages/UseCases'

const VIEWS = { about: About, fit: FitPage, ask: Ask, profile: Profile, usecases: UseCases, flow: Flow, readiness: Readiness, adoption: Adoption, impact: Impact, brief: Brief, prototype: Prototype }

export default function App() {
  const page = usePage()
  const View = VIEWS[page]
  return <PlanProvider><Layout page={page}><View /></Layout></PlanProvider>
}
