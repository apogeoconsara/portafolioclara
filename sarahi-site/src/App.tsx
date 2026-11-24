import Case from './components/Case'
import Dashboard from './components/Dashboard'
import Hero from './components/Hero'
import Journey from './components/Journey'
import Nav from './components/Nav'
import Prototype from './components/Prototype'
import Training from './components/Training'
import Why from './components/Why'

export default function App() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Journey />
        <Prototype />
        <Case />
        <Training />
        <Dashboard />
        <Why />
      </main>
    </>
  )
}
