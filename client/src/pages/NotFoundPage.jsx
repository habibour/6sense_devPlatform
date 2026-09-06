import { Link } from 'react-router-dom'
import { PageContainer } from '../components/layout/PageContainer'

// Rendered by App.jsx's catch-all `*` route — anything not matching a known path lands here.
export default function NotFoundPage() {
  return (
    <PageContainer>
      <div className="text-center py-16">
        <div className="text-5xl font-bold text-chrome-300 mb-3">404</div>
        <p className="text-chrome-600 mb-6">This page doesn't exist.</p>
        <Link to="/" className="text-brand-600 hover:text-brand-700 font-medium">
          Back to feed
        </Link>
      </div>
    </PageContainer>
  )
}
