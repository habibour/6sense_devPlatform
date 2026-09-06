import { AlertCircle } from 'lucide-react'

export function ErrorBanner({ title, message }) {
  return (
    // Error red stays semantic/universal, not re-themed to brand teal.
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start">
      <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
      <div>
        <div className="font-semibold text-red-800 text-sm mb-0.5">{title}</div>
        {message && <div className="text-sm text-red-700">{message}</div>}
      </div>
    </div>
  )
}
