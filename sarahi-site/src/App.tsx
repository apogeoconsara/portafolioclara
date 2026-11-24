import Layout from './components/Layout'
import { PlanProvider, usePage } from './lib/store'
import Overview from './pages/Overview'
import Prototype from './pages/Prototype'
import { Adopt, Design, Discover, Implement, Optimize } from './pages/Stages'

const VIEWS = { overview: Overview, discover: Discover, design: Design, implement: Implement, adopt: Adopt, optimize: Optimize, prototype: Prototype }

export default function App() {
  const page = usePage()
  const View = VIEWS[page]
  return <PlanProvider><Layout page={page}><View /></Layout></PlanProvider>
}
