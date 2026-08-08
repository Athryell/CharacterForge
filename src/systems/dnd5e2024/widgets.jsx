import React from 'react';
import { Shield as ShieldIcon } from 'lucide-react';
import { Icon, getIconMap } from '../../config/icons';
import { Field, HPBar, ResourceIcon, DICE_ICONS } from '../../components/sheet';
import { AbilityBox, SpellSlots, SubclassSection } from './parts';
import AlignmentPicker from '../../components/AlignmentPicker';
import ActionManager from '../../components/ActionManager';
import ArmorManager from '../../components/ArmorManager';
import WeaponManager from '../../components/WeaponManager';
import SpellManager from '../../components/SpellManager';
import InventoryManager from '../../components/InventoryManager';
import ConditionTracker from '../../components/ConditionTracker';
import FeatureManager from '../../components/FeatureManager';
import dataManager from '../../data/dataManager';
import { getMod, fmtMod, ABILITIES, SKILLS, HIT_DICE } from './data/mechanics';
import { calcArmorAC, DND_ARMOR_PRESETS } from './data/armors';
import { CLASS_FEATURES } from './data/classes';
import { SPECIES_FEATURES, getAutoFeatures } from './data/species';
import { BACKGROUND_FEATURES } from './data/backgrounds';
import { parseSpeedFt } from '../../hooks/useUnits';

// The D&D 5e sheet. Moved verbatim out of App.jsx renderWidget: the
// destructuring below reproduces the closure the switch used to sit in, so
// none of the case bodies needed editing.

export function render(id, ctx) {
  const {
    core:    { state, update, char, t, layout, activeSystem },
    ui, derived, shell, units,
  } = ctx;
  const {
    editingIdentity, setEditingIdentity, editingAbilities, setEditingAbilities,
    editingHP, setEditingHP, hpAmount, setHpAmount,
    editingCombat, setEditingCombat, editingResources, setEditingResources,
    addOpenFor, setAddOpenFor, addingResource, setAddingResource,
    newResource, setNewResource, hoveredAttr, setHoveredAttr,
    concentrationCheck, setConcentrationCheck, contentEditMap,
    currentWeightKg, maxWeightKg, coinWeightKg,
  } = ui;
  const {
    effectiveAbilities, equipBonuses, equipBonusesDetailed, acDerivedData,
    hasSpells, actionNames, strSpeedPenaltyFt, strPenaltyText,
  } = derived;
  const {
    handleRoll, handleCastSpell, handleClassOrLevelChange, handleConcentrationRoll,
    handleDeathSaveRoll, handleHitDiceRoll, createTag,
    openHomebrewEditorFor, toggleResourcePin, toggleResourcePip,
    incrementResource, decrementResource, addCustomResource, removeResource,
    setShowLevelUp, setShowLevelDown, homebrewVersion,
    activityLog, setActivityLog, allTags,
  } = shell;
  const { toDisplaySpeed, fromDisplaySpeed, toDisplayWeight, speedUnit, weightUnit } = units;

  const ce = contentEditMap[id] ? ' content-editing' : '';
  switch (id) {

      case 'identity': return (
        <div className={`card${ce}`}>
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span><Icon id="widget.identity" /> {t('widgets.identity')}</span>
            <button className={`icon-btn ${editingIdentity ? 'active' : ''}`} onClick={() => setEditingIdentity(v => !v)}>
              {editingIdentity ? <Icon id="action.done" size={14} /> : <Icon id="action.edit" size={14} />}
            </button>
          </div>
          <div className="identity-layout">
            {state.charImage && (
              <img src={state.charImage} alt={t('widgets.identity')} className="char-thumbnail"
                onError={e => { e.target.style.display='none'; }} />
            )}
            {editingIdentity ? (() => {
                const knownClasses = dataManager.getClasses(activeSystem);
                return (
                  <div className="grid-2" style={{ flex:1 }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <Field label={t('identity.imageUrl')}>
                        <input value={state.charImage||''} onChange={e => update({ charImage: e.target.value })}
                          placeholder="https://..." />
                      </Field>
                    </div>
                    <Field label={t('identity.name')}>
                      <input value={state.charName} onChange={e => update({ charName: e.target.value })} placeholder="Es. Aldric Voss" />
                    </Field>
                    <Field label={t('identity.class')}>
                      <select value={state.charClass || ''} onChange={e => {
                        const cls = e.target.value;
                        if (cls === '__custom__') {
                          openHomebrewEditorFor('classes');
                        } else {
                          handleClassOrLevelChange({ charClass: cls });
                          const kept = (state.features||[]).filter(f => f.sourceType !== 'class');
                          update({ features: [...kept, ...getAutoFeatures('class', cls, CLASS_FEATURES)], charSubclass: '', subclassFeatures: [] });
                        }
                      }}>
                        <option value="">{t('identity.classPlaceholder')}</option>
                        {[...knownClasses].sort((a, b) => t(`data.classes.${a}`, a).localeCompare(t(`data.classes.${b}`, b))).map(c => <option key={c} value={c}>{t(`data.classes.${c}`, c)}</option>)}
                        <option value="__custom__">{t('identity.classCustom')}</option>
                      </select>
                    </Field>
                    <SubclassSection key={state.charClass} state={state} update={update} t={t} onOpenEditor={() => openHomebrewEditorFor('subclasses')} />
                    <Field label={t('identity.species')}>
                      <select value={state.charRace || ''} onChange={e => {
                        const race = e.target.value;
                        if (race === '__custom__') {
                          openHomebrewEditorFor('species');
                        } else if (race) {
                          const kept = (state.features||[]).filter(f => f.sourceType !== 'species');
                          update({ charRace: race, features: [...kept, ...getAutoFeatures('species', race, SPECIES_FEATURES)] });
                        } else {
                          update({ charRace: '' });
                        }
                      }}>
                        <option value="">{t('identity.speciesPlaceholder')}</option>
                        {dataManager.getSpecies(activeSystem).slice().sort((a, b) => t(`data.species.${a.id}`, a.name).localeCompare(t(`data.species.${b.id}`, b.name))).map(r => <option key={r.id} value={r.id}>{t(`data.species.${r.id}`, r.name)}</option>)}
                        <option value="__custom__">{t('identity.speciesCustom')}</option>
                      </select>
                    </Field>
                    <Field label={t('identity.background')}>
                      <select value={state.charBackground || ''} onChange={e => {
                        const bg = e.target.value;
                        if (bg === '__custom__') {
                          openHomebrewEditorFor('backgrounds');
                        } else if (bg) {
                          const kept = (state.features||[]).filter(f => f.sourceType !== 'background');
                          update({ charBackground: bg, features: [...kept, ...getAutoFeatures('background', bg, BACKGROUND_FEATURES)] });
                        } else {
                          update({ charBackground: '' });
                        }
                      }}>
                        <option value="">{t('identity.backgroundPlaceholder')}</option>
                        {dataManager.getBackgrounds(activeSystem).slice().sort((a, b) => t(`data.backgrounds.${a.id || a.name}`, a.name).localeCompare(t(`data.backgrounds.${b.id || b.name}`, b.name))).map(b => <option key={b.id || b.name} value={b.id || b.name}>{t(`data.backgrounds.${b.id || b.name}`, b.name)}</option>)}
                        <option value="__custom__">{t('identity.backgroundCustom')}</option>
                      </select>
                    </Field>
                    <Field label={t('identity.level')}>
                      <div className="hp-stepper" style={{ gap:4 }}>
                        {activeSystem === 'dnd5e2024'
                          ? <button className="mod-btn" style={{ color: state.charLevel > 1 ? 'var(--c-warn)' : undefined }} disabled={state.charLevel <= 1} onClick={() => setShowLevelDown(true)}>−</button>
                          : <button className="mod-btn" onClick={() => char.onClassOrLevelChange({ charLevel: Math.max(1, state.charLevel-1) })}>−</button>
                        }
                        <input type="number" min="1" max="20" style={{ width:50, textAlign:'center' }} value={state.charLevel} onChange={e => handleClassOrLevelChange({ charLevel: Math.max(1, parseInt(e.target.value)||1) })} />
                        {activeSystem === 'dnd5e2024'
                          ? <button className="mod-btn" style={{ color: state.charLevel < 20 ? 'var(--c-accent)' : undefined }} disabled={state.charLevel >= 20} onClick={() => setShowLevelUp(true)}>+</button>
                          : <button className="mod-btn" onClick={() => char.onClassOrLevelChange({ charLevel: Math.min(20, state.charLevel+1) })}>+</button>
                        }
                      </div>
                    </Field>
                    <Field label={t('identity.profBonus')}><input value={`+${char.profBonus}`} readOnly /></Field>
                    <Field label={t('identity.alignment')}>
                      <AlignmentPicker
                        value={state.charAlignment}
                        onChange={a => update({ charAlignment: a })}
                      />
                    </Field>
                    <Field label={t('identity.xp')}>
                      <input type="number" min="0" value={state.charXP} onChange={e => update({ charXP: parseInt(e.target.value)||0 })} />
                    </Field>
                  </div>
                );
              })() : (
              <div className="identity-info-grid">
                {[
                  [t('identity.name'), state.charName || '—'],
                  [t('identity.class'), state.charClass ? t(`data.classes.${state.charClass}`, state.charClass) : '—'],
                  ...(state.charSubclass ? [[t('identity.subclass'), state.charSubclass]] : []),
                  [t('identity.level'), state.charLevel],
                  [t('identity.profBonus'), `+${char.profBonus}`],
                  [t('identity.species'), state.charRace ? t(`data.species.${state.charRace}`, state.charRace) : '—'],
                  [t('identity.background'), state.charBackground ? t(`data.backgrounds.${state.charBackground}`, state.charBackground) : '—'],
                  [t('identity.alignment'), state.charAlignment ? t(`data.alignments.${state.charAlignment}`, state.charAlignment) : '—'],
                  ...(state.charXP ? [[t('identity.experienceShort'), state.charXP]] : []),
                ].map(([label, val]) => (
                  <div key={label} className="identity-info-item">
                    <div className="identity-info-label">{label}</div>
                    <div className="identity-info-val">{val}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );

      case 'abilities': return (
        <div className={`card${ce}`}>
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span><Icon id="widget.abilities" /> {t('widgets.abilities')}</span>
            <button className={`icon-btn ${editingAbilities ? 'active' : ''}`} onClick={() => setEditingAbilities(e => !e)}>
              {editingAbilities ? <Icon id="action.done" size={14} /> : <Icon id="action.edit" size={14} />}
            </button>
          </div>
          <div className="grid-6">
            {ABILITIES.map(attr => (
              <AbilityBox key={attr} attr={attr} score={(state.abilities || {})[attr]}
                effectiveScore={effectiveAbilities[attr]}
                onAdjust={(a,d) => char.setAbility(a, ((state.abilities || {})[a]||10)+d)}
                onInput={char.setAbility} editing={editingAbilities} onHover={setHoveredAttr}
                onRoll={!editingAbilities ? (a, mod) => handleRoll(`1d20${mod >= 0 ? '+' : ''}${mod}`, t(`data.abilities.${a}`)) : undefined}
                bonus={equipBonuses[attr] || 0}
                bonusSources={equipBonusesDetailed[attr] || []} />
            ))}
          </div>
        </div>
      );

      case 'saves': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.saves" /> {t('widgets.saves')}</div>
          <div className="check-list">
            {ABILITIES.map(attr => {
              const saveHalf = (state.saveHalfProficiency || []).includes(attr);
              const prof = (state.saveProficiencies || []).includes(attr);
              const saveProfMod = prof ? char.profBonus : saveHalf ? Math.floor(char.profBonus / 2) : 0;
              const effMod = getMod(effectiveAbilities[attr]) + saveProfMod + (equipBonuses[`SAV-${attr}`] || 0);
              const tsBonus = equipBonuses[`SAV-${attr}`] || 0;
              return (
                <div key={attr} className={`check-item ${hoveredAttr === attr ? 'attr-highlight' : ''}`}
                  onClick={() => handleRoll(`1d20${effMod >= 0 ? '+' : ''}${effMod}`, t(`data.abilities.${attr}`))}>
                  <div className={`check-dot ${prof ? 'proficient' : saveHalf ? 'half-prof' : ''}`}
                    onClick={e => { e.stopPropagation(); char.toggleSaveProficiency(attr); }} />
                  <span className="check-val">{fmtMod(effMod)}</span>
                  <span className="check-name">{t(`data.abilities.${attr}`)}</span>
                  {tsBonus ? <span className="equip-bonus-badge" style={{ marginLeft:'auto' }}
                    title={(equipBonusesDetailed[`SAV-${attr}`]||[]).map(s=>`${s.name}: ${s.value>=0?'+':''}${s.value}`).join(', ')}>🎒</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      );

      case 'skills': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.skills" /> {t('widgets.skills')}</div>
          <div className="check-list">
            {SKILLS.map(sk => {
              const skillHalf = (state.skillHalfProficiency || []).includes(sk.id);
              const prof = (state.skillProficiencies || []).includes(sk.id);
              const exp = (state.skillExpertise || []).includes(sk.id);
              const skillProfMod = exp ? char.profBonus*2 : prof ? char.profBonus : skillHalf ? Math.floor(char.profBonus / 2) : 0;
              const effSkMod = getMod(effectiveAbilities[sk.attr]) + skillProfMod;
              return (
                <div key={sk.id} className={`check-item ${hoveredAttr === sk.attr ? 'attr-highlight' : ''}`}
                  onClick={() => handleRoll(`1d20${effSkMod >= 0 ? '+' : ''}${effSkMod}`, t(`data.skills.${sk.id}`))}>
                  <div className={`check-dot ${exp ? 'expertise' : prof ? 'proficient' : skillHalf ? 'half-prof' : ''}`}
                    onClick={e => { e.stopPropagation(); char.toggleSkillProficiency(sk.id); }} />
                  <span className="check-val">{fmtMod(effSkMod)}</span>
                  <span className="check-name">{t(`data.skills.${sk.id}`)}</span>
                  <span className="check-attr">{t(`data.abilityAbbr.${sk.attr}`)}</span>
                </div>
              );
            })}
          </div>
        </div>
      );

      case 'senses': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.senses" /> {t('widgets.senses')}</div>
          <div className="field-row">
            <Field label={t('senses.passivePerception')}><input value={char.passivePerception} readOnly /></Field>
            <Field label={t('senses.hitDice')}><input value={char.hitDice} readOnly /></Field>
          </div>
        </div>
      );

      case 'hp': return (
        <div className={`card${ce}`}>
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span><Icon id="widget.hp" /> {t('widgets.hp')}</span>
            <button className={`icon-btn ${editingHP ? 'active' : ''}`} onClick={() => setEditingHP(e => !e)}>
              {editingHP ? <Icon id="action.done" size={14} /> : <Icon id="action.edit" size={14} />}
            </button>
          </div>
          <div className="hp-labeled-row">
            <div className="hp-labeled-group">
              <div className="hp-label">{t('hp.current')}</div>
              <div className="hp-stepper">
                <button className="mod-btn" onClick={() => update({ hpCurrent: Math.max(0, state.hpCurrent-1) })}>−</button>
                <input className="hp-big" type="number" value={state.hpCurrent} onChange={e => update({ hpCurrent: Math.max(0, parseInt(e.target.value)||0) })} />
                <button className="mod-btn" onClick={() => update({ hpCurrent: Math.min(state.hpMax, state.hpCurrent+1) })}>+</button>
              </div>
            </div>
            <span className="hp-sep">/</span>
            <div className="hp-labeled-group">
              <div className="hp-label">
                {t('hp.max')}{editingHP ? t('hp.maxBase') : ''}
                {equipBonuses.HP ? (
                  <span className="equip-bonus-badge" style={{ marginLeft:4 }}
                    title={(equipBonusesDetailed.HP||[]).map(s => `${s.name}: ${s.value>=0?'+':''}${s.value}`).join(', ')}>
                    🎒
                  </span>
                ) : null}
              </div>
              <div className="hp-stepper">
                {editingHP && <button className="mod-btn" onClick={() => update({ hpMax: Math.max(1, state.hpMax-1) })}>−</button>}
                <input className="hp-big" type="number"
                  value={editingHP ? state.hpMax : state.hpMax + (equipBonuses.HP || 0)}
                  readOnly={!editingHP}
                  style={{ background: editingHP ? 'var(--c-bg)' : 'var(--c-surface)', color: editingHP ? 'var(--c-ink)' : 'var(--c-muted)' }}
                  onChange={e => editingHP && update({ hpMax: Math.max(1, parseInt(e.target.value)||1) })} />
                {editingHP && <button className="mod-btn" onClick={() => update({ hpMax: state.hpMax+1 })}>+</button>}
              </div>
            </div>
            {(state.hpTemp||0) > 0 && (
              <div className="hp-labeled-group" style={{ marginLeft:4 }}>
                <div className="hp-label" style={{ color:'#185FA5' }}>Temp</div>
                <div className="hp-big" style={{ color:'#185FA5', fontSize:20 }}>{state.hpTemp}</div>
              </div>
            )}
          </div>
          <HPBar current={state.hpCurrent} max={state.hpMax + (equipBonuses.HP || 0)} />
          {(state.hpTemp||0) > 0 && (
            <div className="hp-bar-wrap" style={{ marginTop:4 }}>
              <div className="hp-bar-fill" style={{ width:`${Math.min(100,((state.hpTemp||0)/Math.max(1,state.hpMax))*100)}%`, background:'#4A90D9' }} />
            </div>
          )}
          <div className="hp-actions">
            <div className="hp-stepper">
              <button className="mod-btn" onClick={() => setHpAmount(a => Math.max(0,a-1))}>−</button>
              <input className="hp-amount" type="number" min="0" value={hpAmount} onChange={e => setHpAmount(Math.max(0,parseInt(e.target.value)||0))} />
              <button className="mod-btn" onClick={() => setHpAmount(a => a+1)}>+</button>
            </div>
            <button className="hp-action-btn danger" onClick={() => {
              const temp = state.hpTemp||0;
              if (temp > 0) { const r = temp-hpAmount; r >= 0 ? update({ hpTemp:r }) : update({ hpTemp:0, hpCurrent:Math.max(0,state.hpCurrent+r) }); }
              else char.modHP(-hpAmount);
              if (hpAmount > 0 && (state.concentrating || state.concentratingSpell)) {
                setConcentrationCheck({ dc: Math.max(10, Math.floor(hpAmount / 2)) });
              }
            }}><Icon id="game.damage" size={13} /> {t('hp.damage')}</button>
            <button className="hp-action-btn success" onClick={() => char.modHP(hpAmount)}><Icon id="game.heal" size={13} /> {t('hp.heal')}</button>
            <button className="hp-action-btn temp" onClick={() => update({ hpTemp: hpAmount })}><Icon id="game.tempHp" size={13} /> {t('hp.tempBtn')}</button>
          </div>
          {activeSystem === 'dnd5e2024' && (
            <div className="hit-dice-row">
              <span className="hit-dice-label">{t('hp.hitDiceLabel')}</span>
              <button className="mod-btn" onClick={() => update({ hitDiceUsed: Math.min(state.charLevel, (state.hitDiceUsed||0)+1) })} disabled={(state.hitDiceUsed||0) >= state.charLevel}>−</button>
              <span className="hit-dice-count">
                {state.charLevel - (state.hitDiceUsed||0)}<span style={{ color:'var(--c-muted)', fontWeight:400 }}>/{state.charLevel} {HIT_DICE[state.charClass] || 'd8'}</span>
              </span>
              <button className="mod-btn" onClick={() => update({ hitDiceUsed: Math.max(0, (state.hitDiceUsed||0)-1) })} disabled={(state.hitDiceUsed||0) <= 0}>+</button>
              <button className="hit-dice-use-btn" onClick={handleHitDiceRoll} disabled={(state.hitDiceUsed||0) >= state.charLevel}>
                <Icon id="game.roll" size={12} /> {t('hp.hitDiceRollBtn')}
              </button>
            </div>
          )}
          {concentrationCheck && (
            <div className="concentration-banner">
              <div className="concentration-banner-text">
                <Icon id="game.concentration" size={14} />
                {t('concentration.checkRequired', { dc: concentrationCheck.dc })}
              </div>
              <div className="concentration-banner-actions">
                <button className="io-btn primary" onClick={() => handleConcentrationRoll(concentrationCheck.dc)}>
                  🎲 {t('concentration.rollBtn')}
                </button>
                <button className="io-btn" onClick={() => setConcentrationCheck(null)}>
                  {t('concentration.passBtn')}
                </button>
                <button className="io-btn danger" onClick={() => {
                  update({ concentrating: false, concentratingSpell: null });
                  setConcentrationCheck(null);
                }}>
                  {t('concentration.failBtn')}
                </button>
              </div>
            </div>
          )}
        </div>
      );

      case 'combatStats': {
        const _acBase = state.ac ?? 10;
        const _equipAC = equipBonuses.AC || 0;
        const _totalAC = _acBase + acDerivedData.dexContrib + acDerivedData.shieldBonus + _equipAC;
        const _dexMod = getMod(effectiveAbilities.DEX);
        const _initMod = _dexMod + (equipBonuses.INIT || 0);
        const _isDexCapped = acDerivedData.ea && acDerivedData.dexContrib < _dexMod;
        return (
        <div className={`card${ce}`}>
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span><Icon id="widget.combatStats" /> {t('widgets.combatStats')}</span>
            <button className={`icon-btn ${editingCombat ? 'active' : ''}`} onClick={() => setEditingCombat(v => !v)}>
              {editingCombat ? <Icon id="action.done" size={14} /> : <Icon id="action.edit" size={14} />}
            </button>
          </div>
          <div className="grid-3">
            <div className="stat-pill">
              <div className="stat-pill-label">{t('combat.ac')}</div>
              {editingCombat ? (
                <div className="ability-score-row">
                  <button className="mod-btn" onClick={() => update({ ac: Math.max(0, _acBase - 1) })}>−</button>
                  <input className="ability-score-input" type="number" min="0"
                    value={_acBase}
                    onChange={e => update({ ac: parseInt(e.target.value) || 0 })} />
                  <button className="mod-btn" onClick={() => update({ ac: _acBase + 1 })}>+</button>
                </div>
              ) : (
                <div className="stat-pill-val">{_totalAC}</div>
              )}
              <div className="stat-info-btn-wrap">
                <button className="stat-info-btn" tabIndex={0}>i</button>
                <div className="stat-info-tooltip">
                  {acDerivedData.ea
                    ? <div>{acDerivedData.ea.name || t('armor.label')}: {_acBase}</div>
                    : <div>Base: {_acBase}</div>
                  }
                  <div>DEX: {acDerivedData.dexContrib >= 0 ? '+' : ''}{acDerivedData.dexContrib}{_isDexCapped ? ' (max)' : ''}</div>
                  {acDerivedData.shields.map((s, si) => (
                    <div key={si}><ShieldIcon size={9} /> {s.name}: +{s.acValue || 2}</div>
                  ))}
                  {(equipBonusesDetailed.AC || []).map((s, si) => (
                    <div key={si}>+ {s.name}: {s.value >= 0 ? '+' : ''}{s.value}</div>
                  ))}
                  <div className="stat-info-total">= {_totalAC}</div>
                </div>
              </div>
            </div>
            <div className={`stat-pill${!editingCombat ? ' clickable-stat' : ''}`}
              onClick={!editingCombat ? () => handleRoll(`1d20${_initMod >= 0 ? '+' : ''}${_initMod}`, 'Iniziativa') : undefined}
              title={!editingCombat ? `Tira iniziativa: 1d20${fmtMod(_initMod)}` : undefined}>
              <div className="stat-pill-label">{t('combat.initiative')}</div>
              <div className="stat-pill-val">{fmtMod(_initMod)}</div>
              {equipBonuses.INIT ? (
                <span className="equip-bonus-badge"
                  title={(equipBonusesDetailed.INIT||[]).map(s=>`${s.name}: ${s.value>=0?'+':''}${s.value}`).join(', ')}>
                  🎒
                </span>
              ) : null}
            </div>
            <div className="stat-pill">
              <div className="stat-pill-label">{t('combat.speed')}</div>
              {(() => {
                const spdUnit = speedUnit === 'sq' ? '□' : speedUnit;
                const rawDisplay = toDisplaySpeed(parseSpeedFt(state.speed));
                const spdBonus = equipBonuses.SPD || 0;
                const baseDisplay = rawDisplay + spdBonus;
                const exhLvl = state.exhaustionLevel || 0;
                const exhPenaltyDisplay = exhLvl >= 5 ? baseDisplay : Math.min(baseDisplay, toDisplaySpeed(exhLvl * 5));
                const strPenDisplay = toDisplaySpeed(strSpeedPenaltyFt);
                const effectiveDisplay = Math.max(0, baseDisplay - exhPenaltyDisplay - strPenDisplay);
                const anySpeedPenalty = exhPenaltyDisplay > 0 || strPenDisplay > 0;
                const speedInfoBtn = (
                  <div className="stat-info-btn-wrap">
                    <button className="stat-info-btn" tabIndex={0}>i</button>
                    <div className="stat-info-tooltip">
                      <div>Base: {rawDisplay} {spdUnit}</div>
                      {(equipBonusesDetailed.SPD || []).map((s, si) => (
                        <div key={si}>+ {s.name}: {s.value >= 0 ? '+' : ''}{s.value} {spdUnit}</div>
                      ))}
                      {exhPenaltyDisplay > 0 && (
                        <div><Icon id="game.exhaustion" size={9} /> {t('combat.exhaustionShort')}: −{exhPenaltyDisplay} {spdUnit}</div>
                      )}
                      {strPenDisplay > 0 && (
                        <div>⚠ STR: −{strPenDisplay} {spdUnit}</div>
                      )}
                      {(spdBonus !== 0 || exhPenaltyDisplay > 0 || strPenDisplay > 0) && (
                        <div className="stat-info-total">= {effectiveDisplay} {spdUnit}</div>
                      )}
                    </div>
                  </div>
                );
                if (editingCombat) {
                  return (
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                      <div className="ability-score-row">
                        <button className="mod-btn" onClick={() => update({ speed: String(Math.max(0, parseSpeedFt(state.speed) - 5)) })}>−</button>
                        <input className="ability-score-input" type="number" min="0"
                          value={rawDisplay}
                          onChange={e => update({ speed: String(fromDisplaySpeed(e.target.value || '0')) })} />
                        <button className="mod-btn" onClick={() => update({ speed: String(parseSpeedFt(state.speed) + 5) })}>+</button>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:2 }}>
                        <span style={{ fontSize:10, color:'var(--c-muted)' }}>{spdUnit}</span>
                        {speedInfoBtn}
                      </div>
                    </div>
                  );
                }
                return (
                  <div style={{ display:'flex', alignItems:'center', gap:2 }}>
                    <span className="stat-pill-val" style={{ fontSize:'1.4rem', ...(anySpeedPenalty ? { color:'var(--c-warn)' } : {}) }}>
                      {effectiveDisplay}
                    </span>
                    <span style={{ fontSize:10, color:'var(--c-muted)', whiteSpace:'nowrap' }}>{spdUnit}</span>
                    {speedInfoBtn}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      );
      }

      case 'resources': return (
        <div className="card">
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span><Icon id="widget.resources" /> {t('widgets.resources')}</span>
            <button className={`icon-btn${editingResources ? ' active' : ''}`}
              onClick={() => { setEditingResources(v => !v); setAddingResource(false); }}>
              {editingResources ? <Icon id="action.done" size={14} /> : <Icon id="action.edit" size={14} />}
            </button>
          </div>
          {/* Inspiration row */}
          <div className="resource-inspiration-row">
            <button className={`icon-btn${state.inspiration ? ' active' : ''}`}
              onClick={() => update({ inspiration: !state.inspiration })}>
              <Icon id="game.inspiration" size={14} />
            </button>
            <span className="toggle-label" style={{ color: state.inspiration ? 'var(--c-accent)' : 'var(--c-hint)' }}>
              {state.inspiration ? t('combat.inspiration') : t('combat.noInspiration')}
            </span>
          </div>
          {/* Class / feat / custom resources */}
          {(state.resources || []).filter(r => (r.max ?? 1) > 0).map(r => (
            <div key={r.id} className="resource-item">
              <div className="resource-label-row">
                <ResourceIcon icon={r.icon} size={13} />
                <span className="resource-name">{t(`resources.${r.id}`, r.name)}</span>
                {editingResources && r.source !== 'class' && (
                  <button className="icon-btn resource-remove-btn"
                    onClick={() => removeResource(r.id)}>
                    <Icon id="action.remove" size={11} />
                  </button>
                )}
              </div>
              {r.isPool ? (
                <div className="resource-pool">
                  <button className="mod-btn" onClick={() => decrementResource(r.id)}>−</button>
                  <span className="resource-pool-val">
                    {r.current}<span className="resource-pool-max">/{r.max}</span>
                  </span>
                  <button className="mod-btn" onClick={() => incrementResource(r.id)}>+</button>
                </div>
              ) : (
                <div className="resource-pips">
                  {Array.from({ length: r.max }).map((_, i) => (
                    <button key={i}
                      className={`icon-btn resource-pip-btn${i < r.current ? ' active' : ''}`}
                      onClick={() => toggleResourcePip(r.id, i)}>
                      <ResourceIcon icon={r.icon} size={13} />
                    </button>
                  ))}
                </div>
              )}
              {editingResources && (
                <label className="resource-pin-label">
                  <input type="checkbox" checked={r.pinned || false}
                    onChange={() => toggleResourcePin(r.id)} />
                  <span>{t('resources.pinLabel')}</span>
                  {r.source === 'class' && (
                    <span className="hint-text" style={{ marginLeft:4 }}>({t('resources.classResource')})</span>
                  )}
                </label>
              )}
            </div>
          ))}
          {/* Edit panel */}
          {editingResources && (
            <div className="resource-edit-panel">
              {!addingResource ? (
                <button className="icon-btn" style={{ marginTop:4 }}
                  onClick={() => setAddingResource(true)}>
                  <Icon id="action.add" size={12} /> {t('resources.addBtn')}
                </button>
              ) : (
                <div className="resource-add-form">
                  <div className="field">
                    <label>{t('resources.nameLabel')}</label>
                    <input value={newResource.name}
                      onChange={e => setNewResource(r => ({ ...r, name: e.target.value }))}
                      placeholder={t('resources.nameLabel')} />
                  </div>
                  <div className="field">
                    <label>{t('resources.iconLabel')}</label>
                    <div className="resource-icon-picker">
                      {DICE_ICONS.map(d => (
                        <button key={d}
                          className={`filter-chip${newResource.icon === d ? ' active' : ''}`}
                          onClick={() => setNewResource(r => ({ ...r, icon: d }))}>
                          {d}
                        </button>
                      ))}
                      {Object.keys(getIconMap()).filter(k => k.startsWith('resource.')).map(k => k.slice(9)).map(ic => (
                        <button key={ic}
                          className={`filter-chip${newResource.icon === ic ? ' active' : ''}`}
                          onClick={() => setNewResource(r => ({ ...r, icon: ic }))}>
                          <ResourceIcon icon={ic} size={12} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="field">
                    <label>{t('resources.maxLabel')}</label>
                    <input value={newResource.formula}
                      onChange={e => setNewResource(r => ({ ...r, formula: e.target.value }))}
                      placeholder={t('resources.maxFormula')} />
                  </div>
                  <div className="field">
                    <label>{t('resources.resetLabel')}</label>
                    <select value={newResource.resetOn}
                      onChange={e => setNewResource(r => ({ ...r, resetOn: e.target.value }))}>
                      <option value="none">{t('resources.resetNone')}</option>
                      <option value="short">{t('resources.resetShort')}</option>
                      <option value="long">{t('resources.resetLong')}</option>
                    </select>
                  </div>
                  <label className="resource-pin-label">
                    <input type="checkbox" checked={newResource.pinned}
                      onChange={e => setNewResource(r => ({ ...r, pinned: e.target.checked }))} />
                    <span>{t('resources.pinLabel')}</span>
                  </label>
                  <div style={{ display:'flex', gap:8, marginTop:8 }}>
                    <button className="io-btn primary" onClick={addCustomResource}>{t('common.add')}</button>
                    <button className="io-btn" onClick={() => {
                      setAddingResource(false);
                      setNewResource({ name:'', icon:'d6', formula:'fixed:1', resetOn:'long', pinned:false });
                    }}>{t('common.cancel')}</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );

      case 'deathSaves': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.deathSaves" /> {t('widgets.deathSaves')}</div>
          <div className="death-saves">
            {['success','failure'].map(type => (
              <div key={type} className="save-group">
                <div className="save-group-label">{type === 'success' ? t('combat.deathSuccess') : t('combat.deathFail')}</div>
                <div className="save-pips">
                  {[0,1,2].map(i => {
                    const arr = type === 'success' ? (state.deathSuccess||[false,false,false]) : (state.deathFail||[false,false,false]);
                    const on = arr[i] === true;
                    return (
                      <div key={i} className={`save-pip ${on ? type+'-on' : ''}`} onClick={() => {
                        const cur = [...(type === 'success' ? (state.deathSuccess||[false,false,false]) : (state.deathFail||[false,false,false]))];
                        cur[i] = !cur[i];
                        type === 'success' ? update({ deathSuccess:cur }) : update({ deathFail:cur });
                      }} />
                    );
                  })}
                </div>
              </div>
            ))}
            <button className="death-save-roll-btn" onClick={handleDeathSaveRoll}>
              <Icon id="game.roll" size={14} /> {t('deathSave.rollBtn')}
            </button>
          </div>
        </div>
      );

      case 'conditions': {
        const activeConds = state.conditions || [];
        const exhLvl = state.exhaustionLevel || 0;
        const customConds = state.customConditions || [];
        return (
          <ConditionTracker
            active={activeConds}
            onChange={conditions => update({ conditions })}
            exhaustionLevel={exhLvl}
            onExhaustionChange={level => update({ exhaustionLevel: level })}
            customConditions={customConds}
            onAddCustom={cond => update({ customConditions: [...customConds, cond] })}
            onRemoveCustom={id => update(prev => ({
              ...prev,
              customConditions: (prev.customConditions || []).filter(c => c.id !== id),
              conditions: (prev.conditions || []).filter(c => c !== id),
            }))}
          />
        );
      }

      case 'actions': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.actions" /> {t('widgets.actions')}</div>
          <ActionManager
            actions={state.actions || []}
            spells={state.spells || []}
            allTags={allTags}
            onUpdate={newActions => update({ actions: newActions })}
            onRoll={handleRoll}
            onUpdateTags={(id, tags) => {
              const action = (state.actions || []).find(a => a.id === id);
              const upd = { actions: state.actions.map(a => a.id === id ? { ...a, tags } : a) };
              if (action) {
                upd.weapons = (state.weapons || []).map(w => w.name === action.name ? { ...w, tags } : w);
                upd.spells = (state.spells || []).map(s => s.name === action.name ? { ...s, tags } : s);
                upd.features = (state.features || []).map(f => f.name === action.name ? { ...f, tags } : f);
                upd.equipment = (state.equipment || []).map(e => e.name === action.name ? { ...e, tags } : e);
              }
              update(upd);
            }}
            onCreateTag={createTag}
          />
        </div>
      );

      case 'weapons': return (
        <div className="card">
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span><Icon id="widget.weapons" /> {t('widgets.weapons')}</span>
            <button className={`icon-btn ${addOpenFor === 'weapons' ? 'active' : ''}`}
              onClick={() => setAddOpenFor(v => v === 'weapons' ? null : 'weapons')}><Icon id="action.add" size={13} /></button>
          </div>
          <WeaponManager weapons={state.weapons||[]} abilities={state.abilities} profBonus={char.profBonus}
            onUpdate={weapons => update({ weapons })} onRoll={handleRoll}
            proficiency={state.weaponProficiency||''} onUpdateProficiency={v => update({ weaponProficiency: v })}
            actionNames={actionNames} addOpen={addOpenFor === 'weapons'} onAddClose={() => setAddOpenFor(null)}
            allTags={allTags} weightUnit={weightUnit} toDisplayWeight={toDisplayWeight}
            onUpdateTags={(id, tags) => {
              const weapon = (state.weapons||[]).find(w => w.id===id);
              const upd = { weapons: (state.weapons||[]).map(w => w.id===id ? {...w,tags} : w) };
              if (weapon) upd.actions = (state.actions||[]).map(a => a.name===weapon.name ? {...a,tags} : a);
              update(upd);
            }}
            onCreateTag={createTag}
            onAddAction={action => { if (!actionNames.has(action.name)) update({ actions: [...(state.actions||[]), action] }); }}
            onRemoveAction={name => update({ actions: (state.actions||[]).filter(a => a.name !== name) })} />
        </div>
      );

      case 'armor': {
        // Backward compat: migrate old equippedArmor/hasShield to armors list
        let armorList = state.armors || [];
        if (armorList.length === 0 && (state.equippedArmor || state.hasShield)) {
          armorList = [];
          if (state.equippedArmor) armorList.push({
            id: state.equippedArmor.id || 'migrated_armor',
            name: state.equippedArmor.name, type: 'armor',
            armorType: state.equippedArmor.type || 'medium',
            acValue: calcArmorAC(state.equippedArmor, getMod(effectiveAbilities.DEX)),
            isProficient: true, equipped: true, desc: '', weight: '', tags: [],
          });
          if (state.hasShield) armorList.push({
            id: 'migrated_shield', name: 'Scudo', type: 'shield',
            acValue: 2, isProficient: true, equipped: true, desc: '', weight: '', tags: [],
          });
        }
        function onArmorUpdate(next) {
          const ea = next.find(a => a.type === 'armor' && a.equipped);
          let acBase;
          if (ea?.presetId) {
            const preset = DND_ARMOR_PRESETS.find(p => p.id === ea.presetId);
            acBase = preset ? preset.ac : ea.acValue;
          } else {
            acBase = ea ? ea.acValue : 10;
          }
          update({ armors: next, ac: acBase });
        }
        return (
          <div className="card">
            <div className="card-title" style={{ justifyContent:'space-between' }}>
              <span><Icon id="widget.armor" /> {t('widgets.armor')}</span>
              <button className={`icon-btn ${addOpenFor === 'armor' ? 'active' : ''}`}
                onClick={() => setAddOpenFor(v => v === 'armor' ? null : 'armor')}><Icon id="action.add" size={13} /></button>
            </div>
            <ArmorManager
              armors={armorList}
              desMod={getMod(effectiveAbilities.DEX)}
              onUpdate={onArmorUpdate}
              proficiency={state.armorProficiency||''} onUpdateProficiency={v => update({ armorProficiency: v })}
              allTags={allTags} weightUnit={weightUnit} toDisplayWeight={toDisplayWeight}
              onUpdateTags={(id, tags) => update({ armors: armorList.map(a => a.id===id ? {...a,tags} : a) })}
              onCreateTag={createTag}
              addOpen={addOpenFor === 'armor'} onAddClose={() => setAddOpenFor(null)}
              strPenaltyText={strPenaltyText}
            />
          </div>
        );
      }

      case 'spellStats': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.spellStats" /> {t('widgets.spellStats')}</div>
          {hasSpells ? (
            <div className="field-row">
              <Field label={t('spells.spellcastingStat')}><input value={char.spellStat||'—'} readOnly /></Field>
              <Field label={t('spells.saveDC')}><input value={char.spellSaveDC??'—'} readOnly /></Field>
              <Field label={t('spells.attackBonus')}><input value={char.spellAttackBonus??'—'} readOnly /></Field>
            </div>
          ) : <p className="hint-text">{t('spells.noSpellcaster')}</p>}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:10, paddingTop:8, borderTop:'0.5px solid var(--c-border)' }}>
            <button className={`icon-btn${state.concentrating ? ' active' : ''}`}
              onClick={() => update({ concentrating:!state.concentrating, concentratingSpell: state.concentrating ? null : state.concentratingSpell })}><Icon id="game.concentration" size={14} /></button>
            <span className="toggle-label" style={{ color: state.concentrating ? 'var(--c-accent)' : 'var(--c-hint)' }}>
              {state.concentrating
                ? (state.concentratingSpell ? `${t('combat.concentrating')} (${state.concentratingSpell})` : t('combat.concentrating'))
                : t('combat.noConcentration')}
            </span>
          </div>
        </div>
      );

      case 'spellSlots': return (
        <div className="card">
          <div className="card-title">
            <Icon id="widget.spellSlots" /> {t('widgets.spellSlots')}
          </div>
          {hasSpells && state.spellSlots.length > 0
            ? <SpellSlots slots={state.spellSlots} onToggle={char.toggleSpellSlot} />
            : <p className="hint-text">{t('spells.noSlots')}</p>}
        </div>
      );

      case 'spells': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.spells" /> {t('widgets.spells')}</div>
          <SpellManager spells={state.spells} charClass={state.charClass} onUpdate={spells => update({ spells })}
            onRoll={handleRoll} allTags={allTags}
            onUpdateTags={(name,tags) => update({
              spells: state.spells.map(s => s.name===name ? {...s,tags} : s),
              actions: (state.actions||[]).map(a => a.name===name ? {...a,tags} : a),
            })}
            onCreateTag={createTag}
            spellSlots={state.spellSlots||[]}
            concentratingSpell={state.concentratingSpell||null}
            onCast={handleCastSpell}
            actionNames={actionNames}
            onAddAction={action => { if (!actionNames.has(action.name)) update({ actions: [...(state.actions||[]), action] }); }}
            onRemoveAction={name => update({ actions: (state.actions||[]).filter(a => a.name !== name) })}
            homebrewKey={homebrewVersion} />
        </div>
      );

      case 'currency': {
        const CURR = [['PP',t('currency.pp'),'#7B68EE'],['GP',t('currency.gp'),'#633806'],['SP',t('currency.sp'),'#888780'],['CP',t('currency.cp'),'#854F0B']];
        const cur = state.currency || {};
        function convertDown(i) { // 1 di CURR[i] → 10 di CURR[i+1]
          const [fk,,] = CURR[i]; const [tk,,] = CURR[i+1];
          if ((cur[fk]||0) < 1) return;
          update({ currency: { ...cur, [fk]: (cur[fk]||0)-1, [tk]: (cur[tk]||0)+10 } });
        }
        function convertUp(i) { // 10 di CURR[i+1] → 1 di CURR[i]
          const [fk,,] = CURR[i]; const [tk,,] = CURR[i+1];
          if ((cur[tk]||0) < 10) return;
          update({ currency: { ...cur, [tk]: (cur[tk]||0)-10, [fk]: (cur[fk]||0)+1 } });
        }
        return (
        <div className="card">
          <div className="card-title"><Icon id="widget.currency" /> {t('widgets.currency')}</div>
          <div className="currency-row">
            {CURR.map(([key,label,color], idx) => (
              <React.Fragment key={key}>
                <div className="currency-item">
                  <div className="currency-label" style={{ color }}>{label}</div>
                  <input className="currency-input" type="number" min="0"
                    value={cur[key]||0}
                    onChange={e => update({ currency: {...cur, [key]:parseInt(e.target.value)||0} })} />
                </div>
                {idx < CURR.length-1 && (
                  <div className="currency-convert">
                    <button className="currency-conv-btn" onClick={() => convertUp(idx)}
                      disabled={(cur[CURR[idx+1][0]]||0) < 10}
                      title={`10 ${CURR[idx+1][1]} → 1 ${label}`}>▲</button>
                    <button className="currency-conv-btn" onClick={() => convertDown(idx)}
                      disabled={(cur[key]||0) < 1}
                      title={`1 ${label} → 10 ${CURR[idx+1][1]}`}>▼</button>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      );
      }

      case 'inventory': return (
        <div className="card">
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span><Icon id="tab.inventory" /> {t('widgets.inventory')}</span>
            <button className={`icon-btn ${addOpenFor === 'inventory' ? 'active' : ''}`}
              onClick={() => setAddOpenFor(v => v === 'inventory' ? null : 'inventory')}><Icon id="action.add" size={13} /></button>
          </div>
          <InventoryManager items={state.equipment||[]} onUpdate={equipment => update({ equipment })} onRoll={handleRoll}
            addOpen={addOpenFor === 'inventory'} onAddClose={() => setAddOpenFor(null)}
            allTags={allTags}
            onUpdateTags={(id, tags) => {
              const item = (state.equipment||[]).find(e => e.id===id);
              const upd = { equipment: (state.equipment||[]).map(e => e.id===id ? {...e,tags} : e) };
              if (item) upd.actions = (state.actions||[]).map(a => a.name===item.name ? {...a,tags} : a);
              update(upd);
            }}
            onCreateTag={createTag}
            actionNames={actionNames}
            onAddAction={action => { if (!actionNames.has(action.name)) update({ actions: [...(state.actions||[]), action] }); }}
            onRemoveAction={name => update({ actions: (state.actions||[]).filter(a => a.name !== name) })}
            currentWeightKg={currentWeightKg}
            maxWeightKg={maxWeightKg}
            coinWeightKg={coinWeightKg}
            weightUnit={weightUnit}
            toDisplayWeight={toDisplayWeight} />
        </div>
      );

      case 'traits': {
        const traitsFullWidth = layout.find(w => w.id === 'traits')?.fullWidth ?? true;
        return (
        <div className="card">
          <div className="card-title"><Icon id="widget.traits" /> {t('widgets.traits')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: traitsFullWidth ? '1fr 1fr' : '1fr', gap: 10 }}>
            {[
              ['personality', t('notes.personalityLabel'), t('notes.personalityPlaceholder')],
              ['ideals',      t('notes.idealsLabel'),      t('notes.idealsPlaceholder')],
              ['bonds',       t('notes.bondsLabel'),       t('notes.bondsPlaceholder')],
              ['flaws',       t('notes.flawsLabel'),       t('notes.flawsPlaceholder')],
            ].map(([key,label,ph]) => (
              <Field key={key} label={label}>
                <textarea className="notes-area" placeholder={ph} value={state.notes[key]||''}
                  onChange={e => update({ notes:{...state.notes,[key]:e.target.value} })} />
              </Field>
            ))}
          </div>
        </div>
      );
      }

      case 'freeNotes': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.notes" /> {t('widgets.freeNotes')}</div>
          <textarea className="notes-area" style={{ minHeight:180 }}
            placeholder={t('notes.freeNotesPlaceholder')}
            value={state.notes.free||''} onChange={e => update({ notes:{...state.notes,free:e.target.value} })} />
        </div>
      );

      case 'classFeatures': return (
        <div className="card">
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span><Icon id="widget.spellStats" /> {t('widgets.classFeatures')}</span>
            <button className={`icon-btn ${addOpenFor === 'features' ? 'active' : ''}`}
              onClick={() => setAddOpenFor(v => v === 'features' ? null : 'features')}><Icon id="action.add" size={13} /></button>
          </div>
          <FeatureManager features={state.features||[]} onUpdate={features => update({ features })} onRoll={handleRoll}
            actionNames={actionNames} addOpen={addOpenFor === 'features'} onAddClose={() => setAddOpenFor(null)}
            allTags={allTags}
            onUpdateTags={(id, tags) => {
              const feat = (state.features||[]).find(f => f.id===id);
              const upd = { features: (state.features||[]).map(f => f.id===id ? {...f,tags} : f) };
              if (feat) upd.actions = (state.actions||[]).map(a => a.name===feat.name ? {...a,tags} : a);
              update(upd);
            }}
            onCreateTag={createTag}
            onAddAction={action => { if (!actionNames.has(action.name)) update({ actions: [...(state.actions||[]), action] }); }}
            onRemoveAction={name => update({ actions: (state.actions||[]).filter(a => a.name !== name) })} />
        </div>
      );

      case 'activityLog': return (
        <div className="card">
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span><Icon id="widget.activityLog" /> {t('widgets.activityLog')}</span>
            {activityLog.length > 0 && (
              <button className="icon-btn" onClick={() => {
                setActivityLog([]);
                try { localStorage.removeItem('characterforge_log'); } catch {}
              }}><Icon id="action.delete" size={13} /> {t('activityLog.clearBtn')}</button>
            )}
          </div>
          {activityLog.length === 0
            ? <div className="hint-text">{t('activityLog.empty')}</div>
            : (
              <div className="activity-log-list">
                {activityLog.map(e => (
                  <div key={e.id} className="activity-log-entry">
                    <span className="activity-log-icon"><Icon id={e.icon} size={13} fallback={e.icon} /></span>
                    <span className="activity-log-text">{e.text}</span>
                    <span className="activity-log-ts">{e.ts}</span>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      );

      // ── Daggerheart widgets ──────────────────────────────────────
    default: return null;
  }
}
