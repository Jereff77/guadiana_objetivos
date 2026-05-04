'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Plus, Upload } from 'lucide-react'
import { uploadDocument, getAllowedRoles, type Category } from '@/app/(dashboard)/documentos/documento-actions'

interface UploadDocumentDialogProps {
  categories: Category[]
}

export function UploadDocumentDialog({ categories }: UploadDocumentDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [categoryId, setCategoryId] = useState<string>('')
  const [accessType, setAccessType] = useState<'public' | 'private' | 'roles'>('public')
  const [allowedRoles, setAllowedRoles] = useState<string[]>([])
  const [tags, setTags] = useState('')

  // Roles para selector
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([])

  const router = useRouter()
  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleToggleRole = (roleId: string) => {
    setAllowedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast.error('Debes seleccionar un archivo')
      return
    }

    if (!title.trim()) {
      toast.error('El título es obligatorio')
      return
    }

    if (accessType === 'roles' && allowedRoles.length === 0) {
      toast.error('Debes seleccionar al menos un rol')
      return
    }

    setLoading(true)

    // Parse tags
    const tagsArray = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    const result = await uploadDocument({
      title: title.trim(),
      description: description.trim() || undefined,
      file,
      category_id: categoryId || undefined,
      access_type: accessType,
      allowed_roles: accessType === 'roles' ? allowedRoles : undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined
    })

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Documento subido correctamente')
    setOpen(false)

    // Reset form
    setTitle('')
    setDescription('')
    setFile(null)
    setCategoryId('')
    setAccessType('public')
    setAllowedRoles([])
    setTags('')

    // Refresh page
    router.refresh()
  }

  const loadRoles = async () => {
    const result = await getAllowedRoles()
    if (result.data) {
      setRoles(result.data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={loadRoles}>
          <Plus className="w-4 h-4 mr-2" />
          Subir Documento
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir Documento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Archivo */}
          <div className="space-y-2">
            <Label htmlFor="file">Archivo *</Label>
            <Input
              id="file"
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              onChange={handleChangeFile}
              required
            />
            <p className="text-sm text-gray-500">
              Solo archivos .txt y .md (máx 10MB)
            </p>
            {file && (
              <p className="text-sm text-blue-600">
                Seleccionado: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Manual de Procedimientos de Ventas"
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción breve del contenido..."
              rows={3}
            />
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Sin categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color_hex }}
                      />
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Acceso */}
          <div className="space-y-2">
            <Label htmlFor="accessType">Tipo de Acceso *</Label>
            <Select value={accessType} onValueChange={(v: any) => setAccessType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  Público - Todos los usuarios autenticados
                </SelectItem>
                <SelectItem value="private">
                  Privado - Solo tú y administradores
                </SelectItem>
                <SelectItem value="roles">
                  Por Roles - Solo usuarios seleccionados
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Roles Permitidos (condicional) */}
          {accessType === 'roles' && (
            <div className="space-y-2">
              <Label>Roles Permitidos *</Label>
              <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                {roles.length === 0 ? (
                  <p className="text-sm text-gray-500">Cargando roles...</p>
                ) : (
                  roles.map(role => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={role.id}
                        checked={allowedRoles.includes(role.id)}
                        onCheckedChange={() => handleToggleRole(role.id)}
                      />
                      <Label htmlFor={role.id} className="cursor-pointer">
                        {role.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
              <p className="text-sm text-gray-500">
                Selecciona al menos un rol
              </p>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Etiquetas</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="ventas, procedimientos, 2024 (separadas por coma)"
            />
            <p className="text-sm text-gray-500">
              Separa las etiquetas con comas
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Documento
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
