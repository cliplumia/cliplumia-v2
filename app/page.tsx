'use client'

import { FormEvent, useEffect, useState } from 'react'

type GenerationResult = {
  mode: 'demo' | 'live'
  title: string
  summary: string
  prompt: string
  url?: string
  taskId?: string
}

const suggestions = [
  "Une pub elegante pour une marque de parfum, lumiere doree, rendu cinema",
  'Un coach IA qui presente une nouvelle application pour petites entreprises',
  'Une video produit moderne pour un casque audio, fond studio et mouvements fluides',
]

const features = [
  {
    title: 'Simple pour tous',
    text: 'Une seule zone de saisie, un bouton clair, et un resultat comprehensible meme si tu debutes.',
  },
  {
    title: 'Pense pour vendre',
    text: 'La page met en avant les cas utiles: pub, presentation produit, reseau social, demonstration.',
  },
  {
    title: 'Pret pour evoluer',
    text: "Le design est propre maintenant, et on pourra ajouter image, voix, ou abonnements ensuite.",
  },
]

export default function Page() {
  const [prompt, setPrompt] = useState(suggestions[0])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [result, setResult] = useState<GenerationResult | null>(null)

  useEffect(() => {
    if (!loading) {
      setProgress(0)
      return
    }

    const interval = window.setInterval(() => {
      setProgress((value) => (value >= 92 ? value : value + 4))
    }, 500)

    return () => window.clearInterval(interval)
  }, [loading])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (prompt.trim().length < 6) {
      setError('Ecris une demande un peu plus precise pour generer un meilleur resultat.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'La generation a echoue.')
        return
      }

      setProgress(100)
      setResult({
        mode: data.mode ?? 'live',
        title: data.title ?? 'Resultat pret',
        summary: data.summary ?? 'La generation est terminee.',
        prompt: data.prompt ?? prompt,
        url: data.url,
        taskId: data.taskId,
      })
    } catch {
      setError("Le site n'arrive pas a joindre le serveur local.")
    } finally {
      window.setTimeout(() => setLoading(false), 350)
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">ClipLumia</span>
          <h1>Ton site IA devient enfin clair, propre et utilisable.</h1>
          <p className="hero-text">
            Cette version transforme ton idee en une interface plus serieuse pour des gens normaux,
            avec un mode demo qui marche meme avant la connexion d&apos;une vraie API video.
          </p>

          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature" key={feature.title}>
                <h2>{feature.title}</h2>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="studio-panel">
          <div className="panel-top">
            <div>
              <span className="section-label">Studio IA</span>
              <h2>Generateur de video</h2>
            </div>
            <span className="status-chip">{loading ? 'En cours' : 'Pret'}</span>
          </div>

          <form className="generator-form" onSubmit={handleSubmit}>
            <label htmlFor="prompt">Decris ce que la personne doit voir dans la video</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Exemple: une presentation elegante d'une app IA pour artisans, ambiance premium, camera lente, sous-titres modernes"
              disabled={loading}
            />

            <div className="suggestions">
              {suggestions.map((item) => (
                <button
                  className="suggestion-chip"
                  key={item}
                  onClick={() => setPrompt(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>

            <button className="primary-button" disabled={loading} type="submit">
              {loading ? `Generation ${progress}%` : 'Lancer une generation'}
            </button>
          </form>

          <div className="progress-block">
            <div className="progress-meta">
              <span>Progression</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {error ? <p className="message error">{error}</p> : null}

          {result ? (
            <section className="result-card">
              <div className="result-header">
                <div>
                  <span className="section-label">
                    {result.mode === 'demo' ? 'Mode demo' : 'Mode connecte'}
                  </span>
                  <h3>{result.title}</h3>
                </div>
                <span className="status-chip alt">{result.mode === 'demo' ? 'Essai' : 'API'}</span>
              </div>

              <p>{result.summary}</p>

              <div className="result-preview">
                <div>
                  <span className="preview-label">Prompt utilise</span>
                  <strong>{result.prompt}</strong>
                </div>
                <div>
                  <span className="preview-label">Sortie</span>
                  <strong>
                    {result.url ? 'Video disponible' : 'Prototype pret pour brancher une API reelle'}
                  </strong>
                </div>
              </div>

              {result.url ? (
                <video className="video-player" controls src={result.url} />
              ) : (
                <div className="demo-placeholder">
                  <span>Previsualisation du concept</span>
                  <strong>Branche une cle API pour produire une vraie video telechargeable.</strong>
                </div>
              )}
            </section>
          ) : (
            <section className="result-card empty">
              <span className="section-label">Resultat</span>
              <h3>Le premier rendu apparaitra ici</h3>
              <p>
                Pour l&apos;instant, la page sert de base solide: interface propre, texte lisible, et
                gestion d&apos;erreur plus claire.
              </p>
            </section>
          )}
        </div>
      </section>
    </main>
  )
}
