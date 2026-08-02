import { defineSystem } from '../contract';
import meta         from './meta';
import capabilities from './capabilities';
import icons        from './icons';
import notation     from './notation';
import homebrew     from './homebrew';
import adapter      from './data/adapter';
import DHCharacterCreator from './components/DHCharacterCreator';

export default defineSystem({
  meta,
  capabilities,
  icons,
  notation,
  homebrew,
  data:    adapter,
  creator: DHCharacterCreator,
});
