// CharacterForge — D&D 5e SRD features (CC BY 4.0 — Wizards of the Coast)

export const CLASS_FEATURES = {
  Barbaro: [
    { name: 'Competenze', desc: 'Armature: Leggere, Medie, Scudi. Armi: Semplici, da Guerra. Tiri salvezza: Forza, Costituzione. Abilità (2 tra): Addestrare animali, Atletica, Intimidire, Natura, Percezione, Sopravvivenza.' },
    { name: 'Rabbia', desc: 'Come azione bonus entra in Rabbia (dura 1 min). In rabbia: vantaggio ai tiri FOR, resistenza ai danni fisici, +2 ai danni di mischia. Usi: 2 (ripristinati con riposo lungo).' },
    { name: 'Difesa senza armatura', desc: 'Senza armatura: CA = 10 + mod. DES + mod. COS.' },
  ],
  Bardo: [
    { name: 'Competenze', desc: 'Armature: Leggere. Armi: Semplici, spade corte, balestre a mano, spade lunghe, stocchi. Tiri salvezza: Destrezza, Carisma. Strumenti: 3 strumenti musicali. Abilità (3): qualsiasi.' },
    { name: 'Incantesimi (Carisma)', desc: 'Incantatore a pieno livello con Carisma. 4 trucchetti, incantesimi conosciuti in base al livello.' },
    { name: 'Ispirazione bardica', desc: 'Azione bonus: concedi d6 ispirazione a una creatura entro 18 m. Può aggiungerlo a un tiro. Usi = mod. CAR (min. 1); recuperati con riposo lungo.' },
  ],
  Chierico: [
    { name: 'Competenze', desc: 'Armature: Leggere, Medie, Scudi. Armi: Semplici. Tiri salvezza: Saggezza, Carisma. Abilità (2 tra): Storia, Intuizione, Medicina, Persuasione, Religione.' },
    { name: 'Incantesimi (Saggezza)', desc: 'Incantatore a pieno livello con Saggezza. Preparati = mod. SAG + livello. Incantesimi del dominio sempre preparati.' },
    { name: 'Dominio divino', desc: 'Scegli un dominio (Vita, Luce, Natura, Tempesta, Malizia, Guerra…). Concede incantesimi di dominio e capacità extra.' },
    { name: 'Canalizza divinità (1/riposo breve)', desc: 'Usa il potere divino: Allontana non morti (ogni chierico) + opzione del dominio.' },
  ],
  Druido: [
    { name: 'Competenze', desc: 'Armature: Leggere, Medie, Scudi (no metallo). Armi: Semplici (no metallo), scimitarre. Tiri salvezza: Intelligenza, Saggezza. Strumenti: Erboristeria. Abilità (2 tra): Arcano, Addestrare animali, Intuizione, Medicina, Natura, Percezione, Religione, Sopravvivenza.' },
    { name: 'Incantesimi (Saggezza)', desc: 'Incantatore a pieno livello con Saggezza. Preparati = mod. SAG + livello.' },
    { name: 'Forma selvatica (liv 2)', desc: 'Azione (o azione bonus al liv. 2): assumi forma di bestia (CR basato sul livello). Usi: 2 (ripristinati con riposo breve/lungo).' },
    { name: 'Cerchio druidico (liv 2)', desc: 'Scegli una specializzazione: Terra, Luna, ecc.' },
  ],
  Guerriero: [
    { name: 'Competenze', desc: 'Armature: Tutte, Scudi. Armi: Semplici, da Guerra. Tiri salvezza: Forza, Costituzione. Abilità (2 tra): Acrobazia, Addestrare animali, Atletica, Storia, Intuizione, Intimidire, Percezione, Sopravvivenza.' },
    { name: 'Stile di combattimento', desc: 'Scegli uno stile: Arciere (+2 attacchi a distanza), Difesa (+1 CA), Duellante (+2 danni con arma a una mano), Grande arma (riesamina 1-2 su danni), Protezione (reazione per svantaggio ad attacchi contro alleato), Due armi (aggiungi mod. a danni 2° attacco).' },
    { name: 'Riprendere fiato', desc: 'Azione bonus: recupera 1d10 + livello PF. Usi: 1 (ripristinati con riposo breve/lungo).' },
    { name: 'Impeto (liv 2)', desc: 'Azione bonus: compi una seconda azione. Usi: 1 (ripristinati con riposo breve/lungo).' },
  ],
  Ladro: [
    { name: 'Competenze', desc: 'Armature: Leggere. Armi: Semplici, balestre a mano, spade corte, spade lunghe, stocchi. Strumenti: Attrezzi da ladro. Tiri salvezza: Destrezza, Intelligenza. Abilità (4): qualsiasi.' },
    { name: 'Perizia', desc: 'Raddoppia il bonus di competenza per 2 abilità o strumenti a scelta (altre 2 al liv. 6).' },
    { name: 'Attacco furtivo', desc: 'Una volta per turno, danni extra 1d6 quando hai vantaggio o un alleato è adiacente al bersaglio. Scala con il livello.' },
    { name: 'Gergo ladro', desc: 'Linguaggio segreto comprensibile solo ad altri ladri.' },
    { name: 'Azione scaltra', desc: 'Azione bonus: Scatto, Disimpegno o Nascondersi.' },
  ],
  Mago: [
    { name: 'Competenze', desc: 'Armi: Balestre a mano, dardi, fionde, bastoni, spade corte. Tiri salvezza: Intelligenza, Saggezza. Abilità (2 tra): Arcano, Storia, Indagare, Intuizione, Medicina, Religione.' },
    { name: 'Incantesimi (Intelligenza)', desc: 'Incantatore a pieno livello con Intelligenza. Libro degli incantesimi (6 incantesimi al livello 1). Preparati = mod. INT + livello.' },
    { name: 'Recupero arcano', desc: 'Una volta al giorno (riposo breve): recupera slot di livello ≤ metà del livello mago (arrotondato su). Slot max 5°.' },
    { name: 'Tradizione arcana (liv 2)', desc: 'Scegli la scuola di magia o tradizione: Evocazione, Divinazione, Illusione, ecc.' },
  ],
  Monaco: [
    { name: 'Competenze', desc: 'Armature: Nessuna. Armi: Semplici, spade corte. Tiri salvezza: Forza, Destrezza. Abilità (2 tra): Acrobazia, Atletica, Storia, Furtività, Intuizione, Religione.' },
    { name: 'Difesa senza armatura', desc: 'Senza armatura: CA = 10 + mod. DES + mod. SAG.' },
    { name: 'Arti marziali', desc: 'Usa DES invece di FOR per attacchi con armi da monaco. Attacchi disarmati: d4. Dopo attacco arma/disarmato come azione, puoi fare un attacco disarmato come azione bonus.' },
    { name: 'Ki (liv 2)', desc: 'Punti ki = livello (recuperati con riposo breve/lungo). Azioni ki: Attacco fulmineo, Passo del vento, Pazienza del difensore.' },
  ],
  Paladino: [
    { name: 'Competenze', desc: 'Armature: Tutte, Scudi. Armi: Semplici, da Guerra. Tiri salvezza: Saggezza, Carisma. Abilità (2 tra): Atletica, Intuizione, Intimidire, Medicina, Persuasione, Religione.' },
    { name: 'Senso divino', desc: 'Azione: percepisce celesti/infernali/non morti entro 18 m. Usi = 1 + mod. CAR (riposi lunghi).' },
    { name: 'Imposizione delle mani', desc: 'Riserva = livello × 5 PF. Azione: cura o neutralizza malattia/veleno (5 punti). Ripristinata con riposo lungo.' },
    { name: 'Stile di combattimento e Incantesimi (liv 2)', desc: 'Come Guerriero per lo stile. Incantesimi con Carisma (mezzo livello), preparati = mod. CAR + metà livello.' },
    { name: 'Sacro giuramento (liv 3)', desc: 'Scegli il giuramento: Devozione, Antichi, Vendetta… che definisce il tuo credo e poteri.' },
  ],
  Ranger: [
    { name: 'Competenze', desc: 'Armature: Leggere, Medie, Scudi. Armi: Semplici, da Guerra. Tiri salvezza: Forza, Destrezza. Abilità (3 tra): Addestrare animali, Atletica, Intuizione, Indagare, Natura, Percezione, Furtività, Sopravvivenza.' },
    { name: 'Nemico prescelto', desc: 'Scegli tipo di nemico (aberrazioni, bestie, non morti…). Vantaggio a prove di conoscenza/tracciamento; impari un linguaggio associato.' },
    { name: 'Esploratore naturale', desc: 'Scegli un terreno preferito (foresta, pianura…). Vantaggi durante l\'esplorazione in quel tipo di terreno.' },
    { name: 'Incantesimi (Saggezza, liv 2)', desc: 'Incantatore a mezzo livello con Saggezza. Preparati = mod. SAG + metà livello.' },
  ],
  Stregone: [
    { name: 'Competenze', desc: 'Armi: Balestre a mano, dardi, fionde, bastoni, spade corte. Tiri salvezza: Costituzione, Carisma. Abilità (2 tra): Arcano, Inganno, Intuizione, Intimidire, Persuasione, Religione.' },
    { name: 'Incantesimi (Carisma)', desc: 'Incantatore a pieno livello con Carisma. Conosci incantesimi fissi (2 al liv. 1). 4 slot al liv. 1.' },
    { name: 'Origine stregonesca', desc: 'Scegli la fonte della tua magia: Draconica (CA 13+DES senza armatura, +1 PF/livello), Caos selvatico, Linea divina, ecc.' },
    { name: 'Punti stregoneria (liv 2)', desc: 'Converti slot in punti e viceversa. Usati per metamagia.' },
  ],
  Warlock: [
    { name: 'Competenze', desc: 'Armature: Leggere. Armi: Semplici. Tiri salvezza: Saggezza, Carisma. Abilità (2 tra): Arcano, Inganno, Storia, Intimidire, Indagare, Natura, Religione.' },
    { name: 'Patrono ultraterreno', desc: 'Scegli il patrono: Arcidemonio, Antico, Celestiale, Genio… Concede incantesimi di patrono e capacità extra.' },
    { name: 'Incantesimi del patto (Carisma)', desc: 'Pochi slot (1 al liv. 1), ma recuperati con riposo breve/lungo. Tutti i slot al livello massimo disponibile. Conosci incantesimi fissi.' },
    { name: 'Invocazioni occulte (liv 2)', desc: 'Impari 2 invocazioni che potenziano le tue capacità arcane.' },
  ],
};

export const SPECIES_FEATURES = {
  'Umano': [
    { name: 'Polivalenza', desc: 'Guadagni competenza in un\'abilità a scelta.' },
    { name: 'Talento bonus', desc: 'Guadagni un talento di primo livello a scelta.' },
  ],
  'Elfo (Alto)': [
    { name: 'Sensi acuti', desc: 'Competenza nell\'abilità Percezione.' },
    { name: 'Lignaggio fatato', desc: 'Vantaggio ai tiri salvezza contro l\'incantamento. Immunità al sonno magico.' },
    { name: 'Trance', desc: 'Non dormi. Mediti per 4 ore al giorno (equivale a 8 ore di sonno). Puoi essere vigile durante la trance.' },
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m). Solo in bianco e nero nell\'oscurità.' },
    { name: 'Addestramento elfico con le armi', desc: 'Competenza con spade lunghe, spade corte, archi corti e archi lunghi.' },
    { name: 'Trucchetto', desc: 'Conosci un trucchetto della lista del mago. Intelligenza è la caratteristica.' },
  ],
  'Elfo (Silvano)': [
    { name: 'Sensi acuti', desc: 'Competenza nell\'abilità Percezione.' },
    { name: 'Lignaggio fatato', desc: 'Vantaggio ai tiri salvezza contro l\'incantamento. Immunità al sonno magico.' },
    { name: 'Trance', desc: 'Non dormi. Mediti per 4 ore al giorno.' },
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m).' },
    { name: 'Addestramento elfico con le armi', desc: 'Competenza con spade lunghe, spade corte, archi corti e archi lunghi.' },
    { name: 'Passo del bosco', desc: 'Non sei rallentato da terreno difficile non magico. Puoi muoverti attraverso piante non magiche senza difficoltà.' },
    { name: 'Mascheratura naturale', desc: 'Puoi tentare di nasconderti quando sei leggermente oscurato da fenomeni naturali.' },
  ],
  'Nano (Collina)': [
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m).' },
    { name: 'Resilienza nanica', desc: 'Vantaggio ai tiri salvezza contro il veleno. Resistenza ai danni da veleno.' },
    { name: 'Addestramento nanico con le armi', desc: 'Competenza con asce da battaglia, asce a mano, martelli leggeri e martelli da guerra.' },
    { name: 'Competenza con gli strumenti', desc: 'Competenza con uno strumento artigiano a scelta (arnesi del fabbro, strumenti del birraio o attrezzi del muratore).' },
    { name: 'Senso della pietra', desc: 'Vantaggio alle prove di Storia riguardo lavori in pietra.' },
    { name: 'Tenacia nanica', desc: 'PF massimi aumentano di 1 ad ogni livello.' },
  ],
  'Nano (Montagna)': [
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m).' },
    { name: 'Resilienza nanica', desc: 'Vantaggio ai tiri salvezza contro il veleno. Resistenza ai danni da veleno.' },
    { name: 'Addestramento nanico con le armi', desc: 'Competenza con asce da battaglia, asce a mano, martelli leggeri e martelli da guerra.' },
    { name: 'Competenza con gli strumenti', desc: 'Competenza con uno strumento artigiano a scelta.' },
    { name: 'Senso della pietra', desc: 'Vantaggio alle prove di Storia riguardo lavori in pietra.' },
    { name: 'Addestramento con le armature', desc: 'Competenza con armature leggere e medie.' },
  ],
  'Halfling (Pieditozzo)': [
    { name: 'Fortuna', desc: 'Quando tiri 1 su un d20 per attacco, prova o tiro salvezza, puoi ritirare e usare il nuovo risultato.' },
    { name: 'Coraggioso', desc: 'Vantaggio ai tiri salvezza contro la paura.' },
    { name: 'Agilità halfling', desc: 'Puoi muoverti attraverso lo spazio di una creatura di taglia superiore.' },
    { name: 'Invisibilità naturale', desc: 'Puoi tentare di nasconderti quando sei oscurato solo da una creatura Media o superiore.' },
  ],
  'Halfling (Selvatico)': [
    { name: 'Fortuna', desc: 'Quando tiri 1 su un d20, puoi ritirare e usare il nuovo risultato.' },
    { name: 'Coraggioso', desc: 'Vantaggio ai tiri salvezza contro la paura.' },
    { name: 'Agilità halfling', desc: 'Puoi muoverti attraverso lo spazio di una creatura di taglia superiore.' },
    { name: 'Resilienza selvaggia', desc: 'Vantaggio ai tiri salvezza contro gli effetti di paura e non puoi essere incantato.' },
  ],
  'Mezzelfo': [
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m).' },
    { name: 'Lignaggio fatato', desc: 'Vantaggio ai tiri salvezza contro l\'incantamento. Immunità al sonno magico.' },
    { name: 'Polivalenza', desc: 'Competenza in 2 abilità a scelta.' },
  ],
  'Tiefling': [
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m).' },
    { name: 'Resistenza infernale', desc: 'Resistenza ai danni da fuoco.' },
    { name: 'Eredità infernale', desc: 'Trucchetto Thaumaturgy. Al liv. 3: Hellish Rebuke 2° (1/giorno). Al liv. 5: Darkness (1/giorno). Caratteristica: Carisma.' },
  ],
  'Draconico': [
    { name: 'Antenato draconico', desc: 'Scegli tipo di drago; determina danno del soffio e resistenza. Parli Draconico.' },
    { name: 'Soffio draconico', desc: 'Azione: attacco ad area (cono 4,5 m o linea). Danni 2d6. TS DES/COS (CD 8 + mod. COS + competenza) per dimezzare. Usi: 1 (riposo breve/lungo).' },
    { name: 'Resistenza ai danni', desc: 'Resistenza al tipo di danno dell\'antenato.' },
  ],
  'Gnomo (Roccia)': [
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m).' },
    { name: 'Astuzia gnomica', desc: 'Vantaggio ai tiri salvezza di INT, SAG e CAR contro la magia.' },
    { name: 'Conoscenza artificiale', desc: 'Competenza con gli strumenti del fabbricante. Puoi costruire piccoli congegni animati.' },
  ],
  'Gnomo (Foresta)': [
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m).' },
    { name: 'Astuzia gnomica', desc: 'Vantaggio ai tiri salvezza di INT, SAG e CAR contro la magia.' },
    { name: 'Illusione naturale', desc: 'Trucchetto Minor Illusion. Caratteristica: Intelligenza.' },
    { name: 'Parlare con le piccole bestie', desc: 'Puoi comunicare idee semplici con bestie Piccole o più piccole.' },
  ],
  "Mezz'orco": [
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m).' },
    { name: 'Minaccioso', desc: 'Competenza nell\'abilità Intimidire.' },
    { name: 'Resistenza instancabile', desc: 'Quando scendi a 0 PF (ma non muori), puoi scendere a 1 invece. Usi: 1 (riposo lungo).' },
    { name: 'Attacchi selvaggi', desc: 'Con colpo critico in mischia, tira un dado di danno aggiuntivo.' },
  ],
  'Aasimar': [
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m).' },
    { name: 'Resistenza celestiale', desc: 'Resistenza ai danni necrotici e radiosi.' },
    { name: 'Guarigione divina', desc: 'Azione: tocca una creatura e cura 2d4 + livello PF (non su te stesso). Usi: 1 (riposo lungo).' },
    { name: 'Portare la luce', desc: 'Azione: irradi luce intensa 6 m, fioca altri 6 m. Azione bonus per spegnerla.' },
  ],
};

export const BACKGROUND_FEATURES = {
  'Accolito': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Intuizione, Religione. Lingue: 2 a scelta.' },
    { name: 'Rifugio dei fedeli', desc: 'Puoi ricevere cure gratuite nei templi della tua fede. Il tempio fornisce alloggio e assistenza medica a te e ai tuoi compagni fedeli.' },
  ],
  'Artigiano': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Storia, Persuasione. Strumenti: 1 set di strumenti artigiani. Lingue: 1 a scelta.' },
    { name: 'Intermediario commerciale', desc: 'Accesso alla rete mercantile della gilda. Alloggio e risorse presso gilde affiliate.' },
  ],
  'Criminale': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Inganno, Furtività. Strumenti: 1 set strumenti da gioco, attrezzi da ladro.' },
    { name: 'Contatto criminale', desc: 'Hai un contatto affidabile nella rete criminale. Puoi far passare messaggi attraverso organizzazioni criminali nelle città.' },
  ],
  'Eremita': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Medicina, Religione. Strumenti: Erboristeria. Lingue: 1 a scelta.' },
    { name: 'Scoperta', desc: 'Durante il ritiro hai scoperto una verità segreta. Definisci con il DM la natura della scoperta.' },
  ],
  'Eroe Popolare': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Addestrare animali, Sopravvivenza. Strumenti: 1 set strumenti artigiani, veicoli terrestri.' },
    { name: 'Ospitalità rustica', desc: 'Le persone comuni ti sostengono. Puoi trovare rifugio tra contadini e operai che ti nascondono da autorità.' },
  ],
  'Intrattenitore': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Acrobazia, Intrattenere. Strumenti: Kit per il travestimento, 1 strumento musicale.' },
    { name: 'Da casa in casa', desc: 'Ottieni alloggio e pasti gratuiti in locande e teatri mentre ti esibisci. Hai estimatori in ogni città.' },
  ],
  'Marinaio': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Atletica, Percezione. Strumenti: Strumenti del navigatore, veicoli acquatici.' },
    { name: 'Passaggio sicuro', desc: 'Puoi ottenere passaggi gratuiti o economici su navi in cambio di lavoro come marinaio.' },
  ],
  'Nobile': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Storia, Persuasione. Strumenti: 1 set strumenti da gioco. Lingue: 1 a scelta.' },
    { name: 'Privilegio del rango', desc: 'Accesso a luoghi riservati ai nobili. La gente comune tende ad esserti deferente e a farti favori.' },
  ],
  'Saggio': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Arcano, Storia. Lingue: 2 a scelta.' },
    { name: 'Ricercatore', desc: 'Quando cerchi informazioni su un argomento, sai sempre dove trovarle (biblioteche, saggi, università), anche se richiede tempo o favori.' },
  ],
  'Soldato': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Atletica, Intimidire. Strumenti: 1 set strumenti da gioco, veicoli terrestri.' },
    { name: 'Rango militare', desc: 'I soldati della tua ex fazione ti riconoscono come superiore. Puoi invocare la tua autorità per ottenere risorse e rispetto.' },
  ],
  'Orfano di strada': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Furtività, Prestidigitazione. Strumenti: Kit per il travestimento, attrezzi da ladro.' },
    { name: 'Segreti della città', desc: 'Conosci passaggi nascosti e segreti delle città dove hai vissuto. Puoi trovare percorsi alternativi che riducono i tempi di spostamento.' },
  ],
  'Seguace di gilda': [
    { name: 'Competenze e strumenti', desc: 'Abilità: Storia, Persuasione. Strumenti: 1 set strumenti artigiani. Lingue: 1 a scelta.' },
    { name: 'Appartenenza alla gilda', desc: 'Accesso a risorse e rete della gilda. Alloggio, assistenza legale e contatti attraverso la gilda.' },
  ],
};

export function getAutoFeatures(sourceType, sourceName, data) {
  return (data[sourceName] || []).map((f, i) => ({
    id: `${sourceType}_${Date.now()}_${i}`,
    name: f.name,
    desc: f.desc,
    source: sourceName,
    sourceType,
  }));
}
