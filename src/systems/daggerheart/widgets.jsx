import React from 'react';
import { Icon } from '../../config/icons';
import { Field } from '../../components/sheet';
import { DHDomainCardForm, DHPipRow } from './parts';
import ActionManager from '../../components/ActionManager';
import ConditionTracker from '../../components/ConditionTracker';
import InventoryManager from '../../components/InventoryManager';
import DHWeaponManager from './components/DHWeaponManager';
import DHArmorManager from './components/DHArmorManager';
import { DH_TRAITS, DH_TRAIT_NAMES, getDHTier, rollDualityDice } from './data/mechanics';

// The Daggerheart sheet. Moved verbatim out of App.jsx renderWidget; the
// destructuring below reproduces the closure the switch used to sit in.

export function render(id, ctx) {
  const {
    core:    { state, update, t },
    ui, derived, shell,
  } = ctx;
  const {
    editingDHEvasion, setEditingDHEvasion, dhOpenFeature, setDhOpenFeature,
    editingIdentity, setEditingIdentity, editingAbilities, setEditingAbilities,
    editingHP, setEditingHP,
    addOpenFor, setAddOpenFor,
    dhClasses, dhDomains, dhAncestries, dhCommunities, dhTraitUses,
  } = ui;
  const { actionNames } = derived;
  const {
    handleRoll, addLog, showToast, createTag, allTags,
  } = shell;

  switch (id) {

      case 'dh-identity': {
        const dhClass = dhClasses.find(c => c.id === state.charClass);
        return (
          <div className={`card${editingIdentity ? ' content-editing' : ''}`}>
            <div className="card-title" style={{ justifyContent:'space-between' }}>
              <span><Icon id="widget.identity" /> {t('dh.widgets.identity','Identity')}</span>
              <button className={`icon-btn ${editingIdentity ? 'active' : ''}`} onClick={() => setEditingIdentity(v => !v)}>
                {editingIdentity ? <Icon id="action.done" size={14} /> : <Icon id="action.edit" size={14} />}
              </button>
            </div>
            {editingIdentity ? (
              <div className="grid-2">
                <Field label={t('creator.nameLabel')}><input value={state.charName||''} onChange={e => update({ charName: e.target.value })} /></Field>
                <Field label={t('identity.class')}>
                  <select value={state.charClass||''} onChange={e => {
                    const cls = dhClasses.find(c => c.id === e.target.value);
                    update({ charClass: e.target.value, charSubclass:'', evasion: cls?.evasion||10, hpMax: cls?.hp||6, stressMax: cls?.stress||6 });
                    setDhOpenFeature(null);
                  }}>
                    <option value="">—</option>
                    {dhClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label={t('dh.subclass','Subclass')}>
                  <select value={state.charSubclass||''} onChange={e => update({ charSubclass: e.target.value })} disabled={!dhClass}>
                    <option value="">—</option>
                    {(dhClass?.subclasses||[]).map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                </Field>
                <Field label={t('dh.ancestry','Ancestry')}>
                  <select value={state.ancestry||''} onChange={e => update({ ancestry: e.target.value })}>
                    <option value="">—</option>
                    {dhAncestries.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </Field>
                <Field label={t('dh.community','Community')}>
                  <select value={state.community||''} onChange={e => update({ community: e.target.value })}>
                    <option value="">—</option>
                    {dhCommunities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label={t('identity.level')}>
                  <div className="hp-stepper" style={{ gap:4 }}>
                    <button className="mod-btn" onClick={() => { const lv=Math.max(1,(state.charLevel||1)-1); update({ charLevel:lv, proficiency:getDHTier(lv) }); }}>−</button>
                    <input type="number" min="1" max="10" style={{ width:50, textAlign:'center' }} value={state.charLevel||1}
                      onChange={e => { const lv=Math.max(1,Math.min(10,parseInt(e.target.value)||1)); update({ charLevel:lv, proficiency:getDHTier(lv) }); }} />
                    <button className="mod-btn" onClick={() => { const lv=Math.min(10,(state.charLevel||1)+1); update({ charLevel:lv, proficiency:getDHTier(lv) }); }}>+</button>
                  </div>
                </Field>
                <Field label={t('dh.proficiency','Proficiency')}>
                  <div className="hp-stepper" style={{ gap:4 }}>
                    <button className="mod-btn" onClick={() => update({ proficiency:Math.max(getDHTier(state.charLevel||1),(state.proficiency||1)-1) })}>−</button>
                    <input type="number" style={{ width:50, textAlign:'center' }} value={state.proficiency||1}
                      onChange={e => update({ proficiency:Math.max(getDHTier(state.charLevel||1),parseInt(e.target.value)||1) })} />
                    <button className="mod-btn" onClick={() => update({ proficiency:(state.proficiency||1)+1 })}>+</button>
                  </div>
                </Field>
              </div>
            ) : (
              <div className="identity-info-grid">
                {[
                  [t('identity.name'), state.charName||'—'],
                  [t('identity.class'), dhClass?.name||'—'],
                  [t('dh.subclass','Subclass'), state.charSubclass||'—'],
                  [t('dh.ancestry','Ancestry'), state.ancestry||'—'],
                  [t('dh.community','Community'), state.community||'—'],
                  [t('identity.level'), `${state.charLevel||1} (Tier ${getDHTier(state.charLevel||1)})`],
                  [t('dh.proficiency','Proficiency'), `+${state.proficiency||getDHTier(state.charLevel||1)}`],
                ].map(([label,val]) => (
                  <div key={label} className="identity-info-item">
                    <div className="identity-info-label">{label}</div>
                    <div className="identity-info-val">{val}</div>
                  </div>
                ))}
              </div>
            )}
            {dhClass?.features?.length > 0 && (
              <div className="dh-class-features">
                <div className="dh-class-features-title">{t('dh.classFeatures','Class Features')}</div>
                {dhClass.features.map(feat => (
                  <div key={feat.name} className={`dh-class-feature-item${dhOpenFeature === feat.name ? ' open' : ''}`}
                    onClick={() => setDhOpenFeature(dhOpenFeature === feat.name ? null : feat.name)}>
                    <div className="dh-class-feature-header">
                      <span className="dh-class-feature-name">{feat.name}</span>
                      <span className="dh-class-feature-chevron">{dhOpenFeature === feat.name ? '▲' : '▼'}</span>
                    </div>
                    {dhOpenFeature === feat.name && (
                      <div className="dh-class-feature-desc">{feat.desc}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      case 'dh-traits': {
        const traits = state.traits || { AGI:0, STR:0, FIN:0, INS:0, PRE:0, KNO:0 };
        return (
          <div className={`card${editingAbilities ? ' content-editing' : ''}`}>
            <div className="card-title" style={{ justifyContent:'space-between' }}>
              <span><Icon id="widget.abilities" /> {t('dh.widgets.traits','Traits')}</span>
              <button className={`icon-btn ${editingAbilities ? 'active' : ''}`} onClick={() => setEditingAbilities(v => !v)}>
                {editingAbilities ? <Icon id="action.done" size={14} /> : <Icon id="action.edit" size={14} />}
              </button>
            </div>
            <div className="grid-6">
              {DH_TRAITS.map(tr => {
                const mod = traits[tr] ?? 0;
                return (
                  <div key={tr} className={`ability-box ${editingAbilities ? 'editing' : ''}`}>
                    <div className="ability-label">{t(`dh.traits.${tr}`, DH_TRAIT_NAMES[tr])}</div>
                    {editingAbilities ? (
                      <div className="hp-stepper" style={{ gap:2, justifyContent:'center' }}>
                        <button className="mod-btn" onClick={() => update({ traits:{ ...traits, [tr]:mod-1 } })}>−</button>
                        <span style={{ minWidth:20, textAlign:'center', fontWeight:700 }}>{mod>=0?`+${mod}`:mod}</span>
                        <button className="mod-btn" onClick={() => update({ traits:{ ...traits, [tr]:mod+1 } })}>+</button>
                      </div>
                    ) : (
                      <>
                        <div className="ability-mod" style={{ cursor:'pointer' }} onClick={() => {
                          const res = rollDualityDice(mod);
                          const trName = t(`dh.traits.${tr}`, DH_TRAIT_NAMES[tr]);
                          let msg;
                          if (res.result==='critical') msg = `Critical! Both dice show ${res.hopeRoll} = ${res.total}`;
                          else if (res.result==='hope') msg = `${trName}: Hope ${res.hopeRoll} + Fear ${res.fearRoll} = ${res.total} → Success with Hope! ⭐`;
                          else if (res.result==='fear') msg = `${trName}: Fear ${res.fearRoll} + Hope ${res.hopeRoll} = ${res.total} → Success with Fear!`;
                          else msg = `${trName}: ${res.total} → Failure`;
                          showToast(msg); addLog('game.roll', msg);
                        }}>{mod>=0?`+${mod}`:mod}</div>
                        <div style={{ fontSize:9, color:'var(--c-muted)', textAlign:'center', padding:'0 2px 3px' }}>{dhTraitUses[tr]}</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            {editingAbilities && (
              <p className="hint-text" style={{ marginTop:8 }}>
                Array: {[2,1,1,0,0,-1].map(v => v>=0?`+${v}`:v).join(', ')}
              </p>
            )}
          </div>
        );
      }

      case 'dh-experiences': {
        const experiences = state.experiences || [];
        return (
          <div className="card">
            <div className="card-title" style={{ justifyContent:'space-between' }}>
              <span><Icon id="widget.inspiration" /> {t('dh.experiences','Experiences')}</span>
              <button className="icon-btn" onClick={() => update({ experiences:[...experiences,{ name:'', modifier:2 }] })}><Icon id="action.add" size={13} /></button>
            </div>
            {experiences.map((exp, i) => (
              <div key={i} className="field-row" style={{ alignItems:'center', marginBottom:6 }}>
                <input style={{ flex:1 }} value={exp.name} placeholder="Experience name..."
                  onChange={e => update({ experiences: experiences.map((x,j) => j===i ? {...x, name:e.target.value} : x) })} />
                <div className="hp-stepper" style={{ gap:2 }}>
                  <button className="mod-btn" onClick={() => update({ experiences: experiences.map((x,j) => j===i ? {...x, modifier:(x.modifier||2)-1} : x) })}>−</button>
                  <span style={{ minWidth:24, textAlign:'center', fontWeight:700, fontSize:13 }}>{(exp.modifier||0)>=0?`+${exp.modifier||0}`:exp.modifier}</span>
                  <button className="mod-btn" onClick={() => update({ experiences: experiences.map((x,j) => j===i ? {...x, modifier:(x.modifier||2)+1} : x) })}>+</button>
                </div>
                <button className="mod-btn" style={{ color:'var(--c-muted)', marginLeft:4 }} onClick={() => update({ experiences: experiences.filter((_,j) => j!==i) })}><Icon id="action.remove" size={13} /></button>
              </div>
            ))}
            {experiences.length === 0 && <p className="hint-text">No experiences yet. Click + to add one.</p>}
            <p className="hint-text" style={{ marginTop:6 }}>Spend 1 Hope to add a relevant Experience to your roll.</p>
          </div>
        );
      }

      case 'dh-domains': {
        const dhClassD = dhClasses.find(c => c.id === state.charClass);
        const classDomains = dhClassD ? dhDomains.filter(d => dhClassD.domains.includes(d.id)) : [];
        const domainCards = state.domainCards || [];
        return (
          <div className="card">
            <div className="card-title" style={{ justifyContent:'space-between' }}>
              <span><Icon id="widget.spells" /> {t('dh.domains','Domain Cards')}</span>
              <button className={`icon-btn ${addOpenFor==='dh-domains'?'active':''}`}
                onClick={() => setAddOpenFor(v => v==='dh-domains'?null:'dh-domains')}><Icon id="action.add" size={13} /></button>
            </div>
            {classDomains.length > 0 && (
              <div style={{ marginBottom:8, paddingBottom:8, borderBottom:'0.5px solid var(--c-border)' }}>
                {classDomains.map(d => (
                  <div key={d.id} style={{ display:'flex', gap:6, alignItems:'baseline', marginBottom:3 }}>
                    <span style={{ fontWeight:600, fontSize:12 }}>{d.name}</span>
                    <span style={{ fontSize:11, color:'var(--c-muted)' }}>{d.desc}</span>
                  </div>
                ))}
              </div>
            )}
            {addOpenFor === 'dh-domains' && (
              <DHDomainCardForm domains={dhDomains}
                onAdd={card => { update({ domainCards:[...domainCards,{ ...card, id:Date.now() }] }); setAddOpenFor(null); }}
                onCancel={() => setAddOpenFor(null)} t={t} />
            )}
            {domainCards.length === 0 && addOpenFor !== 'dh-domains' && <p className="hint-text">No domain cards yet.</p>}
            {domainCards.map(card => (
              <div key={card.id} className="check-item" style={{ alignItems:'flex-start', marginBottom:4 }}>
                <div style={{ flex:1 }}>
                  <span style={{ fontWeight:600, fontSize:13 }}>{card.name}</span>
                  {card.domain && <span style={{ fontSize:11, color:'var(--c-muted)', marginLeft:6 }}>{card.domain}{card.level ? ` · Lv.${card.level}` : ''}</span>}
                  {card.desc && <div style={{ fontSize:12, color:'var(--c-muted)', marginTop:2 }}>{card.desc}</div>}
                </div>
                <button className="mod-btn" style={{ color:'var(--c-muted)' }} onClick={() => update({ domainCards: domainCards.filter(c => c.id!==card.id) })}><Icon id="action.remove" size={13} /></button>
              </div>
            ))}
          </div>
        );
      }

      case 'dh-vitals': {
        const hpCur = state.hpCurrent ?? 0;
        const hpMax = state.hpMax ?? 6;
        const stressCur = state.stressCurrent ?? 0;
        const stressMax = state.stressMax ?? 6;
        const hopeCur = state.hope ?? 0;
        const hopeMax = state.hopeMax ?? 6;
        const numericV = state.dhCounterMode === 'numeric';
        const VitalRow = ({ label, cur, max, pipClass, setCur, setMax, maxKey }) => (
          <div className="dh-vitals-section">
            <div className="dh-vitals-label">
              <span>{label}</span>
              <span className="dh-vitals-count">{cur} / {max}</span>
            </div>
            {numericV ? (
              <div className="hp-stepper" style={{ gap:4 }}>
                <button className="mod-btn" onClick={() => setCur(Math.max(0, cur - 1))}>−</button>
                <input type="number" className="hp-input" value={cur} onChange={e => setCur(Math.max(0, Math.min(max, parseInt(e.target.value)||0)))} />
                <button className="mod-btn" onClick={() => setCur(Math.min(max, cur + 1))}>+</button>
              </div>
            ) : (
              <DHPipRow current={cur} max={max} pipClass={pipClass} onToggle={setCur} />
            )}
            {editingHP && (
              <div className="dh-vitals-max-row">
                <span>Max</span>
                <button className="mod-btn" onClick={() => setMax(Math.max(1, max - 1))}>−</button>
                <span className="dh-vitals-max-val">{max}</span>
                <button className="mod-btn" onClick={() => setMax(max + 1)}>+</button>
              </div>
            )}
          </div>
        );
        return (
          <div className={`card${editingHP ? ' content-editing' : ''}`}>
            <div className="card-title" style={{ justifyContent:'space-between' }}>
              <span><Icon id="widget.hp" /> {t('dh.widgets.vitals','Vitals')}</span>
              <button className={`icon-btn ${editingHP?'active':''}`} onClick={() => setEditingHP(v => !v)}>
                {editingHP ? <Icon id="action.done" size={14} /> : <Icon id="action.edit" size={14} />}
              </button>
            </div>
            <VitalRow label="Hit Points" cur={hpCur} max={hpMax} pipClass="dh-hp-pip"
              setCur={v => update({ hpCurrent:v })} setMax={v => update({ hpMax:v })} />
            <VitalRow label="Stress" cur={stressCur} max={stressMax} pipClass="dh-stress-pip"
              setCur={v => update({ stressCurrent:v })} setMax={v => update({ stressMax:v })} />
            <VitalRow label={<><Icon id="game.hope" size={12} /> Hope</>} cur={hopeCur} max={hopeMax} pipClass="dh-hope-pip"
              setCur={v => update({ hope:v })} setMax={v => update({ hopeMax:v })} />
            {editingHP && (
              <label className="dh-counter-mode-toggle">
                <input type="checkbox" checked={numericV}
                  onChange={e => update({ dhCounterMode: e.target.checked ? 'numeric' : 'pip' })} />
                Contatori numerici
              </label>
            )}
          </div>
        );
      }

      case 'dh-evasion': {
        const numericE = state.dhCounterMode === 'numeric';
        return (
          <div className={`card${editingDHEvasion ? ' content-editing' : ''}`}>
            <div className="card-title" style={{ justifyContent:'space-between' }}>
              <span><Icon id="widget.saves" /> {t('dh.widgets.evasion','Evasion & Armor')}</span>
              <button className={`icon-btn ${editingDHEvasion?'active':''}`} onClick={() => setEditingDHEvasion(v => !v)}>
                {editingDHEvasion ? <Icon id="action.done" size={14} /> : <Icon id="action.edit" size={14} />}
              </button>
            </div>
            <div className="dh-evasion-row" style={{ marginBottom: 10 }}>
              <div className="dh-evasion-box">
                <div className="dh-evasion-label">{t('dh.evasion','Evasion')}</div>
                {editingDHEvasion
                  ? <input type="number" className="dh-evasion-input" value={state.evasion||10} onChange={e => update({ evasion:parseInt(e.target.value)||10 })} />
                  : <div className="dh-evasion-val">{state.evasion||10}</div>}
              </div>
            </div>
            <DHArmorManager
              armorName={state.armorName||''}
              armorFeature={state.armorFeature||''}
              thresholdMinor={state.thresholdMinor||0}
              thresholdMajor={state.thresholdMajor||0}
              thresholdSevere={state.thresholdSevere||0}
              armorSlotsMax={state.armorSlotsMax??0}
              armorSlots={state.armorSlots??0}
              charLevel={state.charLevel||1}
              numericMode={numericE}
              onUpdate={update}
            />
            {editingDHEvasion && (
              <label className="dh-counter-mode-toggle" style={{ marginTop: 8 }}>
                <input type="checkbox" checked={numericE}
                  onChange={e => update({ dhCounterMode: e.target.checked ? 'numeric' : 'pip' })} />
                Contatori numerici
              </label>
            )}
          </div>
        );
      }
      case 'dh-actions':
        return (
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

      case 'dh-conditions': return (
        <ConditionTracker
          active={state.conditions || []}
          onChange={conditions => update({ conditions })}
        />
      );

      case 'dh-weapons': return (
        <div className="card">
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span><Icon id="widget.weapons" /> {t('dh.widgets.weapons','Weapons')}</span>
            <button className={`icon-btn ${addOpenFor==='dh-weapons'?'active':''}`}
              onClick={() => setAddOpenFor(v => v==='dh-weapons'?null:'dh-weapons')}><Icon id="action.add" size={13} /></button>
          </div>
          <DHWeaponManager
            weapons={state.weapons||[]}
            proficiency={state.proficiency||1}
            onUpdate={weapons => update({ weapons })}
            onRoll={handleRoll}
            addOpen={addOpenFor==='dh-weapons'}
            onAddClose={() => setAddOpenFor(null)}
          />
        </div>
      );

      case 'dh-inventory': return (
        <div className="card">
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span><Icon id="tab.inventory" /> {t('dh.widgets.inventory','Inventory')}</span>
            <button className={`icon-btn ${addOpenFor==='dh-inventory'?'active':''}`}
              onClick={() => setAddOpenFor(v => v==='dh-inventory'?null:'dh-inventory')}><Icon id="action.add" size={13} /></button>
          </div>
          <InventoryManager
            items={state.equipment||[]}
            onUpdate={equipment => update({ equipment })}
            onRoll={handleRoll}
            allTags={allTags}
            onUpdateTags={(id,tags) => {
              const item = (state.equipment||[]).find(i => i.id===id);
              const upd = { equipment:(state.equipment||[]).map(i => i.id===id?{...i,tags}:i) };
              if (item) upd.actions = (state.actions||[]).map(a => a.name===item.name?{...a,tags}:a);
              update(upd);
            }}
            onCreateTag={createTag}
            actionNames={actionNames}
            onAddAction={action => { if (!actionNames.has(action.name)) update({ actions:[...(state.actions||[]),action] }); }}
            onRemoveAction={name => update({ actions:(state.actions||[]).filter(a => a.name!==name) })}
            hideWeight
            addOpen={addOpenFor==='dh-inventory'} onAddClose={() => setAddOpenFor(null)}
          />
        </div>
      );

      case 'dh-gold': {
        // gold stored as flat handfuls. 10 handfuls = 1 bag, 10 bags = 1 chest.
        const total = state.gold || 0;
        const handfuls = total % 10;
        const bags = Math.floor(total / 10) % 10;
        const chests = Math.floor(total / 100);
        const setTotal = v => update({ gold: Math.max(0, v) });
        return (
          <div className="card">
            <div className="card-title"><Icon id="widget.currency" /> {t('dh.gold','Gold')}</div>
            <div className="dh-gold-denoms">
              <div className="dh-gold-denom">
                <div className="dh-gold-denom-label">🪙 Chests</div>
                <div className="dh-pip-row">
                  <span className={`dh-pip dh-gold-pip${chests > 0 ? ' on' : ''}`}
                    onClick={() => setTotal((chests > 0 ? 0 : 100) + bags*10 + handfuls)} />
                </div>
                <span className="dh-gold-denom-count">{chests} / 1</span>
              </div>
              <div className="dh-gold-denom">
                <div className="dh-gold-denom-label">👝 Bags</div>
                <div className="dh-pip-row">
                  {Array.from({ length: 9 }).map((_,i) => (
                    <span key={i}
                      className={`dh-pip dh-gold-pip${i < bags ? ' on' : ''}`}
                      onClick={() => setTotal(chests*100 + (i < bags ? i : i+1)*10 + handfuls)} />
                  ))}
                </div>
                <span className="dh-gold-denom-count">{bags} / 9</span>
              </div>
              <div className="dh-gold-denom">
                <div className="dh-gold-denom-label">🤏 Handfuls</div>
                <div className="dh-pip-row">
                  {Array.from({ length: 9 }).map((_,i) => (
                    <span key={i}
                      className={`dh-pip dh-gold-pip${i < handfuls ? ' on' : ''}`}
                      onClick={() => setTotal(chests*100 + bags*10 + (i < handfuls ? i : i+1))} />
                  ))}
                </div>
                <span className="dh-gold-denom-count">{handfuls} / 9</span>
              </div>
            </div>
          </div>
        );
      }

      case 'dh-notes': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.notes" /> {t('dh.widgets.notes','Notes')}</div>
          <div className="trait-grid">
            {[
              ['background', 'Background Questions', 'What drives your character?'],
              ['connections', 'Connections', 'Who are your allies, rivals, loved ones?'],
              ['free', 'Free Notes', 'Session notes, clues, reminders...'],
            ].map(([key,label,ph]) => (
              <Field key={key} label={label}>
                <textarea className="notes-area" placeholder={ph}
                  value={(state.notes||{})[key]||''}
                  onChange={e => update({ notes:{ ...(state.notes||{}), [key]:e.target.value } })} />
              </Field>
            ))}
          </div>
        </div>
      );

    default: return null;
  }
}
