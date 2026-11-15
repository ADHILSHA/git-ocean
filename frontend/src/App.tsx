import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { fixtureRepos } from './data/fixtures'
import { mapRepoToCreature } from './data/mapRepoToCreature'
import { useOcean } from './store/oceanStore'
import { OceanCanvas } from './ocean/OceanCanvas'

function Ocean() {
  useEffect(() => {
    useOcean.getState().setCreatures(fixtureRepos().map((r) => mapRepoToCreature(r)), 'mock')
  }, [])
  return (
    <main className="ocean">
      <OceanCanvas />
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Ocean />} />
      <Route path="/dive/:owner/:repo" element={<Ocean />} />
      <Route path="*" element={<Ocean />} />
    </Routes>
  )
}
