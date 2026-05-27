import React, { useState, useRef } from 'react';

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
export function KeywordText({ text, onRoll, label }) {
  if (!text) return null;

  // Split by keywords first, then handle dice within non-keyword parts
  const DICE_REGEX = /(\d*d\d+(?:\s*[+-]\s*\d+)?)/gi;

  const parts = text.split(KEYWORD_REGEX);
  KEYWORD_REGEX.lastIndex = 0;

  return (
    <span>
      {parts.map((part, i) => {
        // Check if this part is a keyword
        const lowerPart = part.toLowerCase();
        if (KEYWORD_GLOSSARY[lowerPart]) {
          return (
            <Tooltip key={i} text={KEYWORD_GLOSSARY[lowerPart]}>
              {part}
            </Tooltip>
          );
        }

        // Check for dice notation
        if (/^\d*d\d+/.test(part) && onRoll) {
          return (
            <button
              key={i}
              className="inline-dice-btn"
              onClick={e => { e.stopPropagation(); onRoll(part, label || part); }}
              title={`Lancia ${part}`}
            >
              🎲 {part}
            </button>
          );
        }

        // Regular text — check for dice within it
        const diceParts = part.split(DICE_REGEX);
        DICE_REGEX.lastIndex = 0;
        if (diceParts.length === 1) return <span key={i}>{part}</span>;

        return (
          <span key={i}>
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
      })}
    </span>
  );
}

export default Tooltip;
