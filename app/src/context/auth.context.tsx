import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import { getAuth, removeAuth, saveAuth } from "@/storage/auth.storage";
import {
  clearBiometricLogin,
  getBiometricCredentials,
  isBiometricHardwareAvailable,
  saveBiometricCredentials,
  syncBiometricRefreshToken,
  authenticateBiometric,
} from "@/storage/biometric.storage";
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
  loginWithBiometric: () => Promise<{ success: boolean; message: string }>;
  enableBiometricLogin: () => Promise<{ success: boolean; message: string }>;
  disableBiometricLogin: () => Promise<void>;
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

        await syncBiometricRefreshToken(current.user.email, refreshToken);
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
    await syncBiometricRefreshToken(data.user.email, data.refreshToken);
    setUser(data.user);
    setSigned(true);
  }

  async function enableBiometricLogin() {
    const available = await isBiometricHardwareAvailable();

    if (!available) {
      return {
        success: false,
        message: "Biometria não disponível neste dispositivo.",
      };
    }

    const authenticated = await authenticateBiometric();

    if (!authenticated) {
      return {
        success: false,
        message: "Autenticação biométrica cancelada.",
      };
    }

    const auth = await getAuth();

    if (!auth) {
      return {
        success: false,
        message: "Faça login novamente para ativar a biometria.",
      };
    }

    await saveBiometricCredentials(auth.user.email, auth.refreshToken);

    return {
      success: true,
      message: "Login biométrico ativado com sucesso.",
    };
  }

  async function disableBiometricLogin() {
    await clearBiometricLogin();
  }

  async function loginWithBiometric() {
    const available = await isBiometricHardwareAvailable();

    if (!available) {
      return {
        success: false,
        message: "Biometria não disponível neste dispositivo.",
      };
    }

    const credentials = await getBiometricCredentials();

    if (!credentials) {
      return {
        success: false,
        message: "Ative o login biométrico no perfil para usar esta opção.",
      };
    }

    try {
      const auth = await refreshService.refresh(credentials.refreshToken);

      tokenManager.setTokens(auth.accessToken, auth.refreshToken);
      await saveAuth(auth);
      await syncBiometricRefreshToken(auth.user.email, auth.refreshToken);
      setUser(auth.user);
      setSigned(true);

      return {
        success: true,
        message: "Login realizado com sucesso.",
      };
    } catch {
      await clearBiometricLogin();

      return {
        success: false,
        message: "Não foi possível entrar com biometria. Use e-mail e senha.",
      };
    }
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
        loginWithBiometric,
        enableBiometricLogin,
        disableBiometricLogin,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
