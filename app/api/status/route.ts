import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { taskId, apiKey } = await request.json()

    if (!taskId || !apiKey) {
      return NextResponse.json(
        { error: 'Task ID and API key are required' },
        { status: 400 }
      )
    }

    const response = await fetch(`https://api.klingai.com/v1/videos/text2video/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Failed to check task status' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      status: data.data.task_status,
      videoUrl: data.data.task_status === 'succeed' ? data.data.task_result.videos[0].url : undefined,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
