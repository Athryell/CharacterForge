# CharacterForge

React PWA — scheda personaggio GDR (D&D 5e SRD 5.2, CC BY 4.0).
Deploy su GitHub Pages: https://Athryell.github.io/CharacterForge

## Stack
- React 18, localStorage per persistenza, nessun backend
- CSS custom (no Tailwind), dark mode automatica

## Struttura
- src/App.jsx — componente principale, widget renderer
- src/layout.js — sistema widget drag & drop
- src/components/ — WidgetGrid, WidgetShell, SpellManager, WeaponManager, InventoryManager, ConditionTracker, Tags, Tooltip, TabBar, CharacterCreator, DiceText
- src/hooks/useCharacter.js — stato personaggio con localStorage
- src/data/ — dnd5e.js, spells.js, conditions.js, weapons.js

## Features implementate
- Scheda D&D 5e SRD completa (caratteristiche, saves, skills, HP, azioni, magie, inventario, note)
- Widget drag & drop con layout a 2 colonne + full-width, spostamento tra tab
- Tab riordinabili e nascondibili in modalità layout
- Browser magie SRD con filtri, tag system, keyword tooltip
- Character creator step-by-step
- Import/Export JSON

## Convenzioni
- Ogni modifica va solo in src/ (non toccare node_modules, package-lock.json)
- CSS in App.css, nuove variabili in :root
- Commit con git add . && git commit -m "..." && git push