import Layout from './components/Layout'
import { PlanProvider, usePage } from './lib/store'
import Adoption from './pages/Adoption'
import Assistant from './pages/Assistant'
import Brief from './pages/Brief'
import Overview from './pages/Overview'
import Flow from './pages/Flow'
import Impact from './pages/Impact'
import Profile from './pages/Profile'
import Prototype from './pages/Prototype'
import Readiness from './pages/Readiness'
import UseCases from './pages/UseCases'

const VIEWS = { overview: Overview, assistant: Assistant, profile: Profile, usecases: UseCases, flow: Flow, readiness: Readiness, adoption: Adoption, impact: Impact, brief: Brief, prototype: Prototype }

export default function App() {
  const page = usePage()
  const View = VIEWS[page]
  return <PlanProvider><Layout page={page}><View /></Layout></PlanProvider>
}
