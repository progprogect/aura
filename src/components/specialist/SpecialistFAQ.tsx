'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface FAQ {
  id: string
  question: string
  answer: string
}

export interface SpecialistFAQProps {
  faqs: FAQ[]
  showTitle?: boolean
}

export function SpecialistFAQ({ faqs, showTitle = true }: SpecialistFAQProps) {
  const [openId, setOpenId] = React.useState<string | null>(null)

  if (!faqs || faqs.length === 0) {
    return null
  }

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <motion.div
      id="faq"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <Card className="border-gray-200 shadow-sm">
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              ❓ Частые вопросы
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-2">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="overflow-hidden rounded-lg border border-gray-200 transition-colors hover:border-gray-300"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-gray-500 transition-transform',
                    openId === faq.id && 'rotate-180'
                  )}
                />
              </button>

              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="border-t border-gray-200 p-4 text-gray-700">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}



