import { Route, Routes } from 'react-router-dom'
import { useOceanData } from './data/useOceanData'
import { OceanCanvas } from './ocean/OceanCanvas'
import { SearchBox } from './components/SearchBox'
import { DepthCompass } from './components/DepthCompass'
import { Flash } from './components/Flash'
import { DataNote } from './components/DataNote'

export default function App() {
  useOceanData()
  return (
    <main className="ocean">
      <h1 className="sr-only">Git Ocean: GitHub is an ocean. Dive in.</h1>
      <OceanCanvas />
      <Flash />
      <SearchBox />
      <DepthCompass />
      <DataNote />
      <Routes>
        <Route path="/" element={null} />
        <Route path="/dive/:owner/:repo" element={null} />
        <Route path="*" element={null} />
      </Routes>
    </main>
  )
}
