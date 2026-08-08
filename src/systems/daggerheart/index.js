import { defineSystem } from '../contract';
import meta         from './meta';
import capabilities from './capabilities';
import icons        from './icons';
import notation     from './notation';
import homebrew     from './homebrew';
import layout       from './layout';
import state        from './state';
import rules, { contextValue } from './rules';
import pins         from './pins';
import useWidgetState from './useWidgetState';
import * as widgets from './widgets';
import adapter      from './data/adapter';
import DHCharacterCreator from './components/DHCharacterCreator';
import i18nEn from './i18n/ui.i18n.json';
import i18nIt from './i18n/ui.i18n.it.json';
import i18nDe from './i18n/ui.i18n.de.json';
import i18nFr from './i18n/ui.i18n.fr.json';
import i18nEs from './i18n/ui.i18n.es.json';

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
  pins,
  useWidgetState,
  widgets,
  data:    adapter,
  creator: DHCharacterCreator,
  i18n:    { bundles: { en: i18nEn, it: i18nIt, de: i18nDe, fr: i18nFr, es: i18nEs } },
});
