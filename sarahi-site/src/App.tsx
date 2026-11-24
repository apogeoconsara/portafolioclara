import Layout from './components/Layout'
import { PlanProvider, usePage } from './lib/store'
import AssistantPage from './pages/Assistant'
import Plan from './pages/Plan'
import Start from './pages/Start'
import Prototype from './pages/Prototype'

const VIEWS = { start: Start, plan: Plan, assistant: AssistantPage, prototype: Prototype }

export default function App() {
  const page = usePage()
  const View = VIEWS[page]
  return <PlanProvider><Layout page={page}><View /></Layout></PlanProvider>
}
