import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'
import { parseScale } from '../format.js'
import fixture from '../../../backend/test/fixtures/trastes-650.json'

beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
const success = () => ({ ok: true, json: async () => fixture })

async function calculate() {
  const user = userEvent.setup()
  render(<App />)
  fetch.mockResolvedValue(success())
  await user.click(screen.getByRole('button', { name: 'Calcular trastes' }))
  await screen.findByRole('table')
  return user
}

describe('entrada de escala', () => {
  it('começa com 650 mm e aguarda o envio antes de consultar a API', () => {
    render(<App />)
    expect(screen.getByRole('textbox', { name: /Escala do instrumento/ })).toHaveValue('650')
    expect(screen.getByText('Vinte e quatro possibilidades.')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it.each(['', '0', '-650', 'abc', 'NaN', 'Infinity', '1e309', '650,5.2'])('rejeita a entrada %j sem consultar a API', async (value) => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByRole('textbox', { name: /Escala do instrumento/ })
    fireEvent.change(input, { target: { value } })
    await user.click(screen.getByRole('button', { name: 'Calcular trastes' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/maior que zero/)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveFocus()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('normaliza vírgula decimal antes de enviar para a API', async () => {
    const user = userEvent.setup()
    render(<App />)
    fetch.mockResolvedValue({ ok: true, json: async () => ({ ...fixture, escala_mm: 648.75 }) })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '648,75' } })
    await user.click(screen.getByRole('button', { name: 'Calcular trastes' }))
    await screen.findByRole('table')
    expect(fetch).toHaveBeenCalledWith('/api/trastes?escala=648.75', expect.objectContaining({ signal: expect.any(AbortSignal) }))
    expect(screen.getByText('648,75 mm')).toBeInTheDocument()
    expect(parseScale('648.75')).toBe(648.75)
  })
})

describe('resultado e seleção', () => {
  it('mostra 24 trastes, duas casas decimais e a oitava selecionada', async () => {
    await calculate()
    expect(screen.getAllByRole('row')).toHaveLength(25)
    expect(screen.getByRole('button', { name: 'Selecionar traste 12' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Traste 12' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByText('325,00').length).toBeGreaterThan(0)
    expect(screen.getByText('34,43')).toBeInTheDocument()
  })

  it('sincroniza a seleção na tabela e no SVG, incluindo navegação por teclado', async () => {
    const user = await calculate()
    await user.click(screen.getByRole('button', { name: 'Selecionar traste 2' }))
    const fret = screen.getByRole('button', { name: 'Traste 2' })
    expect(fret).toHaveAttribute('aria-pressed', 'true')
    fret.focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: 'Traste 3' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Selecionar traste 3' })).toHaveAttribute('aria-pressed', 'true')
    await user.keyboard('{End}')
    expect(screen.getByRole('button', { name: 'Traste 24' })).toHaveAttribute('aria-pressed', 'true')
    await user.keyboard('{Home}')
    expect(screen.getByRole('button', { name: 'Traste 1' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('mantém o resultado identificado pela escala anterior até recalcular', async () => {
    await calculate()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '700' } })
    expect(screen.getByText(/Escala alterada/)).toBeInTheDocument()
    expect(screen.getByRole('table')).toHaveAccessibleName(/escala anterior/)
    expect(screen.getByText('650,00 mm')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})

describe('falhas e carregamento', () => {
  it('mostra carregamento e impede envios duplicados', async () => {
    const user = userEvent.setup()
    let finish
    fetch.mockImplementation(() => new Promise((resolve) => { finish = resolve }))
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Calcular trastes' }))
    expect(screen.getByRole('button', { name: 'Calculando…' })).toBeDisabled()
    await act(async () => finish(success()))
    expect(await screen.findByRole('table')).toBeInTheDocument()
  })

  it('exibe indisponibilidade da API com opção de tentar novamente', async () => {
    const user = userEvent.setup()
    fetch.mockRejectedValue(new TypeError('Failed to fetch'))
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Calcular trastes' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/conectar à API/)
    expect(screen.getByRole('button', { name: 'Calcular trastes' })).toBeEnabled()
  })

  it('apresenta a mensagem de validação retornada pelo backend', async () => {
    const user = userEvent.setup()
    fetch.mockResolvedValue({ ok: false, json: async () => ({ erro: { mensagem: 'Escala inválida na API.' } }) })
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Calcular trastes' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Escala inválida na API.')
  })

  it('trata uma resposta que não seja JSON', async () => {
    const user = userEvent.setup()
    fetch.mockResolvedValue({ ok: true, json: async () => { throw new SyntaxError('html') } })
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Calcular trastes' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/resultado válido/)
  })

  it('descarta uma resposta antiga quando a escala muda durante a consulta', async () => {
    const user = userEvent.setup()
    let finish
    fetch.mockImplementation(() => new Promise((resolve) => { finish = resolve }))
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Calcular trastes' }))
    const signal = fetch.mock.calls[0][1].signal
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '700' } })
    expect(signal.aborted).toBe(true)
    await act(async () => finish(success()))
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Calcular trastes' })).toBeEnabled()
  })

  it('encerra uma consulta após 12 segundos e informa o tempo excedido', async () => {
    vi.useFakeTimers()
    fetch.mockImplementation((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    }))
    render(<App />)
    fireEvent.submit(screen.getByRole('button', { name: 'Calcular trastes' }).closest('form'))
    await act(async () => vi.advanceTimersByTimeAsync(12000))
    expect(screen.getByRole('alert')).toHaveTextContent(/demorou para responder/)
    expect(screen.getByRole('button', { name: 'Calcular trastes' })).toBeEnabled()
  })
})
