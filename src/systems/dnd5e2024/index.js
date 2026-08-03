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
import * as widgets from './widgets';
import * as modals  from './modals';
import adapter      from './data/adapter';
import DNDCharacterCreator from './components/DNDCharacterCreator';

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
  widgets,
  modals,
  data:    adapter,
  creator: DNDCharacterCreator,
});
