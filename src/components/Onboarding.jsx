import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CharContext } from './CharContext';
import { KeywordText, NotationHelpBar } from './Tooltip';
import { TagPill } from './Tags';

export const NOTION_FEEDBACK_URL = 'https://athryell.notion.site/3725e8a752d38094a5bac638b19360e7?pvs=105';
export const KOFI_URL = 'https://ko-fi.com/athryell';
const CROWDIN_URL = 'https://crowdin.com/project/characterforge';
const GITHUB_URL = 'https://github.com/Athryell/CharacterForge';

const STORAGE_KEY = 'characterforge_onboarding_seen';
const TOTAL_STEPS = 9;

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'it', flag: '🇮🇹', label: 'Italiano' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
];

const DEMO_CHAR = {
  abilities: { STR: 16, DEX: 14, CON: 14, INT: 10, WIS: 12, CHA: 8 },
  charLevel: 5,
  profBonus: 3,
};

const DEMO_ALL_TAGS = ['attack', 'utility', 'heal', 'bonus action'];

const NOTATION_ROWS = [
  { syntax: '[STR] [DEX] [CON] [INT] [WIS] [CHA]', effectKey: 'attrRow' },
  { syntax: '[PRO]',                                effectKey: 'proRow' },
  { syntax: '[LVL:1d6,5:1d8]',                     effectKey: 'lvlRow' },
  { syntax: '+2@[AC]',                              effectKey: 'acRow' },
  { syntax: '+1@[INIT]',                            effectKey: 'initRow' },
  { syntax: '+2@[TS-STR]',                          effectKey: 'tsStrRow' },
  { syntax: '[3]',                                  effectKey: 'counterRow' },
];

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
  return (
    <div className="onboarding-lang-picker">
      {LANGUAGES.map(({ code, flag, label }) => (
        <button
          key={code}
          className={`onboarding-lang-btn${i18n.language === code ? ' active' : ''}`}
          onClick={() => i18n.changeLanguage(code)}
          title={label}
        >
          <span className="onboarding-lang-flag">{flag}</span>
          <span className="onboarding-lang-name">{label}</span>
        </button>
      ))}
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
  const [mode, setMode] = useState('welcome');
  const [step, setStep] = useState(0);
  const [demoMsg, setDemoMsg] = useState('');
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

  // Reset demoMsg when step changes
  useEffect(() => { setDemoMsg(''); }, [step]);

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
                  text={"Longsword: 1d8+[STR] slashing\nWith advantage: roll 2d20 and take the highest"}
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
        <>
          <NotationHelpBar />
          <CharContext.Provider value={DEMO_CHAR}>
            <DemoBox label={t('onboarding.demoLabel')}>
              <p className="onboarding-demo-text">
                <KeywordText
                  text={"Attack: 1d20+[PRO]+[STR]\nDamage: [LVL:1d6,5:1d8,11:1d10]+[DEX]\nCharges: [3]\nArmor bonus: +2@[AC]"}
                  onRoll={handleDemoRoll}
                  label="Demo"
                />
              </p>
            </DemoBox>
          </CharContext.Provider>
          <table className="onboarding-notation-table">
            <thead>
              <tr>
                <th>{t('onboarding.notation.syntax')}</th>
                <th>{t('onboarding.notation.effect')}</th>
              </tr>
            </thead>
            <tbody>
              {NOTATION_ROWS.map(({ syntax, effectKey }) => (
                <tr key={effectKey}>
                  <td><code>{syntax}</code></td>
                  <td>{t(`onboarding.notation.${effectKey}`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    }

    if (step === 4) {
      return (
        <>
          <CharContext.Provider value={DEMO_CHAR}>
            <DemoBox label={t('onboarding.demoLabel')}>
              <p className="onboarding-demo-text">
                <KeywordText
                  text={"If you are poisoned you have disadvantage on attack rolls.\nIf you have advantage roll 2d20 and take the highest."}
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
            <TagPill tag="attack"       allTags={DEMO_ALL_TAGS} small />
            <TagPill tag="bonus action" allTags={DEMO_ALL_TAGS} small />
            <TagPill tag="heal"         allTags={DEMO_ALL_TAGS} small />
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
        <button
          className="onboarding-close-x"
          onClick={close}
          ref={closeRef}
          aria-label={t('onboarding.close')}
        >
          ×
        </button>

        {mode === 'welcome' ? (
          <div className="onboarding-screen">
            <div className="onboarding-header">
              <h2 className="onboarding-title">{t('onboarding.welcomeTitle')}</h2>
              <LanguagePicker i18n={i18n} />
            </div>
            <div className="onboarding-body">
              <p>{t('onboarding.welcomeDesc')}</p>
              <p className="onboarding-hint-text">{t('onboarding.welcomeFeedback')}</p>
              <SupportGroup t={t} />
              <a href={CROWDIN_URL} target="_blank" rel="noopener noreferrer" className="onboarding-translate-link">
                {t('onboarding.welcome.translateLink')}
              </a>
            </div>
            <div className="onboarding-footer">
              <button
                className="onboarding-btn onboarding-btn-secondary"
                onClick={() => { setMode('tutorial'); setStep(0); }}
              >
                {t('onboarding.startTutorial')}
              </button>
              <button className="onboarding-btn-ghost" onClick={close}>
                {t('onboarding.skip')}
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
