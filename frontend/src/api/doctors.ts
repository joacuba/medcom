import { useApi } from "@/hooks/useApi"

export function getDoctors() {
  const api = useApi()
  return api.get("/doctors")
}

export function createDoctor(data: any) {
  const api = useApi()
  return api.post("/doctors", data)
} 