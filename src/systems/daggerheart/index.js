import { defineSystem } from '../contract';
import meta         from './meta';
import capabilities from './capabilities';
import icons        from './icons';
import notation     from './notation';
import homebrew     from './homebrew';
import layout       from './layout';
import state        from './state';
import rules        from './rules';
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
  widgets,
  data:    adapter,
  creator: DHCharacterCreator,
});
