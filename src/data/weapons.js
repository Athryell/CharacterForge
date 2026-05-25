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

export const WEAPON_PRESETS = [
  // Mischia semplici
  { name: 'Clava',          dmg: '1d4',  dmgType: 'contundente', properties: ['light'], prof: true },
  { name: 'Pugnale',        dmg: '1d4',  dmgType: 'perforante',  properties: ['finesse','light','thrown'], range: '6/18', prof: true },
  { name: 'Randello',       dmg: '1d6',  dmgType: 'contundente', properties: [], prof: true },
  { name: 'Ascia da mano',  dmg: '1d6',  dmgType: 'tagliente',   properties: ['light','thrown'], range: '6/18', prof: true },
  { name: 'Lancia',         dmg: '1d6',  dmgType: 'perforante',  properties: ['thrown','versatile'], versatileDmg: '1d8', range: '6/18', prof: true },
  { name: 'Mazza',          dmg: '1d6',  dmgType: 'contundente', properties: [], prof: true },
  { name: 'Bastone',        dmg: '1d6',  dmgType: 'contundente', properties: ['versatile'], versatileDmg: '1d8', prof: true },
  // Mischia marziali
  { name: 'Spada corta',    dmg: '1d6',  dmgType: 'perforante',  properties: ['finesse','light'], prof: false },
  { name: 'Spada lunga',    dmg: '1d8',  dmgType: 'tagliente',   properties: ['versatile'], versatileDmg: '1d10', prof: false },
  { name: 'Spadone',        dmg: '2d6',  dmgType: 'tagliente',   properties: ['heavy','twoHanded'], prof: false },
  { name: 'Ascia da guerra',dmg: '1d8',  dmgType: 'tagliente',   properties: ['versatile'], versatileDmg: '1d10', prof: false },
  { name: 'Alabarda',       dmg: '1d10', dmgType: 'tagliente',   properties: ['heavy','reach','twoHanded'], prof: false },
  { name: 'Rapier',         dmg: '1d8',  dmgType: 'perforante',  properties: ['finesse'], prof: false },
  // Distanza semplici
  { name: 'Arco corto',     dmg: '1d6',  dmgType: 'perforante',  properties: ['ammunition','ranged','twoHanded'], range: '24/96', prof: true },
  { name: 'Balestra leggera',dmg:'1d8',  dmgType: 'perforante',  properties: ['ammunition','ranged','loading'], range: '24/96', prof: true },
  // Distanza marziali
  { name: 'Arco lungo',     dmg: '1d8',  dmgType: 'perforante',  properties: ['ammunition','ranged','heavy','twoHanded'], range: '45/180', prof: false },
  { name: 'Balestra pesante',dmg:'1d10', dmgType: 'perforante',  properties: ['ammunition','ranged','heavy','loading'], range: '30/120', prof: false },
];

export function calcWeaponAttack({ weapon, abilities, profBonus, isProficient }) {
  const isFinesse = weapon.properties?.includes('finesse');
  const isRanged  = weapon.properties?.includes('ranged');

  let statMod;
  if (isFinesse) {
    const forMod = Math.floor((abilities.FOR - 10) / 2);
    const desMod = Math.floor((abilities.DES - 10) / 2);
    statMod = Math.max(forMod, desMod);
  } else if (isRanged) {
    statMod = Math.floor((abilities.DES - 10) / 2);
  } else {
    statMod = Math.floor((abilities.FOR - 10) / 2);
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
