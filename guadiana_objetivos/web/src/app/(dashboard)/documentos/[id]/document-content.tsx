'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'

interface DocumentContentProps {
  content: string
  fileType: 'txt' | 'md'
  isEditing?: boolean
  onContentChange?: (content: string) => void
}

/**
 * Componente para renderizar o editar contenido de documentos.
 * Punto F - Detección de enlaces [[...]]:
 * - Si es .md: renderiza con react-markdown + remarkGfm
 * - Si es .txt: muestra como pre con whitespace preservado
 * - Los enlaces [[Título]] se convierten en links a búsqueda por título
 */
export function DocumentContent({ content, fileType, isEditing, onContentChange }: DocumentContentProps) {
  if (isEditing) {
    return (
      <textarea
        value={content}
        onChange={(e) => onContentChange?.(e.target.value)}
        className="w-full h-full min-h-[500px] font-mono text-sm p-4 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />
    )
  }

  // Función para detectar y convertir enlaces [[...]] en formato markdown
  const convertObsidianLinks = (text: string): string => {
    // Patrón para detectar [[Título]] o [[Título|Alias]]
    return text.replace(/\[\[([^\]]+)\]\]/g, (match, content) => {
      const [title, alias] = content.split('|')
      const displayText = alias || title
      // Crear link markdown: [displayText](/documentos?search=title)
      return `[${displayText}](/documentos?search=${encodeURIComponent(title.trim())})`
    })
  }

  // Si es texto plano, mostrar con formato pre
  if (fileType === 'txt') {
    return (
      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
        {content}
      </pre>
    )
  }

  // Si es markdown, procesar enlaces [[...]] y renderizar
  const processedContent = convertObsidianLinks(content)

  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Punto F - Links [[...]] se convirtieron a links markdown estándar
          a: ({ node, ...props }) => {
            const href = props.href || ''

            // Si es un enlace interno (/documentos?search=...), usar Link de Next.js
            if (href.startsWith('/documentos')) {
              return <Link {...props} href={href} className="text-primary hover:underline font-medium" />
            }

            // Si es enlace externo, abrir en nueva pestaña
            return (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              />
            )
          },
          // Estilizar headers
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-5 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-base font-semibold mt-3 mb-2" {...props} />,
          // Estilizar listas
          ul: ({ node, ...props }) => <ul className="list-disc list-inside my-3 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-3 space-y-1" {...props} />,
          li: ({ node, ...props }) => <li className="ml-4" {...props} />,
          // Estilizar código
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props} />
            ) : (
              <code className="block bg-muted p-3 rounded-md text-sm overflow-x-auto" {...props} />
            ),
          // Estilizar bloques
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic my-4" {...props} />
          ),
          // Estilizar tablas (remarkGfm)
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-muted" {...props} />,
          th: ({ node, ...props }) => (
            <th className="border border-border px-4 py-2 text-left font-semibold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-border px-4 py-2" {...props} />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
