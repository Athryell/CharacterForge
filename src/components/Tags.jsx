import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../config/icons';

// Default tag colors cycling
const TAG_COLORS = [
  { bg: '#EAF3DE', border: '#3B6D11', text: '#27500A' }, // green
  { bg: '#E6F1FB', border: '#185FA5', text: '#0D4080' }, // blue
  { bg: '#FAEEDA', border: '#D4850A', text: '#633806' }, // orange
  { bg: '#F3E8FB', border: '#7B3FA0', text: '#4A1A6E' }, // purple
  { bg: '#FBE8E8', border: '#A32D2D', text: '#6E1A1A' }, // red
  { bg: '#E8F8FB', border: '#0A8A9F', text: '#065F70' }, // teal
  { bg: '#F5F4F0', border: '#888780', text: '#444240' }, // grey
];

function getTagColor(tagName, allTags) {
  const idx = allTags.indexOf(tagName);
  return TAG_COLORS[idx % TAG_COLORS.length] || TAG_COLORS[0];
}

// Single tag pill display
export function TagPill({ tag, allTags, onRemove, small }) {
  const color = getTagColor(tag, allTags);
  return (
    <span
      className={`tag-pill ${small ? 'small' : ''}`}
      style={{ background: color.bg, border: `0.5px solid ${color.border}`, color: color.text }}
    >
      {tag}
      {onRemove && (
        <button
          className="tag-remove"
          onClick={e => { e.stopPropagation(); onRemove(tag); }}
        ><Icon id="action.remove" size={11} /></button>
      )}
    </span>
  );
}

// Tag selector: shows existing tags + input for new ones
export function TagSelector({ selected = [], allTags = [], onChange, onCreateTag }) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = allTags.filter(t =>
    !selected.includes(t) &&
    (input === '' || t.toLowerCase().includes(input.toLowerCase()))
  );

  function addTag(tag) {
    const clean = tag.trim();
    if (!clean || selected.includes(clean)) return;
    if (!allTags.includes(clean)) onCreateTag(clean);
    onChange([...selected, clean]);
    setInput('');
    setShowSuggestions(false);
  }

  function removeTag(tag) {
    onChange(selected.filter(t => t !== tag));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && input.trim()) { addTag(input); e.preventDefault(); }
    if (e.key === 'Escape') { setShowSuggestions(false); setInput(''); }
  }

  return (
    <div className="tag-selector">
      {/* Selected tags */}
      <div className="tag-selected-list">
        {selected.map(tag => (
          <TagPill key={tag} tag={tag} allTags={allTags} onRemove={removeTag} />
        ))}
        {/* Input */}
        <div className="tag-input-wrap">
          <input
            className="tag-input"
            value={input}
            onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder={selected.length === 0 ? t('tags.addPlaceholder') : '+'}
          />
          {showSuggestions && (suggestions.length > 0 || input.trim()) && (
            <div className="tag-suggestions">
              {suggestions.map(tag => (
                <div key={tag} className="tag-suggestion-item" onMouseDown={() => addTag(tag)}>
                  <TagPill tag={tag} allTags={allTags} small />
                </div>
              ))}
              {input.trim() && !allTags.includes(input.trim()) && (
                <div className="tag-suggestion-item new" onMouseDown={() => addTag(input)}>
                  <span style={{ fontSize: 11, color: 'var(--c-muted)' }}>{t('tags.create')}</span>
                  <TagPill tag={input.trim()} allTags={[...allTags, input.trim()]} small />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Filter bar using tags
export function TagFilterBar({ allTags, activeTag, onSelect }) {
  const { t } = useTranslation();
  if (!allTags || allTags.length === 0) return null;
  return (
    <div className="tag-filter-bar">
      <button
        className={`filter-chip ${!activeTag ? 'active' : ''}`}
        onClick={() => onSelect(null)}
      >{t('tags.filterAll')}</button>
      {allTags.map(tag => (
        <button
          key={tag}
          className={`filter-chip ${activeTag === tag ? 'active' : ''}`}
          onClick={() => onSelect(activeTag === tag ? null : tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

export { getTagColor };
