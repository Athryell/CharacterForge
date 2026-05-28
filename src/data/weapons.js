// Armi SRD 5.2 (CC BY 4.0 — Wizards of the Coast)

export const WEAPON_PROPERTIES = {
  finesse: 'Finezza',
  thrown: 'Lancio',
  ranged: 'A distanza',
  twoHanded: 'A due mani',
  versatile: 'Versatile',
  light: 'Leggera',
  heavy: 'Pesante',
  reach: 'Allungo',
  loading: 'Caricamento',
  ammunition: 'Munizioni',
};

export const WEAPON_MASTERIES = {
  none:   { label: '—',             desc: '' },
  cleave: { label: 'Falciata',      desc: 'Colpendo, attacca un\'altra creatura adiacente entro la portata usando la stessa azione.' },
  graze:  { label: 'Sfioramento',   desc: 'Mancando un attacco, infliggi danni pari al tuo modificatore FOR o DES (minimo 0).' },
  nick:   { label: 'Colpo rapido',  desc: 'Con questa arma leggera puoi effettuare l\'attacco extra del combattimento a due armi come azione libera, senza spendere un\'azione bonus.' },
  push:   { label: 'Spinta',        desc: 'Colpendo, puoi spingere il bersaglio di 3m (se Grande o più piccolo), purché abbia due piedi per terra.' },
  sap:    { label: 'Stordimento',   desc: 'Colpendo, il bersaglio ha svantaggio al suo prossimo tiro per colpire fino all\'inizio del tuo prossimo turno.' },
  slow:   { label: 'Rallentamento', desc: 'Colpendo, la velocità del bersaglio si riduce di 3m fino all\'inizio del tuo prossimo turno.' },
  topple: { label: 'Abbattimento',  desc: 'Colpendo, il bersaglio deve superare un TS FOR (CD = 8 + bonus competenza + mod.) o cade a terra prono.' },
  vex:    { label: 'Provocazione',  desc: 'Colpendo, ottieni vantaggio al prossimo tiro per colpire contro lo stesso bersaglio prima della fine del tuo prossimo turno.' },
};

export const ABILITY_OPTIONS = [
  { value: 'auto', label: 'Automatico (FOR/DES)' },
  { value: 'FOR',  label: 'Forza (FOR)' },
  { value: 'DES',  label: 'Destrezza (DES)' },
  { value: 'COS',  label: 'Costituzione (COS)' },
  { value: 'INT',  label: 'Intelligenza (INT)' },
  { value: 'SAG',  label: 'Saggezza (SAG)' },
  { value: 'CAR',  label: 'Carisma (CAR)' },
];

export const WEAPON_PRESETS = [
  // Mischia semplici
  { name: 'Clava',          dmg: '1d4',  dmgType: 'contundente', properties: ['light'], prof: true, mastery: 'slow' },
  { name: 'Pugnale',        dmg: '1d4',  dmgType: 'perforante',  properties: ['finesse','light','thrown'], range: '6/18', prof: true, mastery: 'nick' },
  { name: 'Randello',       dmg: '1d6',  dmgType: 'contundente', properties: [], prof: true, mastery: 'topple' },
  { name: 'Ascia da mano',  dmg: '1d6',  dmgType: 'tagliente',   properties: ['light','thrown'], range: '6/18', prof: true, mastery: 'vex' },
  { name: 'Lancia',         dmg: '1d6',  dmgType: 'perforante',  properties: ['thrown','versatile'], versatileDmg: '1d8', range: '6/18', prof: true, mastery: 'sap' },
  { name: 'Mazza',          dmg: '1d6',  dmgType: 'contundente', properties: [], prof: true, mastery: 'sap' },
  { name: 'Bastone',        dmg: '1d6',  dmgType: 'contundente', properties: ['versatile'], versatileDmg: '1d8', prof: true, mastery: 'topple' },
  // Mischia marziali
  { name: 'Spada corta',    dmg: '1d6',  dmgType: 'perforante',  properties: ['finesse','light'], prof: false, mastery: 'vex' },
  { name: 'Spada lunga',    dmg: '1d8',  dmgType: 'tagliente',   properties: ['versatile'], versatileDmg: '1d10', prof: false, mastery: 'sap' },
  { name: 'Spadone',        dmg: '2d6',  dmgType: 'tagliente',   properties: ['heavy','twoHanded'], prof: false, mastery: 'graze' },
  { name: 'Ascia da guerra',dmg: '1d8',  dmgType: 'tagliente',   properties: ['versatile'], versatileDmg: '1d10', prof: false, mastery: 'topple' },
  { name: 'Alabarda',       dmg: '1d10', dmgType: 'tagliente',   properties: ['heavy','reach','twoHanded'], prof: false, mastery: 'cleave' },
  { name: 'Rapier',         dmg: '1d8',  dmgType: 'perforante',  properties: ['finesse'], prof: false, mastery: 'vex' },
  // Distanza semplici
  { name: 'Arco corto',     dmg: '1d6',  dmgType: 'perforante',  properties: ['ammunition','ranged','twoHanded'], range: '24/96', prof: true, mastery: 'vex' },
  { name: 'Balestra leggera',dmg:'1d8',  dmgType: 'perforante',  properties: ['ammunition','ranged','loading'], range: '24/96', prof: true, mastery: 'slow' },
  // Distanza marziali
  { name: 'Arco lungo',     dmg: '1d8',  dmgType: 'perforante',  properties: ['ammunition','ranged','heavy','twoHanded'], range: '45/180', prof: false, mastery: 'slow' },
  { name: 'Balestra pesante',dmg:'1d10', dmgType: 'perforante',  properties: ['ammunition','ranged','heavy','loading'], range: '30/120', prof: false, mastery: 'push' },
];

export function calcWeaponAttack({ weapon, abilities, profBonus, isProficient }) {
  const override = weapon.abilityBonus;
  let statMod;

  if (override && override !== 'auto') {
    statMod = Math.floor(((abilities[override] ?? 10) - 10) / 2);
  } else if (weapon.properties?.includes('finesse')) {
    const forMod = Math.floor(((abilities.FOR ?? 10) - 10) / 2);
    const desMod = Math.floor(((abilities.DES ?? 10) - 10) / 2);
    statMod = Math.max(forMod, desMod);
  } else if (weapon.properties?.includes('ranged')) {
    statMod = Math.floor(((abilities.DES ?? 10) - 10) / 2);
  } else {
    statMod = Math.floor(((abilities.FOR ?? 10) - 10) / 2);
  }

  const prof = isProficient ? profBonus : 0;
  const attackBonus = statMod + prof;
  const dmgBonus = statMod;

  return { attackBonus, dmgBonus, statMod, prof };
}

export function fmtWeaponDmg(baseDmg, dmgBonus) {
  if (dmgBonus === 0) return baseDmg;
  if (dmgBonus > 0)  return `${baseDmg}+${dmgBonus}`;
  return `${baseDmg}${dmgBonus}`;
}
