import StudyShell from './components/StudyShell'
import { ProgressProvider } from './components/ProgressContext'

export default function App() {
  return (
    <ProgressProvider>
      <StudyShell />
    </ProgressProvider>
  )
}
