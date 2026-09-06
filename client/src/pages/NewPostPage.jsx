import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '../components/layout/PageContainer'
import { PostForm } from '../components/posts/PostForm'
import { useCreatePost } from '../hooks/usePosts'

export default function NewPostPage() {
  const navigate = useNavigate()
  const createPost = useCreatePost()
  const [error, setError] = useState(null)

  const handleSubmit = async ({ title, body }) => {
    setError(null)
    try {
      // mutateAsync (not mutate) so the id from the API response is available
      // synchronously here to build the redirect URL.
      const post = await createPost.mutateAsync({ title, body })
      navigate(`/posts/${post.id}`)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <PageContainer>
      <h1 className="text-lg font-semibold text-chrome-900 mb-4">New post</h1>
      <PostForm onSubmit={handleSubmit} submitting={createPost.isPending} error={error} />
    </PageContainer>
  )
}
