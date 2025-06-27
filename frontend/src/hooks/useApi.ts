const base = import.meta.env.VITE_API_URL + "/api" || "http://localhost:8000/api"

export function useApi() {
  async function get(path: string) {
    const res = await fetch(base + path)
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  async function post(path: string, data: any) {
    const res = await fetch(base + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  return { get, post }
} 