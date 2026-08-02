import React, { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCharContext } from './CharContext';
import { BONUS_STAT_OPTIONS } from '../data/bonuses';

// Hook: returns the keyword glossary for the active language.
export function useKeywordGlossary() {
  const { t } = useTranslation('game');
  const glossary = t('glossary', { returnObjects: true });
  return (glossary && typeof glossary === 'object') ? glossary : {};
}

// Extracts +N@[STAT] bonus notations from text (called AFTER resolveNotations)
export function parseTextBonuses(text = '') {
  const re = /([+-]\d+)@\[([A-Z0-9-]+)\]/g;
  const results = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    results.push({ stat: m[2].toUpperCase(), value: Number(m[1]) });
  }
  return results;
}

// Resolve a [countX] formula to a numeric pip count
function resolveCountFormula(formula, abilities, charLevel, profBonus) {
  if (/^\d+$/.test(formula)) return parseInt(formula);
  if (formula === 'PRO') return profBonus ?? 2;
  if (formula === 'LVL') return charLevel ?? 1;
  if (formula === 'LVL/2') return Math.max(1, Math.floor((charLevel ?? 1) / 2));
  const lvlMultMatch = formula.match(/^LVL\*(\d+)$/);
  if (lvlMultMatch) return (charLevel ?? 1) * parseInt(lvlMultMatch[1]);
  // Ability modifier — with IT→EN map
  const IT_TO_EN = { FOR: 'STR', DES: 'DEX', COS: 'CON', SAG: 'WIS', CAR: 'CHA' };
  const key = IT_TO_EN[formula.toUpperCase()] || formula.toUpperCase();
  const score = (abilities || {})[key] ?? 10;
  return Math.max(1, Math.floor((score - 10) / 2));
}

const COUNT_NOTATION_RE = /\[count(CHA|STR|DEX|CON|INT|WIS|PRO|LVL\/2|LVL\*\d+|LVL|\d+)\]/gi;

// Resolve [ATTR], [PRO], [LVL], [LVL/2], [LVL=N:...] and +[PRO]@[STAT] notations.
// Supports D&D ([STR],[FOR],...) and DH ([AGI],[FIN],...) traits via optional traitMap.
export function resolveNotations(text, abilities, charLevel, profBonus, traitMap = null, customFields = null) {
  if (!text) return text;

  // Helper: resolve a bracketed value token
  function resolveValue(token) {
    const upper = token.toUpperCase();
    if (upper === 'PRO') return String(profBonus ?? 2);
    if (upper === 'LVL') return String(charLevel ?? 1);
    if (upper === 'LVL/2') return String(Math.max(1, Math.floor((charLevel ?? 1) / 2)));
    if (traitMap && upper in traitMap) return String(traitMap[upper] ?? 0);
    const IT_TO_EN = { FOR: 'STR', DES: 'DEX', COS: 'CON', SAG: 'WIS', CAR: 'CHA', INT: 'INT' };
    const key = IT_TO_EN[upper] || upper;
    if (['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].includes(key)) {
      const score = (abilities || {})[key] ?? 10;
      return String(Math.floor((score - 10) / 2));
    }
    return token;
  }

  // 0. [countX] → [N]
  let result = text.replace(COUNT_NOTATION_RE, (_, formula) => {
    const n = resolveCountFormula(formula, abilities, charLevel, profBonus);
    return `[${n}]`;
  });

  // 1. [STR], [PRO], [LVL], [LVL/2], trait modifiers
  result = result.replace(
    /(?<!@)\[(STR|DEX|CON|INT|WIS|CHA|FOR|DES|COS|SAG|CAR|PRO|LVL\/2|LVL|AGI|FIN|INS|PRE|KNO)\]/gi,
    (_, token) => resolveValue(token)
  );

  // 2. [LVL=N:val,N:val,...] — scaling with level; below first threshold → empty string
  result = result.replace(/\[LVL=(\d+):([^\]]+)\]/gi, (_, startStr, spec) => {
    const level = charLevel ?? 1;
    const parts = spec.split(',');
    const thresholds = [{ level: parseInt(startStr), value: parts[0].trim() }];
    for (let i = 1; i < parts.length; i++) {
      const colonIdx = parts[i].indexOf(':');
      if (colonIdx === -1) continue;
      thresholds.push({
        level: parseInt(parts[i].substring(0, colonIdx).trim()),
        value: parts[i].substring(colonIdx + 1).trim(),
      });
    }
    let resolved = '';
    for (const t of thresholds) {
      if (level >= t.level) resolved = t.value;
    }
    return resolved;
  });

  // 3. Dynamic bonuses — +[PRO]@[AC], +[STR]@[ATK], +[LVL/2]@[AC] → numeric
  result = result.replace(
    /([+-])\[(PRO|LVL\/2|LVL|STR|DEX|CON|INT|WIS|CHA|AGI|FIN|INS|PRE|KNO)\]@\[([A-Z0-9-]+)\]/gi,
    (_, sign, valueToken, stat) => {
      const val = parseInt(resolveValue(valueToken));
      const signed = sign === '+' ? val : -val;
      return `${signed >= 0 ? '+' : ''}${signed}@[${stat.toUpperCase()}]`;
    }
  );

  // 4. Cleanup double signs
  result = result.replace(/\+-/g, '-').replace(/--/g, '+');

  // 5. Custom fields — [FIELDID], [FIELDID.current], [FIELDID.max]
  if (customFields) {
    result = result.replace(/\[([A-Z][A-Z0-9_]*)(?:\.(max|current))?\]/gi, (match, id, prop) => {
      const field = customFields[id.toUpperCase()];
      if (field === undefined) return match;
      if (prop === 'max')     return typeof field === 'object' ? String(field.max     ?? 0) : match;
      if (prop === 'current') return typeof field === 'object' ? String(field.current ?? 0) : match;
      return typeof field === 'object' ? String(field.current ?? 0) : String(field);
    });
  }

  return result;
}

// Small hint bar shown below description textareas
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
        <span><strong>[AGI]</strong> <strong>[FIN]</strong>… {t('notation.attrHelp')}</span>
      ) : (
        <>
          <span><strong>[STR]</strong>… <strong>[PRO]</strong> <strong>[LVL]</strong> {t('notation.attrHelp')}</span>
          <span className="notation-help-sep">·</span>
          <span><strong>[LVL=1:1d6,5:1d8]</strong> {t('notation.lvlHelp')}</span>
          <span className="notation-help-sep">·</span>
          <span><strong>+[PRO]@[AC]</strong> {t('notation.bonusHelp')}</span>
          <span className="notation-help-sep">·</span>
        </>
      )}
      <span><strong>[count3]</strong> <strong>[countCHA]</strong> {t('notation.counterHelp')}</span>
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

// Renders text with keyword tooltips, dice buttons, bonus badges, and counter pips.
// Dynamic notations ([STR], [LVL=...], +[PRO]@[AC]) are resolved before rendering.
const DYNAMIC_NOTATION_RE = /\[(STR|DEX|CON|INT|WIS|CHA|FOR|DES|COS|SAG|CAR|PRO|LVL\/2|LVL|AGI|FIN|INS|PRE|KNO)\]|\[LVL=|[+-](?:\d+|\[[A-Z/]+\])@\[[A-Z0-9-]+\]|\[count/i;
const BONUS_NOTATION_SPLIT = /([+-]\d+@\[[A-Z0-9-]+\])/gi;
const BONUS_NOTATION_PARSE = /^([+-]\d+)@\[([A-Z0-9-]+)\]$/i;
const COUNTER_NOTATION_SPLIT = /(\[\d+\])/g;
const COUNTER_NOTATION_PARSE = /^\[(\d+)\]$/;

export function KeywordText({ text, onRoll, label, counters, onCounterChange }) {
  const { t: tUi } = useTranslation();
  const { abilities, traitValues, charLevel, profBonus, systemId, customFields } = useCharContext();
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
  const resolved = resolveNotations(text, abilities, charLevel, profBonus, traitMap, customFields || null);
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
