import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getDHClasses, getDHDomains, getDHAncestries, getDHCommunities, getDHTraitUses,
} from './data/getters';

// UI state and translated catalogues only the Daggerheart sheet needs. These
// memos used to run in CharacterApp for every character, so a D&D sheet rebuilt
// the Daggerheart class list on every language change.
export default function useWidgetState() {
  const { i18n } = useTranslation();

  const [editingDHEvasion, setEditingDHEvasion] = useState(false);
  const [dhOpenFeature, setDhOpenFeature] = useState(null);

  const dhClasses     = useMemo(() => getDHClasses(i18n.language),     [i18n.language]);
  const dhDomains     = useMemo(() => getDHDomains(i18n.language),     [i18n.language]);
  const dhAncestries  = useMemo(() => getDHAncestries(i18n.language),  [i18n.language]);
  const dhCommunities = useMemo(() => getDHCommunities(i18n.language), [i18n.language]);
  const dhTraitUses   = useMemo(() => getDHTraitUses(i18n.language),   [i18n.language]);

  return {
    ui: {
      editingDHEvasion, setEditingDHEvasion, dhOpenFeature, setDhOpenFeature,
      dhClasses, dhDomains, dhAncestries, dhCommunities, dhTraitUses,
    },
    derived: {},
  };
}
