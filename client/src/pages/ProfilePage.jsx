import { useParams } from 'react-router-dom'
import { PageContainer } from '../components/layout/PageContainer'
import { ErrorBanner } from '../components/common/ErrorBanner'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ExperienceList } from '../components/profile/ExperienceList'
import { SkillsEditor } from '../components/profile/SkillsEditor'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../hooks/useProfile'

export default function ProfilePage() {
  const { userId } = useParams()
  const { user: authUser } = useAuth()
  const profile = useUser(userId)
  const isOwn = authUser?.id === userId

  if (profile.isPending) {
    return (
      <PageContainer>
        <div className="flex justify-center text-chrome-400">
          <LoadingSpinner />
        </div>
      </PageContainer>
    )
  }

  if (profile.isError) {
    return (
      <PageContainer>
        <ErrorBanner
          title={profile.error.statusCode === 404 ? 'User not found' : 'Failed to load profile'}
          message={profile.error.statusCode === 404 ? "This user doesn't exist." : profile.error.message}
        />
      </PageContainer>
    )
  }

  const data = profile.data

  return (
    // Bumped to max-w-3xl locally (not via PageContainer's default) so login/register/
    // new-post stay at their narrower width.
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="bg-chrome-0 border border-chrome-200 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xl flex-shrink-0">
            {data.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-bold text-chrome-900">{data.name}</div>
            <div className="font-mono text-xs text-chrome-400 mt-0.5">
              joined {new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {data.bio && <p className="text-sm text-chrome-700 leading-relaxed mt-4">{data.bio}</p>}
      </div>

      <div className="bg-chrome-0 border border-chrome-200 rounded-xl p-5 mb-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-chrome-500 mb-2.5">Skills</div>
        {isOwn ? (
          <SkillsEditor userId={userId} skills={data.skills} />
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.skills.length === 0 && <span className="text-sm text-chrome-400">No skills listed.</span>}
            {data.skills.map((s) => (
              <span key={s.id} className="bg-brand-50 text-brand-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {s.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-chrome-0 border border-chrome-200 rounded-xl p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-chrome-500 mb-3">Experience</div>
        <ExperienceList userId={userId} experiences={data.experiences} editable={isOwn} />
      </div>
    </div>
  )
}
