import { Route, Routes } from 'react-router-dom'
import { OceanCanvas } from './ocean/OceanCanvas'

function Ocean() {
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
