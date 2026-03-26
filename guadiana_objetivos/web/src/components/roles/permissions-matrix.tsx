'use client'

interface PlatformModule {
  id: string
  key: string
  label: string
  module: string
  sort_order: number
}

interface PermissionsMatrixProps {
  modules: PlatformModule[]
  selectedKeys: string[]
  isRoot?: boolean
  disabled?: boolean
  onChange?: (keys: string[]) => void
}

// Agrupar módulos por su campo 'module'
function groupByModule(modules: PlatformModule[]): Record<string, PlatformModule[]> {
  return modules.reduce<Record<string, PlatformModule[]>>((acc, mod) => {
    if (!acc[mod.module]) acc[mod.module] = []
    acc[mod.module].push(mod)
    return acc
  }, {})
}

export function PermissionsMatrix({
  modules,
  selectedKeys,
  isRoot = false,
  disabled = false,
  onChange,
}: PermissionsMatrixProps) {
  const grouped = groupByModule(modules)
  const moduleGroups = Object.keys(grouped).sort()

  function handleToggle(key: string) {
    if (!onChange || disabled || isRoot) return
    const next = selectedKeys.includes(key)
      ? selectedKeys.filter((k) => k !== key)
      : [...selectedKeys, key]
    onChange(next)
  }

  function handleToggleGroup(groupKeys: string[], checked: boolean) {
    if (!onChange || disabled || isRoot) return
    const next = checked
      ? [...new Set([...selectedKeys, ...groupKeys])]
      : selectedKeys.filter((k) => !groupKeys.includes(k))
    onChange(next)
  }

  return (
    <div className="space-y-4">
      {isRoot && (
        <p className="text-sm text-muted-foreground bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          El rol <strong>root</strong> tiene acceso total a todos los módulos. Los permisos no son configurables.
        </p>
      )}

      {moduleGroups.map((moduleName) => {
        const mods = grouped[moduleName].sort((a, b) => a.sort_order - b.sort_order)
        const groupKeys = mods.map((m) => m.key)
        const allSelected = isRoot || groupKeys.every((k) => selectedKeys.includes(k))
        const someSelected = isRoot || groupKeys.some((k) => selectedKeys.includes(k))

        return (
          <div key={moduleName} className="border rounded-lg overflow-hidden">
            {/* Header del grupo */}
            <div className="flex items-center gap-3 bg-muted/40 px-4 py-2 border-b">
              <input
                type="checkbox"
                id={`group-${moduleName}`}
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = !allSelected && someSelected
                }}
                onChange={(e) => handleToggleGroup(groupKeys, e.target.checked)}
                disabled={disabled || isRoot}
                className="h-4 w-4 rounded border-gray-300 text-brand-blue cursor-pointer disabled:cursor-default"
              />
              <label
                htmlFor={`group-${moduleName}`}
                className="text-sm font-semibold text-foreground cursor-pointer select-none"
              >
                {moduleName}
              </label>
            </div>

            {/* Permisos del grupo */}
            <div className="divide-y">
              {mods.map((mod) => {
                const checked = isRoot || selectedKeys.includes(mod.key)
                return (
                  <label
                    key={mod.key}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggle(mod.key)}
                      disabled={disabled || isRoot}
                      className="h-4 w-4 rounded border-gray-300 text-brand-blue cursor-pointer disabled:cursor-default"
                    />
                    <span className="text-sm text-foreground">{mod.label}</span>
                    <code className="ml-auto text-xs text-muted-foreground font-mono">
                      {mod.key}
                    </code>
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
