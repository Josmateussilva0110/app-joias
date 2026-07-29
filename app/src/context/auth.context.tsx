import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import { getAuth, removeAuth, saveAuth } from "@/storage/auth.storage";
import { registerUser, loginUser, logoutUser } from "@/services/auth.service";
import { refreshService } from "@/services/refresh.service";
import { tokenManager } from "@/services/token.manager";
import { clearPersistedQueryCache } from "@/lib/query-persister";
import { AuthUser, type AuthData } from "@/types/auth.types";

interface RegisterDTO {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

interface AuthContextData {
  user: AuthUser | null;
  loading: boolean;
  signed: boolean;
  register: (
    data: RegisterDTO
  ) => Promise<{ success: boolean; message: string }>;
  login: (
    data: LoginDTO
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubRefreshed = tokenManager.onRefreshed(
      async (accessToken, refreshToken, expiresAt) => {
        const current = await getAuth();
        if (!current) return;

        await saveAuth({
          ...current,
          accessToken,
          refreshToken,
          expiresAt,
        });
      }
    );

    const unsubExpired = tokenManager.onExpired(async () => {
      tokenManager.clearTokens();
      await removeAuth();
      await clearPersistedQueryCache();
      setUser(null);
      setSigned(false);
    });

    void loadUser();

    return () => {
      unsubRefreshed();
      unsubExpired();
    };
  }, []);

  async function loadUser() {
    try {
      const data = await getAuth();

      if (!data) {
        return;
      }

      tokenManager.setTokens(data.accessToken, data.refreshToken);

      const expired = Date.now() >= data.expiresAt;

      if (!expired) {
        setUser(data.user);
        setSigned(true);
        return;
      }

      const refreshed = await tryRefreshSession(data);

      if (!refreshed) {
        tokenManager.clearTokens();
        await removeAuth();
        await clearPersistedQueryCache();
        setUser(null);
        setSigned(false);
      }
    } catch (err) {
      if (__DEV__) {
        console.error("[AUTH]", err);
      }

      tokenManager.clearTokens();
      await removeAuth();
      await clearPersistedQueryCache();
      setUser(null);
      setSigned(false);
    } finally {
      setLoading(false);
    }
  }

  const tryRefreshSession = useCallback(async (stored: AuthData): Promise<boolean> => {
    if (!stored) return false;

    try {
      const refreshed = await refreshService.refresh(stored.refreshToken);
      setUser(refreshed.user);
      setSigned(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  async function establishSession(data: AuthData) {
    tokenManager.setTokens(data.accessToken, data.refreshToken);
    await saveAuth(data);
    setUser(data.user);
    setSigned(true);
  }

  async function register(dto: RegisterDTO) {
    const result = await registerUser(dto);

    if (!result.success) {
      return {
        success: false,
        message: result.message,
      };
    }

    const loginResult = await loginUser({
      email: dto.email.trim(),
      password: dto.password,
    });

    if (!loginResult.success || !loginResult.data) {
      return {
        success: false,
        message:
          loginResult.message ||
          "Conta criada, mas não foi possível entrar automaticamente.",
      };
    }

    await establishSession(loginResult.data);

    return {
      success: true,
      message: "Conta criada com sucesso!",
    };
  }

  async function login(dto: LoginDTO) {
    const result = await loginUser(dto);

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message,
      };
    }

    await establishSession(result.data);

    return {
      success: true,
      message: result.message,
    };
  }

  async function logout() {
    try {
      await logoutUser();
    } catch {
      // Revoga sessão no servidor quando possível; logout local segue mesmo se falhar.
    }

    tokenManager.clearTokens();
    await removeAuth();
    await clearPersistedQueryCache();
    setUser(null);
    setSigned(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signed,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
