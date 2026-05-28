import { createContext, useContext } from 'react';

export const CharContext = createContext({ abilities: {}, charLevel: 1 });
export function useCharContext() { return useContext(CharContext); }
