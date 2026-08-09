import { Suspense, useState } from 'react'
import LogoutButton from './components/auth/LogoutButton'
import PasswordGate from './components/auth/PasswordGate'
import { Loading } from './components/common/States'
import { clearAuthentication, isAuthenticated } from './utils/auth'
import { DEFAULT_MODULE_ID, getModule } from './modules/registry'

/**
 * Thin shell: auth gate first, then the active database/module.
 * Main modules (and their Ninox fetches) only mount after authentication.
 */
export default function App() {
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated())
  const [moduleId, setModuleId] = useState(DEFAULT_MODULE_ID)

  if (!authenticated) {
    return <PasswordGate onSuccess={() => setAuthenticated(true)} />
  }

  const module = getModule(moduleId)
  const ModuleComponent = module.Component

  const handleLogout = () => {
    clearAuthentication()
    setAuthenticated(false)
    setModuleId(DEFAULT_MODULE_ID)
  }

  return (
    <Suspense fallback={<Loading message="Loading…" />}>
      <ModuleComponent
        activeModuleId={moduleId}
        onModuleChange={setModuleId}
        logoutControl={<LogoutButton onLogout={handleLogout} />}
      />
    </Suspense>
  )
}
