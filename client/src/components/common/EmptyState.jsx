export function EmptyState({ title, description }) {
  return (
    <div className="border border-slate-200 rounded-lg bg-white p-10 text-center">
      <div className="flex justify-center text-slate-400 mb-3">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
        </svg>
      </div>
      <div className="font-semibold text-slate-900 mb-1">{title}</div>
      {description && <div className="text-sm text-slate-500">{description}</div>}
    </div>
  )
}
