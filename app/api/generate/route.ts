import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { prompt, negativePrompt, apiKey, duration, aspectRatio } = await request.json()

    if (!prompt || !apiKey) {
      return NextResponse.json(
        { error: 'Prompt and API key are required' },
        { status: 400 }
      )
    }

    const response = await fetch('https://api.klingai.com/v1/videos/text2video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'kling-v1',
        prompt,
        negative_prompt: negativePrompt || undefined,
        cfg_scale: 0.5,
        mode: 'std',
        aspect_ratio: aspectRatio,
        duration: duration,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Failed to create video generation task' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      taskId: data.data.task_id,
      status: data.data.task_status,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
