import React, { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCharContext } from './CharContext';
import { BONUS_STAT_OPTIONS } from '../data/bonuses';

// Hook: returns the keyword glossary for the active language.
// Keys and values are both in the active language (EN: "blinded"→EN desc, IT: "accecato"→IT desc).
export function useKeywordGlossary() {
  const { t } = useTranslation('game');
  const glossary = t('glossary', { returnObjects: true });
  return (glossary && typeof glossary === 'object') ? glossary : {};
}

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

// IT→EN ability abbreviation map for backward-compat notation resolution
const IT_TO_EN_ABBR = { FOR:'STR', DES:'DEX', COS:'CON', SAG:'WIS', CAR:'CHA', INT:'INT' };

// Resolve a [countX] formula to a numeric pip count
function resolveCountFormula(formula, abilities, charLevel, profBonus) {
  if (/^\d+$/.test(formula)) return parseInt(formula);
  if (formula === 'PRO') return profBonus ?? 2;
  if (formula === 'LVL') return charLevel ?? 1;
  if (formula === 'LVL/2') return Math.max(1, Math.floor((charLevel ?? 1) / 2));
  const lvlMultMatch = formula.match(/^LVL\*(\d+)$/);
  if (lvlMultMatch) return (charLevel ?? 1) * parseInt(lvlMultMatch[1]);
  const score = (abilities || {})[formula.toUpperCase()] ?? 10;
  return Math.max(1, Math.floor((score - 10) / 2));
}

const COUNT_NOTATION_RE = /\[count(CHA|STR|DEX|CON|INT|WIS|PRO|LVL\/2|LVL\*\d+|LVL|\d+)\]/gi;

// Resolve [ATTR], [PRO], and [LVL:...] notations in a text string
// Supports D&D ([STR],[FOR],...) and DH ([AGI],[FIN],...) traits via optional traitMap.
// traitMap: { AGI: mod, FIN: mod, ... } — DH modifiers already resolved, no score conversion needed.
export function resolveNotations(text, abilities, charLevel, profBonus, traitMap = null) {
  if (!text) return text;

  // [countX] → [N] static counter with dynamically computed size
  const resolved0 = text.replace(COUNT_NOTATION_RE, (_, formula) => {
    const n = resolveCountFormula(formula, abilities, charLevel, profBonus);
    return `[${n}]`;
  });

  const resolved1 = resolved0.replace(/(?<!@)\[(STR|DEX|CON|INT|WIS|CHA|FOR|DES|COS|SAG|CAR|PRO|AGI|FIN|INS|PRE|KNO)\]/gi, (_, attr) => {
    if (attr.toUpperCase() === 'PRO') return String(profBonus ?? 2);
    const upper = attr.toUpperCase();
    if (traitMap && upper in traitMap) return String(traitMap[upper] ?? 0);
    const key = IT_TO_EN_ABBR[upper] || upper;
    const score = (abilities || {})[key] ?? 10;
    const mod = Math.floor((score - 10) / 2);
    return String(mod);
  });

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

  return resolved2.replace(/\+-/g, '-').replace(/--/g, '+');
}

// Small hint bar for description textareas — shows notation syntax
export function NotationHelpBar() {
  const { t } = useTranslation();
  const { systemId } = useCharContext();
  const isDH = systemId === 'daggerheart';
  return (
    <div className="notation-help-bar">
      <span className="notation-help-icon">💡</span>
      <span>{t('notation.slashHint')}</span>
      <span className="notation-help-sep">·</span>
      {isDH ? (
        <>
          <span><strong>[AGI]</strong> <strong>[FIN]</strong>… {t('notation.attrHelp')}</span>
          <span className="notation-help-sep">·</span>
        </>
      ) : (
        <>
          <span><strong>[STR]</strong> <strong>[DEX]</strong>… <strong>[PRO]</strong> {t('notation.attrHelp')}</span>
          <span className="notation-help-sep">·</span>
          <span><strong>[LVL:1d6,5:1d8]</strong> {t('notation.lvlHelp')}</span>
          <span className="notation-help-sep">·</span>
          <span><strong>+1@[AC]</strong> {t('notation.bonusHelp')}</span>
          <span className="notation-help-sep">·</span>
        </>
      )}
      <span><strong>[3]</strong> {t('notation.counterHelp')}</span>
      {!isDH && (
        <>
          <span className="notation-help-sep">·</span>
          <span><strong>[countCHA]</strong> {t('notation.countHelp')}</span>
        </>
      )}
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
const DYNAMIC_NOTATION_RE = /\[(STR|DEX|CON|INT|WIS|CHA|FOR|DES|COS|SAG|CAR|PRO|AGI|FIN|INS|PRE|KNO)\]|\[LVL:|[+-]\d+@\[[A-Z-]+\]|\[count/i;
const BONUS_NOTATION_SPLIT = /([+-]\d+@\[[A-Z-]+\])/gi;
const BONUS_NOTATION_PARSE = /^([+-]\d+)@\[([A-Z-]+)\]$/i;
const COUNTER_NOTATION_SPLIT = /(\[\d+\])/g;
const COUNTER_NOTATION_PARSE = /^\[(\d+)\]$/;

export function KeywordText({ text, onRoll, label, counters, onCounterChange }) {
  const { t: tUi } = useTranslation();
  const { abilities, traitValues, charLevel, profBonus, systemId } = useCharContext();
  const glossary = useKeywordGlossary();

  const traitMap = systemId === 'daggerheart'
    ? { AGI: traitValues?.AGI, STR: traitValues?.STR, FIN: traitValues?.FIN,
        INS: traitValues?.INS, PRE: traitValues?.PRE, KNO: traitValues?.KNO }
    : null;

  const keywordRegex = useMemo(() => {
    const keys = Object.keys(glossary);
    if (!keys.length) return null;
    return new RegExp(
      '(' + keys
        .sort((a, b) => b.length - a.length)
        .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|') + ')',
      'gi'
    );
  }, [glossary]);

  const hasDynamic = DYNAMIC_NOTATION_RE.test(text || '');
  const resolved = resolveNotations(text, abilities, charLevel, profBonus, traitMap);
  if (!resolved) return null;

  const DICE_REGEX = /(\d*d\d+(?:\s*[+-]\s*\d+)*)/gi;
  let counterIdx = 0;

  function renderSegments(lineText, keyPrefix) {
    const counterParts = lineText.split(COUNTER_NOTATION_SPLIT);
    COUNTER_NOTATION_SPLIT.lastIndex = 0;
    return counterParts.map((cSeg, cSi) => {
      const counterMatch = cSeg.match(COUNTER_NOTATION_PARSE);
      if (counterMatch) {
        const n = parseInt(counterMatch[1]);
        const idx = counterIdx++;
        const existing = counters?.[idx];
        const values = !existing
          ? Array(n).fill(true)
          : Array.from({ length: n }, (_, i) => (i < existing.length ? existing[i] : true));
        return (
          <span key={`${keyPrefix}-cnt${cSi}`} className="counter-group">
            {values.map((on, pipIdx) => (
              <span
                key={pipIdx}
                className={`counter-pip ${on ? 'on' : ''}`}
                onClick={e => {
                  e.stopPropagation();
                  if (!onCounterChange) return;
                  onCounterChange(idx, values.map((v, j) => j === pipIdx ? !v : v));
                }}
              />
            ))}
          </span>
        );
      }

      const bonusSegments = cSeg.split(BONUS_NOTATION_SPLIT);
      BONUS_NOTATION_SPLIT.lastIndex = 0;
      return bonusSegments.map((seg, si) => {
        const bonusMatch = seg.match(BONUS_NOTATION_PARSE);
        if (bonusMatch) {
          const value = Number(bonusMatch[1]);
          const stat = bonusMatch[2].toUpperCase();
          const statLabel = BONUS_STAT_OPTIONS.find(o => o.value === stat)?.label || stat;
          return (
            <span key={`${keyPrefix}-${cSi}-b${si}`} className="bonus-inline-badge">
              {statLabel} {value >= 0 ? '+' : ''}{value}
            </span>
          );
        }

        if (!keywordRegex) return <span key={`${keyPrefix}-${cSi}-${si}-0`}>{seg}</span>;
        const parts = seg.split(keywordRegex);
        keywordRegex.lastIndex = 0;
        return parts.map((part, i) => {
          const lowerPart = part.toLowerCase();
          if (glossary[lowerPart] !== undefined) {
            return (
              <Tooltip key={`${keyPrefix}-${cSi}-${si}-${i}`} text={glossary[lowerPart]}>
                {part}
              </Tooltip>
            );
          }

          if (/^\d*d\d+/.test(part) && onRoll) {
            return (
              <button
                key={`${keyPrefix}-${cSi}-${si}-${i}`}
                className="inline-dice-btn"
                onClick={e => { e.stopPropagation(); onRoll(part, label || part); }}
                title={`${tUi('notation.rollTitle')} ${part}`}
              >
                🎲 {part}
              </button>
            );
          }

          const diceParts = part.split(DICE_REGEX);
          DICE_REGEX.lastIndex = 0;
          if (diceParts.length === 1) return <span key={`${keyPrefix}-${cSi}-${si}-${i}`}>{part}</span>;

          return (
            <span key={`${keyPrefix}-${cSi}-${si}-${i}`}>
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
    });
  }

  const lines = resolved.split('\n');

  return (
    <span>
      {hasDynamic && (
        <span className="notation-dynamic-badge" title={`${tUi('notation.dynamicTitle')} ${text}`}>≈ </span>
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
