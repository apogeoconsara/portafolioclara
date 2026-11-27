import Layout from './components/Layout'
import { PlanProvider, usePage } from './lib/store'
import Design from './pages/Design'
import Landing from './pages/Landing'

export default function App() {
  const page = usePage()
  if (page === 'home') return <Landing />
  return <PlanProvider><Layout><Design /></Layout></PlanProvider>
}
