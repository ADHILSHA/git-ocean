import { Route, Routes } from 'react-router-dom'
import { useOceanData } from './data/useOceanData'
import { OceanCanvas } from './ocean/OceanCanvas'
import { SearchBox } from './components/SearchBox'
import { DepthCompass } from './components/DepthCompass'
import { Flash } from './components/Flash'
import { DataNote } from './components/DataNote'
import { InfoCard } from './components/InfoCard'
import { PermalinkDive } from './components/PermalinkDive'
import { useOcean } from './store/oceanStore'

export default function App() {
  useOceanData()
  const hasCard = useOcean((s) => s.selectionId !== null)
  return (
    <main className={hasCard ? 'ocean has-card' : 'ocean'}>
      <h1 className="sr-only">Git Ocean: GitHub is an ocean. Dive in.</h1>
      <OceanCanvas />
      <div id="selection-ring" className="selection-ring" hidden aria-hidden="true" />
      <Flash />
      <SearchBox />
      <DepthCompass />
      <DataNote />
      <InfoCard />
      <Routes>
        <Route path="/" element={null} />
        <Route path="/dive/:owner/:repo" element={<PermalinkDive />} />
        <Route path="*" element={null} />
      </Routes>
    </main>
  )
}
