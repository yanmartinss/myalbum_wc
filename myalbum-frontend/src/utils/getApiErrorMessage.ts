import axios from "axios";

type ApiErrorBody = {
  error?: string;
  message?: string;
};

export function getApiErrorMessage(
  error: unknown,
  fallback = "Erro inesperado",
): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data as ApiErrorBody | undefined;
  return data?.error ?? data?.message ?? fallback;
}
