import { useQuery } from "@tanstack/react-query";
import type { AuthConfig } from "@resume-ai/shared";
import { apiRequest } from "./apiClient";

export function useAuthConfig() {
  return useQuery({
    queryKey: ["auth-config"],
    queryFn: () => apiRequest<AuthConfig>("/api/auth/config"),
    staleTime: 5 * 60 * 1000,
  });
}
