import { useApi } from "@/hooks/useApi"
 
export function runBenchmark(data: any) {
  const api = useApi()
  return api.post("/benchmark", data)
} 