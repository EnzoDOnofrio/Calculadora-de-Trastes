import Fretboard from './Fretboard.jsx'
import { formatMm } from '../format.js'
import styles from '../App.module.css'

export default function Results({ result, selected, onSelect, stale }) {
  return (
    <div className={styles.resultsBody}>
      <Fretboard result={result} selected={selected} onSelect={onSelect}/>
      <div className={styles.tableHeading}>
        <h3>Medidas dos trastes</h3><span>TODAS AS MEDIDAS EM mm</span>
      </div>
      <div className={styles.tableScroll} tabIndex="0" role="region" aria-label="Tabela de medidas dos 24 trastes">
        <table className={styles.table}>
          <caption className={styles.srOnly}>24 trastes para a escala de {formatMm(result.escala_mm)} milímetros{stale ? '. Resultados da escala anterior.' : ''}</caption>
          <thead><tr><th scope="col">Traste</th><th scope="col">Espaçamento</th><th scope="col">Até a ponte</th><th scope="col">Até a pestana</th></tr></thead>
          <tbody>{result.trastes.map((fret) => (
            <tr key={fret.numero} data-selected={selected === fret.numero} data-octave={fret.numero === 12}>
              <th scope="row"><button type="button" aria-label={`Selecionar traste ${fret.numero}`}
                aria-pressed={selected === fret.numero} onClick={() => onSelect(fret.numero)}>
                <span className={styles.selectionMark} aria-hidden="true">{selected === fret.numero ? '▸' : ''}</span>
                {String(fret.numero).padStart(2, '0')}{fret.numero === 12 && <span className={styles.octaveTag}>OITAVA</span>}
              </button></th>
              <td>{formatMm(fret.espacamento_mm)}</td><td>{formatMm(fret.distancia_ponte_mm)}</td><td>{formatMm(fret.distancia_pestana_mm)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <p className={styles.tableNote}><span aria-hidden="true">↳</span> Selecione um traste na tabela ou no desenho para explorar suas medidas.</p>
      <div className={styles.octaveNote}>
        <span className={styles.octaveSymbol} aria-hidden="true">½</span>
        <div><strong>No 12º traste, a escala encontra sua metade.</strong><p>Uma oitava acima, {formatMm(result.trastes[11].distancia_pestana_mm)} mm da pestana e a mesma distância até a ponte.</p></div>
      </div>
    </div>
  )
}
