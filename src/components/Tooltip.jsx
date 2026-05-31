import React, { useState, useRef } from 'react';
import { useCharContext } from './CharContext';
import { BONUS_STAT_OPTIONS } from '../data/bonuses';

// Dizionario keyword → spiegazione
export const KEYWORD_GLOSSARY = {
  // Condizioni
  'accecato':      'Non può vedere. Svantaggio ai tiri per colpire, vantaggio per chi lo attacca.',
  'affascinato':   'Non può attaccare la fonte dell\'incantesimo. La fonte ha vantaggio nelle prove sociali.',
  'assordato':     'Non può sentire. Fallisce prove che richiedono l\'udito.',
  'spaventato':    'Svantaggio a prove e tiri per colpire mentre vede la fonte della paura.',
  'afferrato':     'Velocità ridotta a 0. Termina se il grappler è incapacitato.',
  'incapacitato':  'Non può compiere azioni né reazioni.',
  'invisibile':    'Non può essere visto senza magia. Vantaggio ai tiri per colpire, svantaggio per chi lo attacca.',
  'paralizzato':   'Incapacitato. Fallisce TS FOR e DES. I colpi in mischia entro 1,5m sono critici.',
  'pietrificato':  'Trasformato in pietra. Incapacitato, resistenza a tutti i danni.',
  'avvelenato':    'Svantaggio ai tiri per colpire e alle prove di caratteristica.',
  'a terra':       'Può muoversi solo strisciando. Svantaggio ai tiri per colpire. Colpi in mischia: vantaggio, distanza: svantaggio.',
  'trattenuto':    'Velocità 0. Svantaggio ai tiri per colpire e TS DES. Chi attacca ha vantaggio.',
  'stordito':      'Incapacitato, non può muoversi. Fallisce TS FOR e DES. Chi attacca ha vantaggio.',
  'privo di sensi':'Incapacitato. Fallisce TS FOR e DES. I colpi in mischia entro 1,5m sono critici.',
  'nascosto':      'Le creature non sanno dove sei. Tiri attacco contro di te falliscono automaticamente se non ti individuano.',
  // Meccaniche
  'vantaggio':     'Lancia 2d20 e usa il risultato più alto.',
  'svantaggio':    'Lancia 2d20 e usa il risultato più basso.',
  'concentrazione':'Se subisci danni devi superare un TS COS (CD 10 o metà del danno). Fallendo perdi l\'incantesimo.',
  'rituale':       'Puoi lanciare questo incantesimo come rituale (10 minuti in più, senza spendere uno slot).',
  'critico':       'Con un 20 naturale o un attacco critico, lanci i dadi del danno due volte.',
  'copertura':     'Copertura metà: +2 CA e TS DES. Copertura 3/4: +5 CA e TS DES. Copertura totale: non può essere bersaglio.',
  'reazione':      'Azione speciale usabile una volta per round, anche al di fuori del tuo turno.',
  'azione bonus':  'Azione aggiuntiva ottenuta da feature di classe o incantesimi specifici. Una per turno.',
  // Proprietà armi
  'finezza':       'Puoi usare FOR o DES (il più alto) per attacco e danno.',
  'leggera':       'Puoi usare questa arma nel combattimento a due armi.',
  'pesante':       'Le creature di taglia Piccola hanno svantaggio ai tiri per colpire.',
  'versatile':     'Puoi impugnarla con due mani per usare il dado danni indicato tra parentesi.',
  'allungo':       'Aggiunge 1,5m alla tua portata in mischia.',
  'lancio':        'Puoi lanciare questa arma a distanza.',
  'munizioni':     'Richiede munizioni (frecce, dardi, pallini). Recuperi metà delle munizioni dopo il combattimento.',
  'caricamento':   'Puoi effettuare un solo attacco con questa arma per azione/azione bonus/reazione, indipendentemente dagli attacchi extra.',
  'a due mani':    'Richiede due mani per l\'uso.',
  // Altro
  'attacco di opportunità': 'Reazione: quando una creatura visibile esce dalla tua portata senza disimpegnarsi.',
  'disimpegno':    'Il tuo movimento non provoca attacchi di opportunità per il resto del turno.',
  'scatto':        'Ottieni movimento extra pari alla tua velocità per il turno corrente.',
  'schivata':      'Fino al tuo prossimo turno, i tiri per colpire contro di te hanno svantaggio (se vedi l\'aggressore).',
};

// Regex che matcha le keyword (case insensitive, parola intera)
const KEYWORD_REGEX = new RegExp(
  '(' + Object.keys(KEYWORD_GLOSSARY)
    .sort((a, b) => b.length - a.length) // match più lunghi prima
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|') + ')',
  'gi'
);

// Extracts +N@[STAT] bonus notations from text (e.g. "+2@[CA]" → [{stat:'CA', value:2}])
export function parseTextBonuses(text = '') {
  const re = /([+-]\d+)@\[([A-Z-]+)\]/g;
  const results = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    results.push({ stat: m[2].toUpperCase(), value: Number(m[1]) });
  }
  return results;
}

// Resolve [ATTR] and [LVL:...] notations in a text string
export function resolveNotations(text, abilities, charLevel) {
  if (!text) return text;

  // Resolve [ATTR] notation: [FOR], [DES], [COS], [INT], [SAG], [CAR]
  // Negative lookbehind prevents matching [CAR] inside @[CAR] bonus notation
  const resolved1 = text.replace(/(?<!@)\[(FOR|DES|COS|INT|SAG|CAR)\]/gi, (_, attr) => {
    const score = (abilities || {})[attr.toUpperCase()] ?? 10;
    const mod = Math.floor((score - 10) / 2);
    return String(mod);
  });

  // Resolve [LVL:base,threshold:value,...] notation
  // Example: [LVL:1d6,5:1d8,9:1d10,15:1d12]
  const resolved2 = resolved1.replace(/\[LVL:([^\]]+)\]/gi, (_, spec) => {
    const parts = spec.split(',');
    let result = parts[0].trim();
    for (let i = 1; i < parts.length; i++) {
      const colonIdx = parts[i].indexOf(':');
      if (colonIdx === -1) continue;
      const threshold = parseInt(parts[i].substring(0, colonIdx).trim());
      const value = parts[i].substring(colonIdx + 1).trim();
      if ((charLevel || 1) >= threshold) result = value;
    }
    return result;
  });

  // Normalize double signs that appear when modifier is negative (e.g. 1d8+-1 → 1d8-1)
  return resolved2.replace(/\+-/g, '-').replace(/--/g, '+');
}

// Small hint bar for description textareas — shows notation syntax
export function NotationHelpBar() {
  return (
    <div className="notation-help-bar">
      <span className="notation-help-icon">💡</span>
      <span><strong>[FOR]</strong> <strong>[DES]</strong>… → mod caratteristica</span>
      <span className="notation-help-sep">·</span>
      <span><strong>[LVL:1d6,5:1d8]</strong> → scala col livello</span>
      <span className="notation-help-sep">·</span>
      <span><strong>+1@[CA]</strong> → bonus equipaggiamento (digita @ per lista)</span>
    </div>
  );
}

// Tooltip component
function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef();

  function handleMouseEnter(e) {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setPos({ x: rect.left, y: rect.bottom + 6 });
    setVisible(true);
  }

  return (
    <>
      <span
        ref={ref}
        className="keyword-term"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setVisible(false)}
        onTouchStart={handleMouseEnter}
        onTouchEnd={() => setTimeout(() => setVisible(false), 2000)}
      >
        {children}
      </span>
      {visible && (
        <div
          className="keyword-tooltip"
          style={{ position: 'fixed', left: Math.min(pos.x, window.innerWidth - 260), top: pos.y, zIndex: 9999 }}
        >
          <strong>{children}</strong>
          <div>{text}</div>
        </div>
      )}
    </>
  );
}

// Renders text with keyword tooltips applied automatically
// Supports [ATTR], [LVL:...], and +N@[STAT] notations resolved from CharContext
const DYNAMIC_NOTATION_RE = /\[(FOR|DES|COS|INT|SAG|CAR)\]|\[LVL:|[+-]\d+@\[[A-Z-]+\]/i;
const BONUS_NOTATION_SPLIT = /([+-]\d+@\[[A-Z-]+\])/gi;
const BONUS_NOTATION_PARSE = /^([+-]\d+)@\[([A-Z-]+)\]$/i;

export function KeywordText({ text, onRoll, label }) {
  const { abilities, charLevel } = useCharContext();
  const hasDynamic = DYNAMIC_NOTATION_RE.test(text || '');
  const resolved = resolveNotations(text, abilities, charLevel);
  if (!resolved) return null;

  const DICE_REGEX = /(\d*d\d+(?:\s*[+-]\s*\d+)?)/gi;

  function renderSegments(lineText, keyPrefix) {
    const bonusSegments = lineText.split(BONUS_NOTATION_SPLIT);
    BONUS_NOTATION_SPLIT.lastIndex = 0;
    return bonusSegments.map((seg, si) => {
      const bonusMatch = seg.match(BONUS_NOTATION_PARSE);
      if (bonusMatch) {
        const value = Number(bonusMatch[1]);
        const stat = bonusMatch[2].toUpperCase();
        const statLabel = BONUS_STAT_OPTIONS.find(o => o.value === stat)?.label || stat;
        return (
          <span key={`${keyPrefix}-b${si}`} className="bonus-inline-badge">
            {statLabel} {value >= 0 ? '+' : ''}{value}
          </span>
        );
      }

      const parts = seg.split(KEYWORD_REGEX);
      KEYWORD_REGEX.lastIndex = 0;
      return parts.map((part, i) => {
        const lowerPart = part.toLowerCase();
        if (KEYWORD_GLOSSARY[lowerPart]) {
          return (
            <Tooltip key={`${keyPrefix}-${si}-${i}`} text={KEYWORD_GLOSSARY[lowerPart]}>
              {part}
            </Tooltip>
          );
        }

        if (/^\d*d\d+/.test(part) && onRoll) {
          return (
            <button
              key={`${keyPrefix}-${si}-${i}`}
              className="inline-dice-btn"
              onClick={e => { e.stopPropagation(); onRoll(part, label || part); }}
              title={`Lancia ${part}`}
            >
              🎲 {part}
            </button>
          );
        }

        const diceParts = part.split(DICE_REGEX);
        DICE_REGEX.lastIndex = 0;
        if (diceParts.length === 1) return <span key={`${keyPrefix}-${si}-${i}`}>{part}</span>;

        return (
          <span key={`${keyPrefix}-${si}-${i}`}>
            {diceParts.map((dp, j) => {
              if (/^\d*d\d+/.test(dp) && onRoll) {
                return (
                  <button
                    key={j}
                    className="inline-dice-btn"
                    onClick={e => { e.stopPropagation(); onRoll(dp, label || dp); }}
                  >
                    🎲 {dp}
                  </button>
                );
              }
              return <span key={j}>{dp}</span>;
            })}
          </span>
        );
      });
    });
  }

  const lines = resolved.split('\n');

  return (
    <span>
      {hasDynamic && (
        <span className="notation-dynamic-badge" title={`Valore dinamico — originale: ${text}`}>≈ </span>
      )}
      {lines.map((line, lineIdx) => (
        <React.Fragment key={lineIdx}>
          {lineIdx > 0 && <br />}
          {renderSegments(line, lineIdx)}
        </React.Fragment>
      ))}
    </span>
  );
}

export default Tooltip;
