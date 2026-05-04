import { AppShell } from './components/layout/AppShell'
import { ToastProvider } from './components/ui/Toast'

export default function App() {
  return (
    <>
      <AppShell />
      <ToastProvider />
    </>
  )
}
