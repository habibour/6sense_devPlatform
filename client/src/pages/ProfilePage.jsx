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
        <div className="flex justify-center text-slate-400">
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
    <PageContainer>
      <div className="flex items-center gap-3.5 mb-4">
        <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
          {data.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="text-lg font-bold text-slate-900">{data.name}</div>
          <div className="font-mono text-xs text-slate-400 mt-0.5">
            joined {new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      {data.bio && <p className="text-sm text-slate-700 leading-relaxed mb-6">{data.bio}</p>}

      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2.5 mt-6">Skills</div>
      {isOwn ? (
        <SkillsEditor userId={userId} skills={data.skills} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {data.skills.length === 0 && <span className="text-sm text-slate-400">No skills listed.</span>}
          {data.skills.map((s) => (
            <span key={s.id} className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {s.name}
            </span>
          ))}
        </div>
      )}

      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3 mt-8">Experience</div>
      <ExperienceList userId={userId} experiences={data.experiences} editable={isOwn} />
    </PageContainer>
  )
}
