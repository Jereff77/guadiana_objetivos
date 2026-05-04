'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { FileText } from 'lucide-react'

interface Source {
  doc_id: string
  title: string
  chunk_id: string
}

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
}

export default function ChatMessage({ role, content, sources = [] }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-[#194D95] text-white'
            : 'bg-white border border-gray-200 text-gray-900'
        }`}
      >
        {/* Contenido del mensaje */}
        <div className="prose prose-sm max-w-none">
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Estilizar links dentro del markdown
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    className="text-[#194D95] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                // Estilizar listas
                ul: ({ node, ...props }) => <ul className="list-disc pl-4 my-2" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-4 my-2" {...props} />,
                // Estilizar párrafos
                p: ({ node, ...props }) => <p className="my-1" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>

        {/* Badges de fuentes (solo para mensajes del asistente) */}
        {!isUser && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Fuentes:</p>
            <div className="flex flex-wrap gap-2">
              {sources.map((source) => (
                <Link
                  key={source.chunk_id}
                  href={`/documentos/${source.doc_id}`}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-[#194D95] text-[#194D95] rounded hover:bg-blue-50 transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  <span>{source.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
