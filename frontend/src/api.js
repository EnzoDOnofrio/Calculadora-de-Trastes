export async function fetchTrastes(scale, signal) {
  const response = await fetch(`/api/trastes?${new URLSearchParams({ escala: String(scale) })}`, {
    signal, headers: { Accept: 'application/json' },
  })
  let data
  try { data = await response.json() } catch {
    throw new Error('A API não retornou um resultado válido. Verifique se o backend está em execução.')
  }
  if (!response.ok) throw new Error(data.erro?.mensagem || 'Não foi possível calcular agora. Tente novamente.')
  if (data.quantidade_trastes !== 24 || !Array.isArray(data.trastes) || data.trastes.length !== 24) {
    throw new Error('A API retornou um resultado incompleto. Tente novamente.')
  }
  return data
}
