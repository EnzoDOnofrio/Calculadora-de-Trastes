import { useId } from 'react'
import { formatMm } from '../format.js'
import styles from '../App.module.css'

export default function Fretboard({ result, selected, onSelect }) {
  const id = useId()
  const xFor = (distance) => 42 + (distance / result.escala_mm) * 900
  const current = result.trastes.find((fret) => fret.numero === selected)
  function onKeyDown(event, fret) {
    const keys = { ArrowRight: Math.min(24, fret + 1), ArrowLeft: Math.max(1, fret - 1), Home: 1, End: 24 }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(fret) }
    else if (keys[event.key]) {
      event.preventDefault()
      const next = keys[event.key]
      onSelect(next)
      event.currentTarget.ownerSVGElement.querySelector(`[data-fret="${next}"]`)?.focus()
    }
  }
  return (
    <div className={styles.fretboard}>
      <div className={styles.diagramHeading}>
        <span>MAPA DO BRAÇO</span><span>Visualização ilustrativa</span>
      </div>
      <p id={`${id}-help`} className={styles.srOnly}>Selecione um traste. Use as setas para navegar, Home para o primeiro e End para o último.</p>
      <div className={styles.diagramScroll} role="region" aria-label="Diagrama do braço do instrumento" tabIndex="0">
        <svg viewBox="0 0 984 190" className={styles.neck} aria-labelledby={`${id}-title ${id}-help`}>
          <title id={`${id}-title`}>Posições proporcionais dos 24 trastes, da pestana à ponte</title>
          <defs>
            <linearGradient id={`${id}-wood`} x2="0" y2="1"><stop stopColor="#302b21"/><stop offset="1" stopColor="#201e18"/></linearGradient>
          </defs>
          <rect x="42" y="49" width="900" height="78" rx="3" fill={`url(#${id}-wood)`}/>
          {[58, 70, 82, 94, 106, 118].map((y) => <path key={y} d={`M42 ${y}H942`} stroke="#d4c8ab" strokeWidth=".7" opacity=".42"/>)}
          <path d="M42 48V128" stroke="#e8e1cc" strokeWidth="5"/>
          <path d="M942 48V128" stroke="#bdb59e" strokeWidth="4"/>
          <text x="42" y="28" className={styles.svgLabel}>PESTANA</text>
          <text x="942" y="28" textAnchor="end" className={styles.svgLabel}>PONTE</text>
          {[3, 5, 7, 9, 12, 15, 17, 19, 21, 24].map((n) => {
            const fret = result.trastes[n - 1]
            const prev = result.trastes[n - 2]?.distancia_pestana_mm || 0
            const x = xFor((prev + fret.distancia_pestana_mm) / 2)
            return n === 12 || n === 24
              ? <g key={n}><circle cx={x} cy="76" r="2.8" fill="#cdb77d"/><circle cx={x} cy="100" r="2.8" fill="#cdb77d"/></g>
              : <circle key={n} cx={x} cy="88" r="2.8" fill="#a39266"/>
          })}
          {result.trastes.map((fret) => {
            const x = xFor(fret.distancia_pestana_mm)
            const active = selected === fret.numero
            const previousX = xFor(result.trastes[fret.numero - 2]?.distancia_pestana_mm || 0)
            const nextX = xFor(result.trastes[fret.numero]?.distancia_pestana_mm ?? result.escala_mm)
            return (
              <g key={fret.numero} role="button" aria-label={`Traste ${fret.numero}`} aria-pressed={active}
                tabIndex={active ? 0 : -1} onClick={() => onSelect(fret.numero)}
                onKeyDown={(event) => onKeyDown(event, fret.numero)} data-fret={fret.numero} className={styles.fretTarget}>
                <rect x={(previousX + x) / 2} y="44" width={Math.min((nextX - previousX) / 2, 42)} height="89" fill={active ? '#e2be5425' : 'transparent'} rx="2"/>
                <path d={`M${x} 49V127`} stroke={active ? '#ebc65b' : '#9f9784'} strokeWidth={active ? 3 : 1.2}/>
                {(fret.numero <= 12 || fret.numero % 2 === 0 || active) && <text x={x} y="148" textAnchor="middle" className={active ? styles.svgSelected : styles.svgNumber}>{fret.numero}</text>}
              </g>
            )
          })}
          <path d={`M42 164H${xFor(current.distancia_pestana_mm)}m0 -4v8M42 160v8`} stroke="#d9b34f" strokeWidth="1"/>
          <text x="942" y="174" textAnchor="end" className={styles.svgLabel}>ESCALA {formatMm(result.escala_mm)} mm</text>
        </svg>
      </div>
      <div className={styles.selectedMeasure} aria-live="polite">
        <span>Traste <strong>{String(selected).padStart(2, '0')}</strong></span>
        <span><strong>{formatMm(current.distancia_pestana_mm)}</strong> mm da pestana</span>
      </div>
    </div>
  )
}
