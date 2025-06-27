import { useApi } from "@/hooks/useApi"

export function getUsers() {
  const api = useApi()
  return api.get("/users")
}

export function createUser(data: any) {
  const api = useApi()
  return api.post("/users", data)
} 