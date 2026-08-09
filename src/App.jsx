import { useState } from 'react'
import { DEFAULT_MODULE_ID, getModule } from './modules/registry'

/**
 * Thin shell: owns the active database/module and renders its Component.
 * Module-specific data, filters, and views live under src/modules/*.
 */
export default function App() {
  const [moduleId, setModuleId] = useState(DEFAULT_MODULE_ID)
  const module = getModule(moduleId)
  const ModuleComponent = module.Component

  return (
    <ModuleComponent activeModuleId={moduleId} onModuleChange={setModuleId} />
  )
}
