const apiHost = (() => {
  if (typeof window === 'undefined') return 'localhost'
  return window.location.hostname || 'localhost'
})()

export const API_BASE_URL = `http://${apiHost}:8000`

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  if (res.status === 204) return undefined as T
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

async function requestWithHeaders<T>(
  path: string,
  options?: RequestInit,
): Promise<{ data: T; headers: Headers }> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  const text = await res.text()
  const data = text ? (JSON.parse(text) as T) : (undefined as T)
  return { data, headers: res.headers }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  putWithHeaders: <T>(path: string, body: unknown) =>
    requestWithHeaders<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
