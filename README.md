# Damtjern Hundehotell

Production website for https://damtjern.no.

## Deployment

Netlify deploys automatically from the `main` branch.

- Base directory: empty
- Build command: empty
- Publish directory: `.`

## Important URLs

- `/` – homepage
- `/sitemap.xml` – sitemap for Google Search Console
- `/robots.txt` – crawler rules
- `/takk/` – confirmation page for the contact form

All images and video belong under `/assets/`.

## Skjemafiks v2.2
- Kontaktskjemaet sender til `/takk/index.html`.
- Netlify Forms registreres også via `forms.html`.
- Alle redirect-regler for `/takk` er fjernet for å unngå løkker.
