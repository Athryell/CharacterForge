import { defineSystem } from '../contract';
import meta         from './meta';
import capabilities from './capabilities';
import icons        from './icons';
import notation     from './notation';
import homebrew     from './homebrew';
import layout       from './layout';
import state        from './state';
import rules, { contextValue } from './rules';
import * as widgets from './widgets';
import * as modals  from './modals';
import adapter      from './data/adapter';
import CustomCreatorBridge from './components/CustomCreatorBridge';
import i18nEn from './i18n/ui.i18n.json';
import i18nIt from './i18n/ui.i18n.it.json';

export default defineSystem({
  meta,
  capabilities,
  icons,
  notation,
  homebrew,
  layout,
  state,
  rules,
  contextValue,
  widgets,
  modals,
  data:    adapter,
  creator: CustomCreatorBridge,
  // No de/fr/es bundle yet — Crowdin hasn't caught up on these keys, so those
  // locales fall through to English same as before the split.
  i18n:    { bundles: { en: i18nEn, it: i18nIt } },
});
