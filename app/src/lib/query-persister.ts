import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { queryClient } from "@/lib/query-client";

const CACHE_KEY = "APP_QUERY_CACHE_V2";

/**
 * Versão do cache persistido. Incremente ao mudar formatos de query
 * (ex.: useQuery -> useInfiniteQuery) para descartar dados antigos.
 */
export const QUERY_CACHE_BUSTER = "20260729-infinite-products";

/**
 * Persiste o cache do React Query no AsyncStorage.
 * Permite exibir os últimos dados (perfil) instantaneamente
 * na abertura do app, enquanto o servidor revalida em background
 * (stale-while-revalidate).
 */
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: CACHE_KEY,
  throttleTime: 1000,
});

void AsyncStorage.removeItem("APP_QUERY_CACHE");

/** Remove cache persistido — chamar no logout para não vazar dados do usuário anterior. */
export async function clearPersistedQueryCache(): Promise<void> {
  queryClient.clear();
  await AsyncStorage.removeItem(CACHE_KEY);
}
