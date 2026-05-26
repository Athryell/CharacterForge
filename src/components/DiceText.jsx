import React from 'react';

// Matches: 1d20, 2d6+3, 1d8-1, d4, 3d10 + 5, ecc.
const DICE_REGEX = /(\d*d\d+(?:\s*[+-]\s*\d+)?)/gi;

function rollNotation(notation) {
  const clean = notation.replace(/\s/g, '');
  const m = clean.match(/^(\d*)d(\d+)([+-]\d+)?$/i);
  if (!m) return null;
  const count = parseInt(m[1]) || 1;
  const sides = parseInt(m[2]);
  const bonus = parseInt(m[3]) || 0;
  let total = 0;
  const rolls = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * sides) + 1;
    rolls.push(r);
    total += r;
  }
  total += bonus;
  return { total, rolls, bonus, notation: clean };
}

// Renders text with inline clickable dice buttons
export function DiceText({ text, onRoll, label }) {
  if (!text) return null;
  const parts = text.split(DICE_REGEX);
  return (
    <span>
      {parts.map((part, i) => {
        if (DICE_REGEX.test(part)) {
          DICE_REGEX.lastIndex = 0; // reset stateful regex
          return (
            <button
              key={i}
              className="inline-dice-btn"
              onClick={e => {
                e.stopPropagation();
                const result = rollNotation(part);
                if (result && onRoll) {
                  onRoll(part, label || part);
                }
              }}
              title={`Clicca per lanciare ${part}`}
            >
              🎲 {part}
            </button>
          );
        }
        DICE_REGEX.lastIndex = 0;
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

// Hook to extract and roll dice from any string
export function useDiceRoller(onRoll) {
  function rollFromText(text, label) {
    const matches = text.match(DICE_REGEX);
    if (matches && matches.length > 0) {
      onRoll(matches[0], label || text);
    }
  }
  return rollFromText;
}

export default DiceText;
