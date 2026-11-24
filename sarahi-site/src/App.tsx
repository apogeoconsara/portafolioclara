import Case from './components/Case'
import Dashboard from './components/Dashboard'
import Hero from './components/Hero'
import Journey from './components/Journey'
import Nav from './components/Nav'
import Fit from './components/Fit'
import Prototype from './components/Prototype'
import Why from './components/Why'

export default function App() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Fit />
        <Case />
        <Dashboard />
        <Journey />
        <Prototype />
        <Why />
      </main>
    </>
  )
}
