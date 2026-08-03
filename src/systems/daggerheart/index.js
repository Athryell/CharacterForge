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
});
