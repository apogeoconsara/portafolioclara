import Layout from './components/Layout'
import { PlanProvider, usePage } from './lib/store'
import Landing from './pages/Landing'
import Questions from './pages/Questions'
import { Adopt, Design, Discover, Implement, Optimize } from './pages/Stages'

const VIEWS = { questions: Questions, discover: Discover, design: Design, implement: Implement, adopt: Adopt, optimize: Optimize }

export default function App() {
  const page = usePage()
  if (page === 'home') return <Landing />
  const View = VIEWS[page]
  return <PlanProvider><Layout page={page}><View /></Layout></PlanProvider>
}
