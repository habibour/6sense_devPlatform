export function ErrorBanner({ title, message }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start">
      <svg className="text-red-600 flex-shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <div>
        <div className="font-semibold text-red-800 text-sm mb-0.5">{title}</div>
        {message && <div className="text-sm text-red-700">{message}</div>}
      </div>
    </div>
  )
}
