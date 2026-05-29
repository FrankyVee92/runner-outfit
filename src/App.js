// ============================================================
// IMPORTAZIONI
// ============================================================

// Importiamo React, la libreria che ci permette di costruire interfacce web moderne.
// Senza React, non potremmo usare JSX (la sintassi che mescola HTML e JavaScript).

// useState è un "hook" di React: crea variabili "reattive" che quando cambiano
// aggiornano automaticamente l'interfaccia. Esempio: quando sposti il cursore
// della temperatura, React ridisegna i consigli in automatico.
import React, { useState } from 'react';

// Importiamo il file CSS che contiene tutti gli stili grafici dell'app
import './App.css';


// ============================================================
// FUNZIONE: windChill
// ============================================================
// Calcola la temperatura percepita tenendo conto del vento.
// Usa la formula ufficiale adottata da Environment Canada e dal
// National Weather Service americano.
//
// Parametri:
//   t = temperatura dell'aria in gradi Celsius
//   v = velocità del vento in km/h
//
// Restituisce la temperatura percepita arrotondata al grado intero
// ============================================================
function windChill(t, v) {

  // La formula è valida solo con vento superiore a 4.8 km/h e temperatura
  // sotto i 10°C. Fuori da questi limiti la percepita coincide con la reale.
  if (v < 4.8 || t > 10) return t;

  // Math.pow(v, 0.16) = v elevato alla potenza 0.16
  // Math.round() arrotonda al numero intero più vicino
  return Math.round(13.12 + 0.6215*t - 11.37*Math.pow(v,0.16) + 0.3965*t*Math.pow(v,0.16));
}


// ============================================================
// FUNZIONE: computeOutfit
// ============================================================
// Il "cervello" dell'app. Riceve tutti i dati inseriti dall'utente
// e restituisce la lista dei capi da indossare e le note.
//
// Parametri:
//   temp        = temperatura aria in °C
//   wind        = vento in km/h
//   humidity    = umidità in %
//   duration    = durata uscita in minuti
//   sensitivity = sensibilità al freddo: 'cold', 'normal', 'warm'
//   intensity   = intensità: 'slow', 'medium', 'fast', 'intervals'
//   sky         = cielo: 'cloudy', 'sunny', 'rain'
//   gender      = sesso: 'male', 'female'
//
// Restituisce un oggetto con:
//   items     = array di capi da indossare (icona + testo)
//   notes     = array di consigli aggiuntivi
//   perceived = temperatura percepita durante la corsa
//   wc        = temperatura percepita con il solo wind chill
// ============================================================
function computeOutfit(temp, wind, humidity, duration, sensitivity, intensity, sky, gender) {

  // PASSO 1: calcoliamo il wind chill (quanto freddo fa con il vento)
  const wc = windChill(temp, wind);

  // PASSO 2: calcoliamo gli "offset", cioè le correzioni alla temperatura
  // in base alle caratteristiche personali e dell'allenamento.
  // Offset negativo = fa più freddo | Offset positivo = fa meno freddo

  // Sensibilità al freddo:
  // La sintassi "condizione ? valore_se_vero : valore_se_falso" si chiama
  // "operatore ternario": è un if/else compatto su una sola riga.
  // Freddoloso = -3°C (veste più caldo), Calorifero = +3°C (veste più leggero)
  const sensOffset = sensitivity === 'cold' ? -3 : sensitivity === 'warm' ? +3 : 0;

  // Intensità allenamento:
  // Veloce = +4°C (produce molto calore), Lento = -2°C (produce poco calore)
  // Ripetute con pause equivale a medio: nelle pause il calore si azzera
  // "||" significa "oppure": la condizione è vera se è 'medium' OPPURE 'intervals'
  const intOffset = intensity === 'fast' ? +4 : intensity === 'medium' || intensity === 'intervals' ? 0 : -2;

  // Durata: oltre 90 minuti il corpo si scalda progressivamente (-1°C)
  const durOffset = duration >= 90 ? -1 : 0;

  // PASSO 3: temperatura effettiva percepita durante la corsa
  // = wind chill + tutti gli offset calcolati sopra
  const perceived = wc + sensOffset + intOffset + durOffset;

  // PASSO 4: array vuoti da riempire con i risultati.
  // Un array è una lista ordinata — come una lista della spesa.
  // "const" significa che la variabile non può essere riassegnata,
  // ma possiamo comunque aggiungere elementi con .push()
  const items = [];
  const notes = [];


  // ============================================================
  // PASSO 5: LOGICA ABBIGLIAMENTO
  // Scegliamo i capi in base alla temperatura percepita.
  // .push() aggiunge un elemento in fondo all'array.
  // Ogni elemento è un oggetto: { icon: 'emoji', label: 'testo' }
  // ============================================================

  if (perceived <= 0) {
    // FREDDO INTENSO: tutti gli strati, protezione completa
    items.push({ icon: '🧥', label: 'Termica invernale (intima)' });
    items.push({ icon: '👕', label: 'Maglia maniche lunghe' });
    items.push({ icon: '🌬️', label: 'Giacca antivento' });
    items.push({ icon: '👖', label: 'Leggins invernali' });
    items.push({ icon: '🧦', label: 'Calzettoni tecnici' });
    items.push({ icon: '🧤', label: 'Guanti' });
    items.push({ icon: '🧣', label: 'Scaldacollo' });
    items.push({ icon: '🧢', label: 'Berretto / fascia orecchie' });
    if (perceived <= -8) notes.push('Con freddo estremo valuta una doppia termica o gilet isolante.');

  } else if (perceived <= 7) {
    // FREDDO MODERATO: termica leggera, guanti consigliati
    items.push({ icon: '🧥', label: 'Termica leggera' });
    items.push({ icon: '👕', label: 'Maglia maniche lunghe' });
    // Antivento solo con vento forte (oltre 20 km/h)
    if (wind > 20) items.push({ icon: '🌬️', label: 'Antivento leggero' });
    items.push({ icon: '👖', label: 'Leggins lunghi' });
    items.push({ icon: '🧦', label: 'Calzini tecnici' });
    items.push({ icon: '🧤', label: 'Guanti leggeri' });
    // Fascia orecchie solo sotto i 4°C
    if (perceived < 4) items.push({ icon: '🧢', label: 'Fascia orecchie' });

  } else if (perceived <= 14) {
    // FRESCO: maglia lunga e leggins, guanti solo se abbastanza fresco
    items.push({ icon: '👕', label: 'Maglia maniche lunghe' });
    // Antivento con vento moderato (oltre 15 km/h)
    if (wind > 15) items.push({ icon: '🌬️', label: 'Antivento leggero' });
    items.push({ icon: '👖', label: 'Leggins 3/4 o lunghi' });
    items.push({ icon: '🧦', label: 'Calzini tecnici' });
    // Guanti solo sotto gli 11°C
    if (perceived < 11) items.push({ icon: '🧤', label: 'Guanti sottili' });

  } else if (perceived <= 20) {
    // MITE: abbigliamento leggero, top per le donne
    if (gender === 'female') {
      items.push({ icon: '👙', label: 'Top sportivo' });
      // "!==" significa "diverso da"
      // Se non è calorifero, aggiunge la maglia sopra il top
      if (sensitivity !== 'warm') items.push({ icon: '👕', label: 'Maglia maniche corte' });
    } else {
      items.push({ icon: '👕', label: 'Maglia maniche corte' });
    }
    // Chi va piano aggiunge una felpa per non raffreddarsi
    if (intensity === 'slow') items.push({ icon: '🧥', label: 'Felpa leggera' });
    items.push({ icon: '🩳', label: 'Shorts o leggins corti' });
    items.push({ icon: '🧦', label: 'Calzini tecnici' });

  } else {
    // CALDO: abbigliamento minimo
    if (gender === 'female') {
      items.push({ icon: '👙', label: 'Top sportivo' });
      // Solo le donne freddolose aggiungono la maglia col caldo
      if (sensitivity === 'cold') items.push({ icon: '👕', label: 'Maglia tecnica maniche corte' });
    } else {
      items.push({ icon: '👕', label: 'Maglia tecnica maniche corte' });
    }
    items.push({ icon: '🩳', label: 'Shorts' });
    items.push({ icon: '🧦', label: 'Calzini corti' });
    if (perceived >= 27) notes.push('Caldo intenso: porta acqua e corri nelle ore più fresche.');
  }


  // ============================================================
  // PASSO 6: NOTE AGGIUNTIVE
  // Indipendentemente dalla temperatura, verifichiamo altre condizioni
  // ============================================================

  // Pioggia: aggiungiamo impermeabile e nota
  if (sky === 'rain') {
    items.push({ icon: '🌧️', label: 'Giacca impermeabile' });
    notes.push('Con la pioggia aggiungi sempre uno strato impermeabile sopra.');
  }

  // Sole: cappellino e crema solare sempre consigliati
  if (sky === 'sunny') {
    notes.push('Sole diretto: cappellino con visiera e protezione solare consigliati.');
  }

  // Umidità alta + caldo: meglio tessuti tecnici traspiranti
  if (humidity >= 80 && temp >= 15) {
    notes.push('Alta umidità percepita: preferisci tessuti che evaporano rapidamente.');
  }

  // Caldo: rischio attrito, consigliamo crema antisfregamento
  if (perceived >= 18) {
    notes.push('Caldo e attrito: applica crema antisfregamento su cosce e ascelle.');
  }

  // Uscita lunga: il corpo si scalda, meglio strati rimovibili
  if (duration >= 90) {
    notes.push('Uscita lunga: potresti scaldarti in corsa, valuta strati rimovibili.');
  }

  // Ripetute: consiglio valido solo quando non fa caldo
  if (intensity === 'intervals' && perceived < 18) {
    notes.push('Ripetute con pause: durante le soste il corpo si raffredda rapidamente, tieni un capo extra con te da indossare nelle pause.');
  }

  // PASSO 7: restituiamo i risultati.
  // La sintassi { items, notes, perceived, wc } è una scorciatoia JavaScript
  // equivalente a { items: items, notes: notes, perceived: perceived, wc: wc }
  // Si chiama "object shorthand" o "destructuring assignment"
  return { items, notes, perceived, wc };
}


// ============================================================
// COMPONENTE: PillGroup
// ============================================================
// In React un "componente" è una funzione che restituisce interfaccia.
// PillGroup mostra un gruppo di bottoni selezionabili (le "pillole").
//
// Riceve queste "props" (proprietà passate dal componente padre):
//   options  = array di opzioni, ognuna con { value, label }
//   value    = valore attualmente selezionato
//   onChange = funzione da chiamare quando si cambia selezione
// ============================================================
function PillGroup({ options, value, onChange }) {
  return (
    <div className="pill-group">
      {/* .map() itera sull'array e per ogni elemento restituisce JSX.
          Funziona così: prende ogni elemento (o), lo passa alla funzione
          freccia, e restituisce un array di elementi React da renderizzare. */}
      {options.map(o => (
        <button
          key={o.value}
          className={`pill ${value === o.value ? 'active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
      {/* Spiegazione della riga className:
          - Le backtick permettono stringhe con variabili dentro (template literals)
          - La classe è sempre "pill", più "active" se questo è il bottone selezionato
          - "===" significa "strettamente uguale a" in JavaScript
          
          Spiegazione di onClick:
          - "() =>" è una funzione freccia, modo moderno per scrivere funzioni
          - Quando si clicca, chiama onChange con il value di questa opzione
          - Equivale a scrivere: function() { onChange(o.value) } */}
    </div>
  );
}


// ============================================================
// COMPONENTE: SliderRow
// ============================================================
// Mostra una riga con icona, etichetta, cursore scorrevole e valore.
// Usato per temperatura, vento, umidità e durata.
//
// Riceve queste props:
//   icon     = emoji a sinistra
//   label    = testo descrittivo
//   min/max  = limiti del cursore
//   step     = incremento (es. 1 = va di grado in grado)
//   value    = valore attuale
//   unit     = unità di misura (es. "°C")
//   onChange = funzione chiamata quando il cursore si sposta
// ============================================================
function SliderRow({ icon, label, min, max, step, value, unit, onChange }) {
  return (
    <div className="row-input">
      <label>{icon} {label}</label>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      {/* Spiegazione di onChange:
          - "e" è l'evento del browser generato quando il cursore si sposta
          - "e.target" è l'elemento HTML del cursore
          - "e.target.value" è il nuovo valore, ma come stringa di testo
          - Number(...) lo converte in numero per i calcoli matematici */}
      <span className="val">{value}{unit}</span>
    </div>
  );
}


// ============================================================
// COMPONENTE PRINCIPALE: App
// ============================================================
// Gestisce tutto lo stato dell'app e mostra l'interfaccia completa.
// "export default" = questo è il componente principale del file,
// quello importato e usato dagli altri file del progetto.
// ============================================================
export default function App() {

  // ============================================================
  // STATO con useState
  // ============================================================
  // useState(valoreIniziale) restituisce un array con due elementi:
  //   1. La variabile con il valore attuale
  //   2. La funzione per aggiornarlo
  // Quando chiamiamo la funzione di aggiornamento, React ridisegna
  // automaticamente l'interfaccia — non dobbiamo fare nulla manualmente.
  //
  // La sintassi [variabile, setVariabile] si chiama "array destructuring":
  // estrae i due elementi dell'array in due variabili separate.
  // ============================================================

  const [gender, setGender] = useState('male');
  // 'male' o 'female' — valore iniziale: 'male'

  const [sensitivity, setSensitivity] = useState('normal');
  // 'cold', 'normal' o 'warm' — valore iniziale: 'normal'

  const [intensity, setIntensity] = useState('medium');
  // 'slow', 'medium', 'fast', 'intervals' — valore iniziale: 'medium'

  const [duration, setDuration] = useState(45);
  // durata in minuti — valore iniziale: 45

  const [temp, setTemp] = useState(5);
  // temperatura in °C — valore iniziale: 5

  const [wind, setWind] = useState(12);
  // vento in km/h — valore iniziale: 12

  const [humidity, setHumidity] = useState(60);
  // umidità in % — valore iniziale: 60

  const [sky, setSky] = useState('cloudy');
  // 'cloudy', 'sunny', 'rain' — valore iniziale: 'cloudy'


  // ============================================================
  // CALCOLO CONSIGLI
  // ============================================================
  // Ogni volta che uno stato cambia, React riesegue questa funzione
  // e ricalcola tutto con i valori aggiornati.
  // Il "destructuring" { items, notes, perceived, wc } estrae le
  // quattro proprietà restituite da computeOutfit in variabili separate.
  // ============================================================
  const { items, notes, perceived, wc } = computeOutfit(
    temp, wind, humidity, duration, sensitivity, intensity, sky, gender
  );

  // Testo descrittivo della temperatura per il riquadro dei consigli
  // Se wind chill e temperatura reale differiscono, mostriamo entrambi
  const wcLabel = temp !== wc
    ? `percepita meteo ${wc}°C, effettiva corsa ~${perceived}°C`
    : `effettiva corsa ~${perceived}°C`;


  // ============================================================
  // INTERFACCIA (JSX)
  // ============================================================
  // JSX sembra HTML ma è JavaScript. Differenze principali:
  //   - "className" invece di "class" (class è parola riservata in JS)
  //   - Espressioni JavaScript tra parentesi graffe { }
  //   - Commenti si scrivono {/* così */} dentro il JSX
  //   - Un solo elemento radice (il div.app che contiene tutto)
  // ============================================================
  return (
    <div className="app">
      <h1>🏃 RunWear</h1>
      <p className="subtitle">Cosa indossare per la tua uscita</p>

      {/* Sezione sesso */}
      <section>
        <p className="section-label">Sei</p>
        <PillGroup
          options={[
            { value: 'male', label: '👨 Uomo' },
            { value: 'female', label: '👩 Donna' },
          ]}
          value={gender}
          onChange={setGender}
        />
        {/* onChange={setGender} significa: quando l'utente clicca,
            chiama setGender con il nuovo valore e aggiorna lo stato */}
      </section>

      {/* Sezione sensibilità al freddo */}
      <section>
        <p className="section-label">Come senti il freddo?</p>
        <PillGroup
          options={[
            { value: 'cold', label: 'Freddoloso' },
            { value: 'normal', label: 'Normale' },
            { value: 'warm', label: 'Calorifero' },
          ]}
          value={sensitivity}
          onChange={setSensitivity}
        />
      </section>

      {/* Sezione intensità allenamento */}
      <section>
        <p className="section-label">Intensità allenamento</p>
        <PillGroup
          options={[
            { value: 'slow', label: 'Lento / rigenerativo' },
            { value: 'medium', label: 'Medio' },
            { value: 'fast', label: 'Veloce' },
            { value: 'intervals', label: 'Ripetute con pause' },
          ]}
          value={intensity}
          onChange={setIntensity}
        />
      </section>

      {/* Cursori per i parametri numerici — usano il componente SliderRow */}
      <SliderRow icon="⏱️" label="Durata uscita" min={15} max={180} step={5}
        value={duration} unit=" min" onChange={setDuration} />

      <hr />

      <SliderRow icon="🌡️" label="Temperatura aria" min={-15} max={30} step={1}
        value={temp} unit="°C" onChange={setTemp} />

      <SliderRow icon="💨" label="Vento" min={0} max={60} step={1}
        value={wind} unit=" km/h" onChange={setWind} />

      <SliderRow icon="💧" label="Umidità" min={0} max={100} step={5}
        value={humidity} unit="%" onChange={setHumidity} />

      {/* Sezione condizioni cielo */}
      <section>
        <p className="section-label">Condizioni cielo</p>
        <PillGroup
          options={[
            { value: 'cloudy', label: '☁️ Nuvoloso' },
            { value: 'sunny', label: '☀️ Sole' },
            { value: 'rain', label: '🌧️ Pioggia' },
          ]}
          value={sky}
          onChange={setSky}
        />
      </section>

      {/* Riquadro finale con i consigli */}
      <div className="advice-card">
        <p className="advice-meta">Temperatura {temp}°C — {wcLabel}</p>
        <p className="section-label">Cosa indossare</p>

        {/* .map() itera sull'array items e per ogni capo crea un elemento grafico.
            "i" è l'indice numerico (0,1,2...) usato come key univoca per React */}
        <div className="item-grid">
          {items.map((item, i) => (
            <div key={i} className="item">
              <span className="item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Mostriamo le note SOLO se l'array non è vuoto.
            "notes.length > 0" è true se c'è almeno un elemento.
            "&&" in JSX = "se vero, mostra questo elemento" */}
        {notes.length > 0 && (
          <div className="notes">
            {notes.map((n, i) => <p key={i}>💡 {n}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}