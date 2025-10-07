import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Стилизация для списков
          ul: ({ children, ...props }) => (
            <ul className="list-disc pl-4 space-y-1 my-2" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal pl-4 space-y-1 my-2" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-foreground" {...props}>
              {children}
            </li>
          ),
          // Стилизация для жирного текста
          strong: ({ children, ...props }) => (
            <strong className="font-semibold text-foreground" {...props}>
              {children}
            </strong>
          ),
          // Стилизация для курсива
          em: ({ children, ...props }) => (
            <em className="italic text-foreground" {...props}>
              {children}
            </em>
          ),
          // Стилизация для параграфов
          p: ({ children, ...props }) => (
            <p className="text-foreground leading-relaxed mb-2" {...props}>
              {children}
            </p>
          ),
          // Стилизация для заголовков
          h1: ({ children, ...props }) => (
            <h1 className="text-xl font-bold text-foreground mb-2" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-lg font-semibold text-foreground mb-2" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-base font-semibold text-foreground mb-1" {...props}>
              {children}
            </h3>
          ),
          // Стилизация для ссылок
          a: ({ children, href, ...props }) => (
            <a 
              href={href} 
              className="text-blue-600 hover:text-blue-800 underline" 
              target="_blank" 
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          // Стилизация для кода
          code: ({ children, ...props }) => (
            <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          ),
          // Стилизация для блоков кода
          pre: ({ children, ...props }) => (
            <pre className="bg-muted p-3 rounded-lg overflow-x-auto my-2" {...props}>
              {children}
            </pre>
          ),
          // Стилизация для цитат
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-muted-foreground pl-4 italic my-2" {...props}>
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
