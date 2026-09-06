import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PostForm } from '../components/posts/PostForm'
import { useCreatePost } from '../hooks/usePosts'

export default function NewPostPage() {
  const navigate = useNavigate()
  const createPost = useCreatePost()
  const [error, setError] = useState(null)

  const handleSubmit = async ({ title, body }) => {
    setError(null)
    try {
      const post = await createPost.mutateAsync({ title, body })
      navigate(`/posts/${post.id}`)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-lg font-semibold text-slate-900 mb-4">New post</h1>
      <PostForm onSubmit={handleSubmit} submitting={createPost.isPending} error={error} />
    </div>
  )
}
