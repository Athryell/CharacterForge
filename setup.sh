#!/bin/bash
# setup.sh — Inizializza CharacterForge e pubblica su GitHub
# Uso: bash setup.sh <tuo-username-github>

set -e

USERNAME=$1
REPO="characterforge"

if [ -z "$USERNAME" ]; then
  echo "❌ Uso: bash setup.sh <tuo-username-github>"
  exit 1
fi

echo "⚔  CharacterForge — Setup"
echo "──────────────────────────"

# 1. Aggiorna homepage in package.json
echo "→ Aggiorno homepage in package.json..."
sed -i "s|<TUO-USERNAME>|$USERNAME|g" package.json
sed -i "s|<TUO-USERNAME>|$USERNAME|g" README.md

# 2. Installa dipendenze
echo "→ Installo dipendenze..."
npm install

# 3. Init git
echo "→ Inizializzo repository git..."
git init
git add .
git commit -m "feat: initial CharacterForge setup"
git branch -M main

# 4. Istruzioni GitHub
echo ""
echo "✅ Setup locale completato!"
echo ""
echo "Prossimi passi:"
echo "  1. Crea il repo su GitHub: https://github.com/new"
echo "     Nome repo: $REPO"
echo "     Visibilità: Public (necessario per GitHub Pages gratuito)"
echo ""
echo "  2. Collega e pusha:"
echo "     git remote add origin https://github.com/$USERNAME/$REPO.git"
echo "     git push -u origin main"
echo ""
echo "  3. Attiva GitHub Pages:"
echo "     → Vai su Settings → Pages"
echo "     → Source: GitHub Actions"
echo ""
echo "  4. Il deploy parte automaticamente ad ogni push su main."
echo "     URL finale: https://$USERNAME.github.io/$REPO"
echo ""
echo "  5. Per rilascio su itch.io:"
echo "     npm run build"
echo "     → Comprimi la cartella build/ e caricala su itch.io come HTML game"
