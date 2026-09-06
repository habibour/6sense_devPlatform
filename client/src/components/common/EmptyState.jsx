import { Inbox } from 'lucide-react'

export function EmptyState({ title, description }) {
  return (
    <div className="border border-chrome-200 rounded-lg bg-chrome-0 p-10 text-center">
      <div className="flex justify-center text-chrome-400 mb-3">
        <Inbox size={30} strokeWidth={1.5} />
      </div>
      <div className="font-semibold text-chrome-900 mb-1">{title}</div>
      {description && <div className="text-sm text-chrome-500">{description}</div>}
    </div>
  )
}
