'use client'

import { useState } from 'react'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [duration, setDuration] = useState('5')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [taskId, setTaskId] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt || !apiKey) {
      setError('Please provide a prompt and API key')
      return
    }

    setLoading(true)
    setError('')
    setStatus('Creating video generation task...')
    setVideoUrl('')
    setTaskId('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          apiKey,
          duration: parseInt(duration),
          aspectRatio,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create video generation task')
      }

      const newTaskId = data.taskId
      setTaskId(newTaskId)
      setStatus('Video generation in progress...')

      // Poll for completion
      pollStatus(newTaskId, apiKey)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  const pollStatus = async (id: string, key: string) => {
    const maxAttempts = 60
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch('/api/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskId: id, apiKey: key }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to check status')
        }

        if (data.status === 'succeed') {
          setStatus('Video generated successfully!')
          setVideoUrl(data.videoUrl)
          setLoading(false)
        } else if (data.status === 'failed') {
          throw new Error('Video generation failed')
        } else {
          setStatus(`Generating video... (${data.status})`)
          attempts++
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000)
          } else {
            throw new Error('Video generation timed out')
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setLoading(false)
      }
    }

    poll()
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🎬 Kling Video Generator</h1>
        <p>Generate AI-powered videos with text prompts</p>
      </div>

      <div className="main-content">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="apiKey">Kling API Key</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Kling API key"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="prompt">Prompt</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want to generate..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="negativePrompt">Negative Prompt (Optional)</label>
            <textarea
              id="negativePrompt"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Describe what you don't want in the video..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration (seconds)</label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="5">5 seconds</option>
                <option value="10">10 seconds</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="aspectRatio">Aspect Ratio</label>
              <select
                id="aspectRatio"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
              >
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
                <option value="1:1">1:1 (Square)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="button" disabled={loading}>
            {loading ? (
              <>
                <span className="loading"></span> Generating...
              </>
            ) : (
              'Generate Video'
            )}
          </button>
        </form>

        {status && !error && (
          <div className="status success">
            {status}
            {taskId && <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>Task ID: {taskId}</div>}
          </div>
        )}

        {error && (
          <div className="status error">
            ❌ {error}
          </div>
        )}

        {videoUrl && (
          <div className="video-container">
            <h3>Generated Video:</h3>
            <video controls src={videoUrl} style={{ marginTop: '1rem' }}>
              Your browser does not support the video tag.
            </video>
            <div style={{ marginTop: '1rem' }}>
              <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="button" style={{ display: 'inline-block', width: 'auto', padding: '0.5rem 2rem' }}>
                Download Video
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
