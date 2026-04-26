# ClipLumia

Prototype de site IA en Next.js pour generer des videos a partir d'un prompt.

## Ce que fait le projet

- interface simple pour demander une video
- barre de progression et messages d'erreur plus clairs
- mode demo si la cle API n'est pas encore configuree
- route API prete pour une integration Minimax

## Lancer le projet

```bash
npm install
npm run dev
```

## Variables d'environnement

Pour la vraie generation video, ajoute cette variable :

```bash
MINIMAX_API_KEY=ta_cle
```

## Deploiement Vercel

Le projet est adapte a Vercel.

Pense aussi a configurer :

- `MINIMAX_API_KEY`
- Vercel Blob pour stocker les videos generees
