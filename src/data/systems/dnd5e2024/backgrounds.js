// CharacterForge — D&D 5e SRD 5.2 Backgrounds (CC BY 4.0 — Wizards of the Coast)
// SRD 5.2.1 p.83: exactly 4 backgrounds (Acolyte, Criminal, Sage, Soldier)
// Mechanical data — translatable strings in i18n/backgrounds.{lang}.json

export const DND_BACKGROUNDS = [
  { id: 'acolyte',  srd: true, abilityScores: ['INT', 'WIS', 'CHA'], skills: ['insight', 'religion'] },
  { id: 'criminal', srd: true, abilityScores: ['DEX', 'CON', 'INT'], skills: ['sleight-of-hand', 'stealth'] },
  { id: 'sage',     srd: true, abilityScores: ['CON', 'INT', 'WIS'], skills: ['arcana', 'history'] },
  { id: 'soldier',  srd: true, abilityScores: ['STR', 'DEX', 'CON'], skills: ['athletics', 'intimidation'] },
];


export const BACKGROUND_FEATURES = {
  'acolyte': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Intuizione, Religione. Lingue: 2 a scelta.' },
    { name: 'Rifugio dei fedeli', desc: 'Puoi ricevere cure gratuite nei templi della tua fede. Il tempio fornisce alloggio e assistenza medica a te e ai tuoi compagni fedeli.' },
  ],
  'artisan': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Storia, Persuasione. Strumenti: 1 set di strumenti artigiani. Lingue: 1 a scelta.' },
    { name: 'Intermediario commerciale', desc: 'Accesso alla rete mercantile della gilda. Alloggio e risorse presso gilde affiliate.' },
  ],
  'criminal': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Inganno, Furtività. Strumenti: 1 set strumenti da gioco, attrezzi da ladro.' },
    { name: 'Contatto criminale', desc: 'Hai un contatto affidabile nella rete criminale. Puoi far passare messaggi attraverso organizzazioni criminali nelle città.' },
  ],
  'hermit': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Medicina, Religione. Strumenti: Erboristeria. Lingue: 1 a scelta.' },
    { name: 'Scoperta', desc: 'Durante il ritiro hai scoperto una verità segreta. Definisci con il DM la natura della scoperta.' },
  ],
  'entertainer': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Acrobazia, Intrattenere. Strumenti: Kit per il travestimento, 1 strumento musicale.' },
    { name: 'Da casa in casa', desc: 'Ottieni alloggio e pasti gratuiti in locande e teatri mentre ti esibisci. Hai estimatori in ogni città.' },
  ],
  'sailor': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Atletica, Percezione. Strumenti: Strumenti del navigatore, veicoli acquatici.' },
    { name: 'Passaggio sicuro', desc: 'Puoi ottenere passaggi gratuiti o economici su navi in cambio di lavoro come marinaio.' },
  ],
  'noble': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Storia, Persuasione. Strumenti: 1 set strumenti da gioco. Lingue: 1 a scelta.' },
    { name: 'Privilegio del rango', desc: 'Accesso a luoghi riservati ai nobili. La gente comune tende ad esserti deferente e a farti favori.' },
  ],
  'sage': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Arcano, Storia. Lingue: 2 a scelta.' },
    { name: 'Ricercatore', desc: 'Quando cerchi informazioni su un argomento, sai sempre dove trovarle (biblioteche, saggi, università), anche se richiede tempo o favori.' },
  ],
  'soldier': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Atletica, Intimidire. Strumenti: 1 set strumenti da gioco, veicoli terrestri.' },
    { name: 'Rango militare', desc: 'I soldati della tua ex fazione ti riconoscono come superiore. Puoi invocare la tua autorità per ottenere risorse e rispetto.' },
  ],
  'farmer': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Addestrare animali, Sopravvivenza. Strumenti: 1 set strumenti artigiani, veicoli terrestri.' },
    { name: 'Ospitalità rustica', desc: 'Le persone comuni ti sostengono. Puoi trovare rifugio tra contadini e operai che ti nascondono da autorità.' },
  ],
  'guard': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Atletica, Percezione. Strumenti: 1 set strumenti da gioco, veicoli terrestri.' },
    { name: 'Rango di guardia', desc: 'Sei riconosciuto come guardia. Puoi invocare la tua autorità per ottenere informazioni e rispetto nelle città.' },
  ],
  'guide': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Natura, Sopravvivenza. Strumenti: Kit cartografico, veicoli terrestri.' },
    { name: 'Rete di guide', desc: 'Conosci una rete di guide in varie regioni. Puoi ottenere informazioni su percorsi e terreni da questa rete.' },
  ],
  'merchant': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Intuizione, Persuasione. Strumenti: Borsa del navigante, 1 lingua.' },
    { name: 'Rete commerciale', desc: 'Hai contatti in molte città. Puoi ottenere prezzi migliori e informazioni di mercato attraverso la tua rete.' },
  ],
  'scribe': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Arcano, Storia. Strumenti: Kit per calligrafia.' },
    { name: 'Accesso agli archivi', desc: 'Puoi accedere a biblioteche e archivi pubblici. Hai contatti tra studiosi e bibliotecari.' },
  ],
  'wayfarer': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Furtività, Sopravvivenza. Strumenti: Attrezzi da ladro, kit da gioco.' },
    { name: 'Segreti della strada', desc: 'Conosci i luoghi sicuri e le rotte nascoste. Puoi trovare rifugio e informazioni nelle reti dei vagabondi.' },
  ],
};
