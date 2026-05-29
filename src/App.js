import React, { useState } from 'react';
import './App.css';

function windChill(t, v) {
  if (v < 4.8 || t > 10) return t;
  return Math.round(13.12 + 0.6215*t - 11.37*Math.pow(v,0.16) + 0.3965*t*Math.pow(v,0.16));
}

function computeOutfit(temp, wind, humidity, duration, sensitivity, intensity, sky, gender) {
  const wc = windChill(temp, wind);
  const sensOffset = sensitivity === 'cold' ? -3 : sensitivity === 'warm' ? +3 : 0;
  const intOffset = intensity === 'fast' ? +4 : intensity === 'medium' || intensity === 'intervals' ? 0 : -2;
  const durOffset = duration >= 90 ? -1 : 0;
  const perceived = wc + sensOffset + intOffset + durOffset;

  const items = [];
  const notes = [];

  if (perceived <= 0) {
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
    items.push({ icon: '🧥', label: 'Termica leggera' });
    items.push({ icon: '👕', label: 'Maglia maniche lunghe' });
    if (wind > 20) items.push({ icon: '🌬️', label: 'Antivento leggero' });
    items.push({ icon: '👖', label: 'Leggins lunghi' });
    items.push({ icon: '🧦', label: 'Calzini tecnici' });
    items.push({ icon: '🧤', label: 'Guanti leggeri' });
    if (perceived < 4) items.push({ icon: '🧢', label: 'Fascia orecchie' });
  } else if (perceived <= 14) {
    items.push({ icon: '👕', label: 'Maglia maniche lunghe' });
    if (wind > 15) items.push({ icon: '🌬️', label: 'Antivento leggero' });
    items.push({ icon: '👖', label: 'Leggins 3/4 o lunghi' });
    items.push({ icon: '🧦', label: 'Calzini tecnici' });
    if (perceived < 11) items.push({ icon: '🧤', label: 'Guanti sottili' });
  } else if (perceived <= 20) {
    if (gender === 'female') {
      items.push({ icon: '👙', label: 'Top sportivo' });
      if (sensitivity !== 'warm') items.push({ icon: '👕', label: 'Maglia maniche corte' });
    } else {
      items.push({ icon: '👕', label: 'Maglia maniche corte' });
    }
    if (intensity === 'slow') items.push({ icon: '🧥', label: 'Felpa leggera' });
    items.push({ icon: '🩳', label: 'Shorts o leggins corti' });
    items.push({ icon: '🧦', label: 'Calzini tecnici' });
  } else {
    if (gender === 'female') {
      items.push({ icon: '👙', label: 'Top sportivo' });
      if (sensitivity === 'cold') items.push({ icon: '👕', label: 'Maglia tecnica maniche corte' });
    } else {
      items.push({ icon: '👕', label: 'Maglia tecnica maniche corte' });
    }
    items.push({ icon: '🩳', label: 'Shorts' });
    items.push({ icon: '🧦', label: 'Calzini corti' });
    if (perceived >= 27) notes.push('Caldo intenso: porta acqua e corri nelle ore più fresche.');
  }

  if (sky === 'rain') {
    items.push({ icon: '🌧️', label: 'Giacca impermeabile' });
    notes.push('Con la pioggia aggiungi sempre uno strato impermeabile sopra.');
  }
   if (sky === 'sunny') {
    notes.push('Sole diretto: cappellino con visiera e protezione solare consigliati.');
  }
  if (humidity >= 80 && temp >= 15) {
    notes.push('Alta umidità percepita: preferisci tessuti che evaporano rapidamente.');
  }
  if (perceived >= 18) {
    notes.push('Caldo e attrito: applica crema antisfregamento su cosce e ascelle.');
  }
  if (duration >= 90) {
    notes.push('Uscita lunga: potresti scaldarti in corsa, valuta strati rimovibili.');
  }
  if (intensity === 'intervals' && perceived < 18) {
    notes.push('Ripetute con pause: durante le soste il corpo si raffredda rapidamente, tieni un capo extra con te da indossare nelle pause.');
  }

  return { items, notes, perceived, wc };
}

function PillGroup({ options, value, onChange }) {
  return (
    <div className="pill-group">
      {options.map(o => (
        <button
          key={o.value}
          className={`pill ${value === o.value ? 'active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SliderRow({ icon, label, min, max, step, value, unit, onChange }) {
  return (
    <div className="row-input">
      <label>{icon} {label}</label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))} />
      <span className="val">{value}{unit}</span>
    </div>
  );
}

export default function App() {
  const [gender, setGender] = useState('male');
  const [sensitivity, setSensitivity] = useState('normal');
  const [intensity, setIntensity] = useState('medium');
  const [duration, setDuration] = useState(45);
  const [temp, setTemp] = useState(5);
  const [wind, setWind] = useState(12);
  const [humidity, setHumidity] = useState(60);
  const [sky, setSky] = useState('cloudy');

  const { items, notes, perceived, wc } = computeOutfit(
    temp, wind, humidity, duration, sensitivity, intensity, sky, gender
  );

  const wcLabel = temp !== wc
    ? `percepita meteo ${wc}°C, effettiva corsa ~${perceived}°C`
    : `effettiva corsa ~${perceived}°C`;

  return (
    <div className="app">
      <h1>🏃 RunWear</h1>
      <p className="subtitle">Cosa indossare per la tua uscita</p>

      <section>
        <p className="section-label">Sei</p>
        <PillGroup
          options={[
            { value: 'male', label: '👨 Uomo' },
            { value: 'female', label: '👩 Donna' },
          ]}
          value={gender} onChange={setGender}
        />
      </section>

      <section>
        <p className="section-label">Come senti il freddo?</p>
        <PillGroup
          options={[
            { value: 'cold', label: 'Freddoloso' },
            { value: 'normal', label: 'Normale' },
            { value: 'warm', label: 'Calorifero' },
          ]}
          value={sensitivity} onChange={setSensitivity}
        />
      </section>

      <section>
        <p className="section-label">Intensità allenamento</p>
        <PillGroup
          options={[
            { value: 'slow', label: 'Lento / rigenerativo' },
            { value: 'medium', label: 'Medio' },
            { value: 'fast', label: 'Veloce' },
            { value: 'intervals', label: 'Ripetute con pause' },
          ]}
          value={intensity} onChange={setIntensity}
        />
      </section>

      <SliderRow icon="⏱️" label="Durata uscita" min={15} max={180} step={5}
        value={duration} unit=" min" onChange={setDuration} />

      <hr />

      <SliderRow icon="🌡️" label="Temperatura aria" min={-15} max={30} step={1}
        value={temp} unit="°C" onChange={setTemp} />

      <SliderRow icon="💨" label="Vento" min={0} max={60} step={1}
        value={wind} unit=" km/h" onChange={setWind} />

      <SliderRow icon="💧" label="Umidità" min={0} max={100} step={5}
        value={humidity} unit="%" onChange={setHumidity} />

      <section>
        <p className="section-label">Condizioni cielo</p>
        <PillGroup
          options={[
            { value: 'cloudy', label: '☁️ Nuvoloso' },
            { value: 'sunny', label: '☀️ Sole' },
            { value: 'rain', label: '🌧️ Pioggia' },
          ]}
          value={sky} onChange={setSky}
        />
      </section>

      <div className="advice-card">
        <p className="advice-meta">Temperatura {temp}°C — {wcLabel}</p>
        <p className="section-label">Cosa indossare</p>
        <div className="item-grid">
          {items.map((item, i) => (
            <div key={i} className="item">
              <span className="item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        {notes.length > 0 && (
          <div className="notes">
            {notes.map((n, i) => <p key={i}>💡 {n}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}