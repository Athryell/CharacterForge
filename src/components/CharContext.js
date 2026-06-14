import { createContext, useContext } from 'react';

export const CharContext = createContext({
  abilities:   {},          // D&D: {STR,DEX,...} — alias retrocompat per traitValues
  traitValues: {},          // generico: per D&D = abilities, per DH = {AGI,FIN,...}
  charLevel:   1,
  profBonus:   2,
  systemId:    'dnd5e2024',
});

export function useCharContext() { return useContext(CharContext); }
