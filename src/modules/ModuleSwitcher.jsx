import { useEffect, useId, useRef, useState } from 'react'
import { MODULES } from './registry'

/**
 * Clickable brand area that opens a module / database switcher dropdown.
 */
export default function ModuleSwitcher({ activeModuleId, onModuleChange, title, subtitle }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const selectModule = (id) => {
    onModuleChange(id)
    setOpen(false)
  }

  return (
    <div className={`module-switcher ${open ? 'is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="module-switcher__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="brand__mark" aria-hidden="true" />
        <span className="module-switcher__copy">
          <span className="module-switcher__title">{title}</span>
          <span className="module-switcher__subtitle">{subtitle}</span>
        </span>
        <span className="module-switcher__chevron" aria-hidden="true" />
      </button>

      {open && (
        <div className="module-switcher__menu" role="listbox" id={listId} aria-label="Databases">
          <p className="module-switcher__menu-label">Switch database</p>
          {MODULES.map((mod) => {
            const active = mod.id === activeModuleId
            return (
              <button
                key={mod.id}
                type="button"
                role="option"
                aria-selected={active}
                className={`module-switcher__option ${active ? 'is-active' : ''}`}
                onClick={() => selectModule(mod.id)}
              >
                <span className="module-switcher__option-text">
                  <span className="module-switcher__option-title">{mod.title}</span>
                  <span className="module-switcher__option-subtitle">{mod.subtitle}</span>
                </span>
                {active && <span className="module-switcher__check" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
