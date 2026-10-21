import { useEffect, useRef, useState } from 'react'
import { fetchTrastes } from './api.js'
import { formatMm, parseScale } from './format.js'
import InstrumentArt from './components/InstrumentArt.jsx'
import Results from './components/Results.jsx'
import styles from './App.module.css'

function Arrow({ diagonal = false }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M6 18L18 6M6 6H18V18' : 'M4 12H20M14 6L20 12L14 18'} stroke="currentColor" strokeWidth="1.6"/></svg>
}

export default function App() {
  const [input, setInput] = useState('650')
  const [result, setResult] = useState(null)
  const [selected, setSelected] = useState(12)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [invalid, setInvalid] = useState(false)
  const pending = useRef(null)
  const inputRef = useRef(null)
  const stale = Boolean(result && parseScale(input) !== result.escala_mm)

  useEffect(() => () => pending.current?.abort(), [])

  function updateInput(value) {
    pending.current?.abort()
    pending.current = null
    setLoading(false)
    setInput(value)
    setError('')
    setInvalid(false)
  }

  async function calculate(event) {
    event.preventDefault()
    const scale = parseScale(input)
    if (scale === null) {
      setError('Informe uma escala numérica maior que zero. Exemplo: 650 ou 648,75.')
      setInvalid(true)
      inputRef.current?.focus()
      return
    }
    pending.current?.abort()
    const controller = new AbortController()
    pending.current = controller
    let timedOut = false
    const timer = setTimeout(() => { timedOut = true; controller.abort() }, 12000)
    setLoading(true)
    setError('')
    setInvalid(false)
    try {
      const data = await fetchTrastes(scale, controller.signal)
      if (controller.signal.aborted) return
      setResult(data)
      setSelected(12)
    } catch (failure) {
      if (controller.signal.aborted && !timedOut) return
      setError(timedOut
        ? 'A API demorou para responder. Verifique se o backend está em execução e tente novamente.'
        : failure instanceof TypeError
          ? 'Não foi possível conectar à API. Verifique se o backend está em execução e tente novamente.'
          : failure.message)
    } finally {
      clearTimeout(timer)
      if (pending.current === controller) { setLoading(false); pending.current = null }
    }
  }

  return (
    <>
      <a href="#calculadora" className={styles.skipLink}>Ir para a calculadora</a>
      <header className={styles.header}>
        <a href="#" className={styles.wordmark} aria-label="Valderrama Luthier, início">Valderrama<span>L U T H I E R</span></a>
        <nav aria-label="Navegação principal"><a href="#calculadora" className={styles.activeNav}>Calculadora</a><a href="#como-funciona">Como funciona <Arrow diagonal/></a></nav>
        <span className={styles.headerNote}>A ARTE ENCONTRA A PRECISÃO</span>
      </header>

      <main className={styles.main}>
        <section className={styles.hero} aria-labelledby="page-title">
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}><span/>FERRAMENTAS DE LUTHERIA</p>
            <h1 id="page-title">Calculadora de <em>trastes.</em></h1>
            <p className={styles.heroDescription}>Cada intervalo tem seu lugar. Encontre as medidas exatas<br className={styles.desktopBreak}/> para dar forma ao som do seu instrumento.</p>
          </div>
          <div className={styles.heroArt}><InstrumentArt/></div>
          <span className={styles.heroIndex}>01 — PRECISÃO & CONSTRUÇÃO</span>
        </section>

        <div id="calculadora" className={styles.workspace}>
          <aside className={styles.sidebar}>
            <div className={styles.sectionLabel}><span>01</span> CONFIGURE A ESCALA</div>
            <form onSubmit={calculate} noValidate className={styles.form}>
              <h2>O ponto de partida.</h2>
              <p>A escala é a distância entre a pestana e a ponte do instrumento.</p>
              <label htmlFor="scale">Escala do instrumento <span>(mm)</span></label>
              <div className={`${styles.inputWrap} ${invalid ? styles.inputInvalid : ''}`}>
                <input id="scale" ref={inputRef} name="escala" type="text" inputMode="decimal" autoComplete="off" spellCheck="false"
                  value={input} onChange={(event) => updateInput(event.target.value)} aria-invalid={invalid}
                  aria-describedby={`scale-help${error ? ' calculation-error' : ''}`}/>
                <span aria-hidden="true">mm</span>
              </div>
              <p id="scale-help" className={styles.inputHelp}>Use vírgula ou ponto para valores decimais.</p>
              <button type="submit" className={styles.calculateButton} disabled={loading}>
                {loading ? 'Calculando…' : 'Calcular trastes'}{loading ? <span className={styles.spinner}/> : <Arrow/>}
              </button>
              {error && <p id="calculation-error" role="alert" className={styles.error}>{error}</p>}
              <div className={styles.formFoot}><span>24 trastes</span><span>Afinação temperada</span></div>
            </form>
            <div className={styles.sidebarTip}><span aria-hidden="true">i</span><p><strong>Da primeira casa à segunda oitava.</strong> As posições seguem a divisão da oitava em 12 semitons iguais.</p></div>
            <div className={styles.sidebarDetail}><span>FEITO PARA</span><p>Quem constrói.<br/>Quem toca.<br/><em>Quem quer entender.</em></p></div>
          </aside>

          <section className={styles.results} aria-labelledby="results-title" aria-busy={loading}>
            <div className={styles.resultsHeader}><div className={styles.sectionLabel}><span>02</span> <h2 id="results-title">EXPLORE AS MEDIDAS</h2></div>
              <span className={styles.resultStatus}>{result ? `${formatMm(result.escala_mm)} mm` : 'AGUARDANDO ESCALA'}</span>
            </div>
            <div role="status" className={styles.srOnly}>{loading ? 'Calculando posições dos trastes.' : result ? `Cálculo concluído: 24 trastes para ${formatMm(result.escala_mm)} milímetros.` : ''}</div>
            {stale && <p className={styles.staleNotice} role="status">Escala alterada. Calcule novamente para atualizar as medidas abaixo.</p>}
            {result ? <Results result={result} selected={selected} onSelect={setSelected} stale={stale}/>
              : <div className={styles.emptyState}>
                <div className={styles.emptyDiagram} aria-hidden="true"><span/><span/><span/><span/><span/><span/><span/><span/><span/></div>
                <span className={styles.emptyIndex}>SUA PRÓXIMA CONSTRUÇÃO COMEÇA AQUI</span>
                <h3>Uma escala.<br/><em>Vinte e quatro possibilidades.</em></h3>
                <p>Informe a escala do instrumento e calcule<br/>a posição de cada traste, do início ao fim.</p>
                <div className={styles.emptyLegend}><span>Posição</span><span>Espaçamento</span><span>Precisão</span></div>
              </div>}
          </section>
        </div>

        <section id="como-funciona" className={styles.theory} aria-labelledby="theory-title">
          <div className={styles.theoryIntro}><p className={styles.eyebrow}>POR TRÁS DAS MEDIDAS</p><h2 id="theory-title">A matemática<br/><em>da harmonia.</em></h2><p>A cada semitom, o comprimento vibrante da corda diminui na mesma proporção. É por isso que os espaços entre os trastes ficam menores ao longo do braço.</p></div>
          <div className={styles.theoryDetails}>
            <div className={styles.formula}><span>FÓRMULA DA ESCALA TEMPERADA</span><p aria-label="d de n igual a L vezes um menos dois elevado a menos n sobre doze">d<sub>n</sub> = L <span>×</span> (1 − 2<sup>−n/12</sup>)</p><div><span><strong>L</strong> escala em mm</span><span><strong>n</strong> número do traste</span></div></div>
            <dl className={styles.definitions}><div><dt>01 / Até a pestana</dt><dd>A posição do traste, medida a partir do início da escala.</dd></div><div><dt>02 / Até a ponte</dt><dd>O comprimento restante da escala: L − d<sub>n</sub>.</dd></div><div><dt>03 / Espaçamento</dt><dd>A distância até o traste anterior. No primeiro, a distância até a pestana.</dd></div></dl>
          </div>
        </section>
      </main>
      <footer className={styles.footer}><div><span className={styles.footerBrand}>Valderrama Luthier</span><p>Conhecimento que dá forma à música.</p></div><p>Projeto de extensão universitária<br/><span>Programação Funcional com Clojure · Instituto Mauá de Tecnologia</span></p><a href="#page-title" aria-label="Voltar ao início"><Arrow diagonal/></a></footer>
    </>
  )
}
