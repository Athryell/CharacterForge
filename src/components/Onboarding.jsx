import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle } from 'lucide-react';
import { CharContext } from './CharContext';
import { KeywordText } from './Tooltip';
import { TagPill } from './Tags';
import { useAccessibility } from '../hooks/useAccessibility';

export const NOTION_FEEDBACK_URL = 'https://athryell.notion.site/3725e8a752d38094a5bac638b19360e7?pvs=105';
export const KOFI_URL = 'https://ko-fi.com/athryell';
const CROWDIN_URL = 'https://crowdin.com/project/characterforge';
const GITHUB_URL = 'https://github.com/Athryell/CharacterForge';

const STORAGE_KEY = 'characterforge_onboarding_seen';
const TOTAL_STEPS = 9;

const LANGUAGES = [
  { code: 'en', flagCode: 'gb', label: 'English' },
  { code: 'it', flagCode: 'it', label: 'Italiano' },
  { code: 'de', flagCode: 'de', label: 'Deutsch' },
  { code: 'fr', flagCode: 'fr', label: 'Français' },
  { code: 'es', flagCode: 'es', label: 'Español' },
];

const DEMO_CHAR = {
  abilities: { STR: 16, DEX: 14, CON: 14, INT: 10, WIS: 12, CHA: 8 },
  charLevel: 5,
  profBonus: 3,
};

const DEMO_ALL_TAGS = ['utility', 'social', 'super combo'];

export function loadOnboardingSeen() {
  try { return !!JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return false; }
}

function markSeen() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(true)); } catch {}
}

function rollDiceInternal(notation) {
  const clean = notation.replace(/\s/g, '').replace(/\+-/g, '-').replace(/--/g, '+');
  const m = clean.match(/(\d+)d(\d+)/i);
  if (!m) return null;
  let total = 0;
  for (let i = 0; i < parseInt(m[1]); i++) total += Math.floor(Math.random() * parseInt(m[2])) + 1;
  for (const mm of [...clean.matchAll(/([+-]\d+)/g)]) total += parseInt(mm[1]);
  return total;
}

export function CornerButtons({ onHelp }) {
  const { t } = useTranslation();
  return (
    <div className="corner-buttons">
      <button
        className="corner-btn"
        onClick={onHelp}
        aria-label={t('onboarding.tutorialTitle')}
        title={t('onboarding.tutorialTitle')}
      >{t('onboarding.helpBtn')}</button>
    </div>
  );
}

function SupportGroup({ t }) {
  return (
    <div className="onboarding-support-group">
      <a href={NOTION_FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className="onboarding-btn onboarding-btn-accent" onClick={() => window.umami?.track('feedback-clicked')}>
        {t('onboarding.feedbackBtn')}
      </a>
      {/* <a href={KOFI_URL} target="_blank" rel="noopener noreferrer" className="onboarding-btn onboarding-btn-kofi" onClick={() => window.umami?.track('kofi-clicked')}>
        {t('onboarding.kofiBtn')}
      </a>
      <span className="onboarding-kofi-desc">{t('onboarding.kofiDesc')}</span> */}
    </div>
  );
}

function LanguagePicker({ i18n }) {
  const { t } = useTranslation();
  return (
    <div className="onboarding-lang-picker">
      {LANGUAGES.map(({ code, flagCode, label }) => (
        <button
          key={code}
          className={`onboarding-lang-btn${i18n.language === code ? ' active' : ''}`}
          onClick={() => i18n.changeLanguage(code)}
          title={label}
        >
          <img src={`https://flagcdn.com/24x18/${flagCode}.png`} alt={label} style={{ borderRadius: '2px', verticalAlign: 'middle' }} />
          <span className="onboarding-lang-name">{label}</span>
        </button>
      ))}
      <span className="hint-text">{t('onboarding.andMore')}</span>
    </div>
  );
}

function A11yPanel({ a11y, setA11y, onClose, t }) {
  return (
    <div className="onboarding-screen">
      <div className="onboarding-header">
        <h2 className="onboarding-title">{t('accessibility.title')}</h2>
      </div>
      <div className="onboarding-body">
        <div className="hmenu-section">
          <div className="hmenu-label">{t('accessibility.font')}</div>
          <div className="hmenu-row">
            {[
              { value: 'default',      label: t('accessibility.fontDefault') },
              { value: 'atkinson',     label: 'Atkinson Hyperlegible' },
              { value: 'opendyslexic', label: 'OpenDyslexic' },
            ].map(opt => (
              <button key={opt.value}
                className={`hmenu-item ${a11y.font === opt.value ? 'active' : ''}`}
                onClick={() => setA11y('font', opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="hmenu-section">
          <div className="hmenu-label">{t('accessibility.textSize')}</div>
          <div className="hmenu-row">
            {[
              { value: 'small',  label: t('accessibility.sizeSmall')  },
              { value: 'normal', label: t('accessibility.sizeNormal') },
              { value: 'large',  label: t('accessibility.sizeLarge')  },
              { value: 'xlarge', label: t('accessibility.sizeXLarge') },
            ].map(opt => (
              <button key={opt.value}
                className={`hmenu-item ${a11y.textSize === opt.value ? 'active' : ''}`}
                onClick={() => setA11y('textSize', opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="hmenu-section">
          <div className="hmenu-label">{t('accessibility.contrast')}</div>
          <div className="hmenu-row">
            {[
              { value: 'default', label: t('accessibility.contrastDefault') },
              { value: 'high',    label: t('accessibility.contrastHigh')    },
            ].map(opt => (
              <button key={opt.value}
                className={`hmenu-item ${a11y.contrast === opt.value ? 'active' : ''}`}
                onClick={() => setA11y('contrast', opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '4px 0 8px' }}>
          <label className="hmenu-toggle">
            <input type="checkbox"
              checked={a11y.largeTargets}
              onChange={e => setA11y('largeTargets', e.target.checked)} />
            <span>{t('accessibility.largeTargets')}</span>
          </label>
        </div>
      </div>
      <div className="onboarding-footer">
        <div />
        <button className="onboarding-btn onboarding-btn-accent" onClick={onClose}>
          {t('common.done', 'Done')}
        </button>
      </div>
    </div>
  );
}

function DemoBox({ label, children }) {
  return (
    <div className="onboarding-demo-box">
      <span className="onboarding-demo-label">{label}</span>
      {children}
    </div>
  );
}

export default function Onboarding({ onClose, onRoll: externalOnRoll }) {
  const { t, i18n } = useTranslation();
  const { prefs: a11y, setPref: setA11y } = useAccessibility();
  const [mode, setMode] = useState('welcome');
  const [step, setStep] = useState(0);
  const [showA11yPanel, setShowA11yPanel] = useState(false);
  const [demoMsg, setDemoMsg] = useState('');
  const [demoCounters, setDemoCounters] = useState({});
  const overlayRef = useRef();
  const closeRef = useRef();
  const demoMsgTimer = useRef();

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') { markSeen(); onClose(); }
    }
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => { setDemoMsg(''); setDemoCounters({}); }, [step]);

  function close() { markSeen(); onClose(); }

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) close();
  }

  function handleDemoRoll(notation, name) {
    if (externalOnRoll) { externalOnRoll(notation, name); return; }
    const total = rollDiceInternal(notation);
    if (total === null) return;
    setDemoMsg(`${name}: ${total}`);
    clearTimeout(demoMsgTimer.current);
    demoMsgTimer.current = setTimeout(() => setDemoMsg(''), 2500);
  }

  function handleDemoCounterChange(idx, values) {
    setDemoCounters(prev => ({ ...prev, [idx]: values }));
  }

  function renderStepText(stepIdx) {
    if (stepIdx === 0) return <p>{t('onboarding.community.body')}</p>;
    const text = t(`onboarding.step${stepIdx}Text`);
    const points = t(`onboarding.step${stepIdx}Points`, { returnObjects: true });
    const footer = t(`onboarding.step${stepIdx}Footer`, { defaultValue: '' });
    return (
      <>
        {text && <p>{text}</p>}
        {Array.isArray(points) && points.length > 0 && (
          <ul className="onboarding-points">
            {points.map((pt, i) => <li key={i}>{pt}</li>)}
          </ul>
        )}
        {footer && <p className="onboarding-points-footer">{footer}</p>}
      </>
    );
  }

  function renderStepDemo() {
    // step index: 0=Community, 2=Dice, 3=Notation, 4=Keywords, 6=Tags
    if (step === 0) {
      return (
        <div className="onboarding-community-btns">
          <a href={CROWDIN_URL} target="_blank" rel="noopener noreferrer" className="onboarding-btn onboarding-btn-secondary">
            {t('onboarding.community.translateBtn')}
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="onboarding-btn onboarding-btn-secondary">
            {t('onboarding.community.contributBtn')}
          </a>
          <p className="onboarding-demo-note">{t('onboarding.community.note')}</p>
        </div>
      );
    }

    if (step === 2) {
      return (
        <>
          <CharContext.Provider value={DEMO_CHAR}>
            <DemoBox label={t('onboarding.demoLabel')}>
              <p className="onboarding-demo-text">
                <KeywordText
                  text={"Longsword: 1d8+3 slashing"}
                  onRoll={handleDemoRoll}
                  label="Demo"
                />
              </p>
            </DemoBox>
          </CharContext.Provider>
          <p className="onboarding-demo-note">{t('onboarding.diceNote')}</p>
        </>
      );
    }

    if (step === 3) {
      return (
        <div className="onboarding-notation-layout">
          <CharContext.Provider value={DEMO_CHAR}>
            <DemoBox label={t('onboarding.demoLabel')}>
              <p className="onboarding-demo-text">
                <KeywordText
                  text={"Attack: 1d20+[PRO]+[STR]\nBardic Inspiration: uses [CHA], die [LVL=1:d6,5:d8]\nCharges: [3]\nArmor bonus: +2@[AC]"}
                  onRoll={handleDemoRoll}
                  label="Demo"
                  counters={demoCounters}
                  onCounterChange={handleDemoCounterChange}
                />
              </p>
            </DemoBox>
          </CharContext.Provider>
          <div className="onboarding-notation-sidebar">
            <p className="onboarding-notation-sidebar-hint">💡 {t('notation.slashHint')}</p>
            <ul className="onboarding-notation-sidebar-list">
              <li><code>[STR] [DEX]… [PRO]</code> → {t('notation.attrHelp')}</li>
              <li><code>[LVL=1:1d6,5:1d8]</code> → {t('notation.lvlHelp')}</li>
              <li><code>[3]</code> → {t('notation.counterHelp')}</li>
              <li><code>+2@[AC]</code> → {t('notation.bonusHelp')}</li>
            </ul>
          </div>
        </div>
      );
    }

    if (step === 4) {
      return (
        <>
          <CharContext.Provider value={DEMO_CHAR}>
            <DemoBox label={t('onboarding.demoLabel')}>
              <p className="onboarding-demo-text">
                <KeywordText
                  text={"If you are poisoned you have disadvantage on attack rolls."}
                  onRoll={handleDemoRoll}
                  label="Demo"
                />
              </p>
            </DemoBox>
          </CharContext.Provider>
          <p className="onboarding-demo-note">{t('onboarding.keywordNote')}</p>
        </>
      );
    }

    if (step === 6) {
      return (
        <>
          <div className="onboarding-tags-demo">
            <TagPill tag="utility"    allTags={DEMO_ALL_TAGS} small />
            <TagPill tag="social"     allTags={DEMO_ALL_TAGS} small />
            <TagPill tag="super combo" allTags={DEMO_ALL_TAGS} small />
          </div>
          <p className="onboarding-demo-note">{t('onboarding.tagNote')}</p>
        </>
      );
    }

    return null;
  }

  const isLast = step === TOTAL_STEPS - 1;

  return (
    <div className="onboarding-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="onboarding-modal" role="dialog" aria-modal="true">
        {!showA11yPanel && (
          <button
            className="onboarding-close-x"
            onClick={close}
            ref={closeRef}
            aria-label={t('onboarding.close')}
          >
            ×
          </button>
        )}

        {showA11yPanel ? (
          <A11yPanel a11y={a11y} setA11y={setA11y} onClose={() => setShowA11yPanel(false)} t={t} />
        ) : mode === 'welcome' ? (
          <div className="onboarding-screen">
            <div className="onboarding-header">
              <div className="onboarding-header-top">
                <h2 className="onboarding-title">{t('onboarding.welcome.title')}</h2>
                <button className="filter-chip" onClick={() => setShowA11yPanel(true)}>
                  ♿ {t('onboarding.a11yTag')}
                </button>
              </div>
              <LanguagePicker i18n={i18n} />
              <a href={CROWDIN_URL} target="_blank" rel="noopener noreferrer" className="filter-chip" style={{ marginTop: 10, display: 'inline-flex' }}>
                {t('onboarding.welcome.translateLink')}
              </a>
            </div>
            <div className="onboarding-body">
              <p className="onboarding-intro"><strong>{t('onboarding.whyTitle')}</strong></p>
              <p className="onboarding-intro">{t('onboarding.whyIntro')}</p>
              <div className="onboarding-features">
                {[
                  { icon: '🎲', titleKey: 'why1title', descKey: 'why1desc' },
                  { icon: '⚡', titleKey: 'why2title', descKey: 'why2desc' },
                  { icon: '♿', titleKey: 'why3title', descKey: 'why3desc' },
                  { icon: '🎨', titleKey: 'why4title', descKey: 'why4desc' },
                  { icon: '🧙', titleKey: 'why5title', descKey: 'why5desc' },
                ].map(({ icon, titleKey, descKey }) => (
                  <div key={titleKey} className="onboarding-feature-row">
                    <span className="onboarding-feature-icon">{icon}</span>
                    <div>
                      <strong>{t(`onboarding.${titleKey}`)}</strong>
                      <span> — {t(`onboarding.${descKey}`)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="onboarding-feedback-note">{t('onboarding.whyOutro')}</p>
              <div className="onboarding-support-group">
                <a href={NOTION_FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className="onboarding-btn onboarding-btn-accent" onClick={() => window.umami?.track('feedback-clicked')}>
                  {t('onboarding.welcome.feedbackBtn')}
                </a>
              </div>
            </div>
            <div className="onboarding-footer">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <button className="onboarding-btn-ghost" onClick={close}>
                  {t('onboarding.welcome.skipBtn')}
                </button>
                <p className="onboarding-skip-hint">
                  {t('onboarding.skipHint')} <HelpCircle size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </p>
              </div>
              <button
                className="onboarding-btn onboarding-btn-accent"
                onClick={() => { setMode('tutorial'); setStep(0); }}
              >
                {t('onboarding.welcome.tutorialBtn')}
              </button>
            </div>
          </div>
        ) : (
          <div className="onboarding-screen" key={step}>
            <div className="onboarding-header">
              <div className="onboarding-step-label">
                {t('onboarding.stepOf', { current: step + 1, total: TOTAL_STEPS })}
              </div>
              <h2 className="onboarding-title">
                {step === 0 ? t('onboarding.community.title') : t(`onboarding.step${step}Title`)}
              </h2>
            </div>
            <div className="onboarding-body">
              {renderStepText(step)}
              {renderStepDemo()}
              {demoMsg && <div className="onboarding-demo-toast">{demoMsg}</div>}
              {isLast && <SupportGroup t={t} />}
            </div>
            <div className="onboarding-footer">
              <div className="onboarding-progress">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                  <span
                    key={i}
                    className={`onboarding-dot${i === step ? ' active' : i < step ? ' done' : ''}`}
                  />
                ))}
              </div>
              <div className="onboarding-nav">
                {step > 0 && (
                  <button className="onboarding-btn-ghost" onClick={() => setStep(s => s - 1)}>
                    {t('onboarding.prev')}
                  </button>
                )}
                <button
                  className={`onboarding-btn ${isLast ? 'onboarding-btn-accent' : 'onboarding-btn-secondary'}`}
                  onClick={() => { if (isLast) close(); else setStep(s => s + 1); }}
                >
                  {isLast ? t('onboarding.startPlaying') : t('onboarding.next')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
