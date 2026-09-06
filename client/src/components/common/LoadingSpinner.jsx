import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ className = '' }) {
  return <Loader2 className={`animate-spin ${className}`} size={20} />
}
