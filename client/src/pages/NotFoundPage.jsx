import { Link } from 'react-router-dom'
import { PageContainer } from '../components/layout/PageContainer'

export default function NotFoundPage() {
  return (
    <PageContainer>
      <div className="text-center py-16">
        <div className="text-5xl font-bold text-slate-300 mb-3">404</div>
        <p className="text-slate-600 mb-6">This page doesn't exist.</p>
        <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Back to feed
        </Link>
      </div>
    </PageContainer>
  )
}
