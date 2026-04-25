import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export const maxDuration = 300

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt || prompt.length < 6) {
      return NextResponse.json({ error: 'Prompt trop court' }, { status: 400 })
    }

    if (!process.env.MINIMAX_API_KEY) {
      return NextResponse.json({
        mode: 'demo',
        title: 'Prototype genere en mode demo',
        summary:
          'Le parcours fonctionne. Il manque seulement la cle API MINIMAX_API_KEY pour produire une vraie video.',
        prompt,
      })
    }

    const startRes = await fetch('https://api.minimax.io/v1/video_generation', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'video-01',
        prompt: prompt.substring(0, 500),
        duration: 6,
      }),
    })

    const startData = await startRes.json()

    if (!startData.task_id) {
      return NextResponse.json({
        error: 'Erreur Minimax',
        details: startData.base_resp?.status_msg || 'Inconnu',
      }, { status: 400 })
    }

    let attempts = 0

    while (attempts < 40) {
      await new Promise((resolve) => setTimeout(resolve, 6000))

      const checkRes = await fetch(
        `https://api.minimax.io/v1/query/video_generation?task_id=${startData.task_id}`,
        {
          headers: { Authorization: `Bearer ${process.env.MINIMAX_API_KEY}` },
        }
      )

      const checkData = await checkRes.json()

      if (checkData.status === 'Success' && checkData.file_id) {
        const fileRes = await fetch(
          `https://api.minimax.io/v1/files/retrieve?file_id=${checkData.file_id}`,
          {
            headers: { Authorization: `Bearer ${process.env.MINIMAX_API_KEY}` },
          }
        )

        if (!fileRes.ok) {
          return NextResponse.json({ error: 'Telechargement echoue' }, { status: 500 })
        }

        const videoBuffer = await fileRes.blob()
        const filename = `videos/${Date.now()}-${Math.random().toString(36).slice(2)}.mp4`

        const blob = await put(filename, videoBuffer, {
          access: 'public',
          contentType: 'video/mp4',
        })

        return NextResponse.json({
          mode: 'live',
          title: 'Video generee',
          summary: 'La video a ete recuperee puis publiee sur un lien public.',
          prompt,
          url: blob.url,
          taskId: startData.task_id,
        })
      }

      if (checkData.status === 'Fail') {
        return NextResponse.json({
          error: 'Generation echouee',
          reason: checkData.base_resp?.status_msg,
        }, { status: 500 })
      }

      attempts += 1
    }

    return NextResponse.json({
      error: 'Timeout',
      message: 'La generation prend trop de temps. Reessaie.',
    }, { status: 504 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'

    console.error('Erreur API:', error)

    return NextResponse.json({
      error: 'Erreur serveur',
      details: message,
    }, { status: 500 })
  }
}
