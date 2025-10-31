/**
 * Компонент модального окна подтверждения
 */

'use client'

import { Dialog } from './dialog'
import { Button } from './button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  variant = 'default'
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 justify-end w-full">
          <Button
            variant="outline"
            onClick={onClose}
            className="order-2 sm:order-1 sm:flex-shrink-0"
            size="lg"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            className="order-1 sm:order-2 flex-1 sm:flex-initial"
            size="lg"
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-muted-foreground">{message}</p>
    </Dialog>
  )
}

