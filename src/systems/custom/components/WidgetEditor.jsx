import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Icon } from '../../../config/icons';
import { CUSTOM_WIDGET_TYPES } from '../data/mechanics';
import NotationTextarea from '../../../components/NotationTextarea';

const TYPES_REQUIRING_LABEL = new Set(['bar', 'counter', 'text', 'list', 'toggle-list', 'table']);
const NO_CONFIG_TYPES = new Set(['identity', 'stat-grid', 'inventory', 'notes', 'log']);
const NOTATION_TYPES = new Set(['formula', 'roll-button']);

const COLOR_OPTIONS = [
  { value: '--c-accent',   labelKey: 'customWidgets.colorAccent' },
  { value: '--c-bar-red',  labelKey: 'customWidgets.colorRed'    },
  { value: '--c-bar-blue', labelKey: 'customWidgets.colorBlue'   },
  { value: '--c-success',  labelKey: 'customWidgets.colorGreen'  },
];

const BAR_ICONS = ['heart', 'shield', 'zap', 'star', 'flame', 'droplets'];
const ITEM_FIELD_OPTIONS = ['name', 'desc', 'value', 'notes'];

export default function WidgetEditor({ onAdd, onClose, initialType = null, initialConfig = null }) {
  const { t } = useTranslation();
  const isEdit = initialType !== null;
  const types = Object.keys(CUSTOM_WIDGET_TYPES);

  const [selectedType, setSelectedType] = useState(initialType || types[0]);
  const [label, setLabel]           = useState(initialConfig?.label     ?? '');
  const [fieldId, setFieldId]       = useState(initialConfig?.fieldId   ?? '');
  const [color, setColor]           = useState(initialConfig?.color     ?? '--c-accent');
  const [barIcon, setBarIcon]       = useState(initialConfig?.icon      ?? 'heart');
  const [counterMax, setCounterMax] = useState(initialConfig?.max       ?? 5);
  const [multiline, setMultiline]   = useState(initialConfig?.multiline ?? false);
  const [itemFields, setItemFields] = useState(initialConfig?.itemFields ?? ['name', 'desc']);
  const [notation, setNotation]     = useState(initialConfig?.notation ?? '');
  const [columns, setColumns]       = useState(initialConfig?.columns ?? CUSTOM_WIDGET_TYPES.table.defaultConfig.columns);

  const needsLabel    = TYPES_REQUIRING_LABEL.has(selectedType);
  const needsNotation = NOTATION_TYPES.has(selectedType);
  const canAdd = (!needsLabel || label.trim().length > 0)
    && (!needsNotation || notation.trim().length > 0);

  function handleAdd() {
    if (!canAdd) return;
    const defaults = CUSTOM_WIDGET_TYPES[selectedType]?.defaultConfig ?? {};
    let config = { ...defaults };
    if (selectedType === 'bar') {
      config = { ...config, label: label.trim(), fieldId: fieldId.trim(), color, icon: barIcon };
    } else if (selectedType === 'counter') {
      config = { ...config, label: label.trim(), fieldId: fieldId.trim(), max: Math.max(1, Math.min(20, Number(counterMax) || 5)) };
    } else if (selectedType === 'text') {
      config = { ...config, label: label.trim(), fieldId: fieldId.trim(), multiline };
    } else if (selectedType === 'list') {
      config = { ...config, label: label.trim(), itemFields: itemFields.length ? itemFields : ['name'] };
    } else if (selectedType === 'toggle-list') {
      config = { ...config, label: label.trim(), fieldId: fieldId.trim() };
    } else if (selectedType === 'table') {
      const validColumns = columns.filter(c => c.label.trim()).map(c => ({ ...c, label: c.label.trim() }));
      config = { ...config, label: label.trim(), fieldId: fieldId.trim(), columns: validColumns.length ? validColumns : config.columns };
    } else if (selectedType === 'formula' || selectedType === 'roll-button') {
      config = { ...config, label: label.trim(), notation: notation.trim() };
    }
    onAdd({ type: selectedType, config });
  }

  function toggleItemField(field) {
    setItemFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  }

  function addColumn() {
    setColumns(prev => [...prev, { id: `col_${Date.now()}`, label: '', type: 'text' }]);
  }

  function removeColumn(idx) {
    setColumns(prev => prev.filter((_, i) => i !== idx));
  }

  function updateColumnLabel(idx, lbl) {
    setColumns(prev => prev.map((c, i) => i === idx ? { ...c, label: lbl } : c));
  }

  function setColumnType(idx, type) {
    setColumns(prev => prev.map((c, i) => i === idx ? { ...c, type } : c));
  }

  function renderConfigFields() {
    if (NO_CONFIG_TYPES.has(selectedType)) {
      return <p className="hint-text" style={{ margin: 0 }}>{t('customWidgets.noConfig')}</p>;
    }

    return (
      <>
        {/* Label — required for all configurable types */}
        <div className="field" style={{ marginBottom: 12 }}>
          <label>
            {t('customWidgets.statLabel')}{' '}
            <span aria-hidden="true" style={{ color: 'var(--c-warn)' }}>*</span>
          </label>
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder={t('placeholders.widgetLabel')}
            style={{ borderColor: !label.trim() ? 'var(--c-warn)' : undefined }}
          />
        </div>

        {/* Field ID — bar/counter/text/toggle-list/table */}
        {!['list', 'formula', 'roll-button'].includes(selectedType) && (
          <div className="field" style={{ marginBottom: 12 }}>
            <label>{t('customWidgets.fieldId')}</label>
            <input
              value={fieldId}
              onChange={e => setFieldId(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
              placeholder="HP"
            />
            <span className="hint-text">{t('customWidgets.fieldIdHint')}</span>
          </div>
        )}

        {/* Bar: color + icon */}
        {selectedType === 'bar' && (
          <>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>{t('customWidgets.configure')}</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {COLOR_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`filter-chip${color === opt.value ? ' active' : ''}`}
                    onClick={() => setColor(opt.value)}
                  >
                    <span style={{
                      display: 'inline-block', width: 10, height: 10,
                      borderRadius: '50%', background: `var(${opt.value})`,
                      flexShrink: 0,
                    }} />
                    {t(opt.labelKey)}
                  </button>
                ))}
              </div>
            </div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>{t('customWidgets.icon')}</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {BAR_ICONS.map(ic => (
                  <button
                    key={ic}
                    className={`filter-chip${barIcon === ic ? ' active' : ''}`}
                    onClick={() => setBarIcon(ic)}
                    title={ic}
                  >
                    <Icon id={ic} fallback={ic} />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Counter: max */}
        {selectedType === 'counter' && (
          <div className="field" style={{ marginBottom: 12 }}>
            <label>{t('customWidgets.editMax')}</label>
            <input
              type="number"
              min={1}
              max={20}
              value={counterMax}
              onChange={e => setCounterMax(e.target.value)}
              style={{ width: 80 }}
            />
          </div>
        )}

        {/* Text: multiline toggle */}
        {selectedType === 'text' && (
          <div className="field" style={{ marginBottom: 12 }}>
            <label
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
            >
              <input
                type="checkbox"
                checked={multiline}
                onChange={e => setMultiline(e.target.checked)}
              />
              {t('customWidgets.multiline')}
            </label>
          </div>
        )}

        {/* List: item fields picker */}
        {selectedType === 'list' && (
          <div className="field" style={{ marginBottom: 12 }}>
            <label>{t('customWidgets.itemFields')}</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {ITEM_FIELD_OPTIONS.map(f => (
                <button
                  key={f}
                  className={`filter-chip${itemFields.includes(f) ? ' active' : ''}`}
                  onClick={() => toggleItemField(f)}
                >
                  {t(`customWidgets.field_${f}`)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Formula / roll-button: notation input, with the same slash menu as native notation fields */}
        {needsNotation && (
          <div className="field" style={{ marginBottom: 12 }}>
            <label>
              {t('customWidgets.notation')}{' '}
              <span aria-hidden="true" style={{ color: 'var(--c-warn)' }}>*</span>
            </label>
            <NotationTextarea
              value={notation}
              onChange={e => setNotation(e.target.value)}
              style={{ minHeight: 40, borderColor: !notation.trim() ? 'var(--c-warn)' : undefined }}
              placeholder={t('placeholders.notation')}
            />
          </div>
        )}

        {/* Table: column builder */}
        {selectedType === 'table' && (
          <div className="field" style={{ marginBottom: 12 }}>
            <label>{t('customWidgets.columns')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              {columns.map((col, idx) => (
                <div key={col.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    value={col.label}
                    onChange={e => updateColumnLabel(idx, e.target.value)}
                    placeholder={t('customWidgets.columnLabel')}
                    style={{ flex: 1 }}
                  />
                  <button
                    className={`filter-chip${col.type === 'text' ? ' active' : ''}`}
                    onClick={() => setColumnType(idx, 'text')}
                  >{t('customWidgets.colTypeText')}</button>
                  <button
                    className={`filter-chip${col.type === 'number' ? ' active' : ''}`}
                    onClick={() => setColumnType(idx, 'number')}
                  >{t('customWidgets.colTypeNumber')}</button>
                  {columns.length > 1 && (
                    <button className="mod-btn" style={{ fontSize: '0.667rem' }} onClick={() => removeColumn(idx)}>✕</button>
                  )}
                </div>
              ))}
            </div>
            <button className="io-btn" style={{ marginTop: 8 }} onClick={addColumn}>
              {t('customWidgets.addColumn')}
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      className="creator-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="creator-modal" style={{ maxWidth: 480 }}>
        <div className="creator-header">
          <div className="creator-title">
            {isEdit ? t('customWidgets.editWidget') : t('customWidgets.addWidget')}
          </div>
          <button className="creator-close" onClick={onClose} aria-label={t('common.close')}>
            <X size={16} />
          </button>
        </div>

        <div className="creator-body">
          {/* Type picker (hidden in edit mode — type can't change after creation) */}
          {!isEdit && (
            <div style={{ marginBottom: 16 }}>
              <div className="hint-text" style={{ marginBottom: 6 }}>
                {t('customWidgets.chooseType')}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {types.map(type => (
                  <button
                    key={type}
                    className={`filter-chip${selectedType === type ? ' active' : ''}`}
                    onClick={() => setSelectedType(type)}
                  >
                    <Icon id={CUSTOM_WIDGET_TYPES[type].icon} fallback="?" />
                    {' '}{t(CUSTOM_WIDGET_TYPES[type].label)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Config section */}
          <div>
            {renderConfigFields()}
          </div>
        </div>

        <div className="creator-footer">
          <div />
          <button
            className="io-btn primary"
            onClick={handleAdd}
            disabled={!canAdd}
          >
            {isEdit ? t('common.save') : t('customWidgets.addToSheet')}
          </button>
        </div>
      </div>
    </div>
  );
}
