import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

const BIOMETRIC_ENABLED_KEY = "@app:biometric_login_enabled";
const BIOMETRIC_CREDENTIALS_KEY = "biometric_login_credentials";

const AUTHENTICATION_PROMPT = "Use sua digital para entrar.";
const ENABLE_PROMPT = "Confirme sua digital para ativar o login biométrico.";

export type BiometricCredentials = {
  email: string;
  refreshToken: string;
};

export async function isBiometricHardwareAvailable() {
  if (Platform.OS === "web") {
    return false;
  }

  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  return hasHardware && isEnrolled;
}

export async function isBiometricLoginEnabled() {
  const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
  return value === "true";
}

export async function isBiometricLoginReady() {
  const [available, enabled] = await Promise.all([
    isBiometricHardwareAvailable(),
    isBiometricLoginEnabled(),
  ]);

  return available && enabled;
}

export async function saveBiometricCredentials(
  email: string,
  refreshToken: string
) {
  await SecureStore.setItemAsync(
    BIOMETRIC_CREDENTIALS_KEY,
    JSON.stringify({ email, refreshToken }),
    {
      requireAuthentication: true,
      authenticationPrompt: AUTHENTICATION_PROMPT,
    }
  );
  await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, "true");
}

export async function getBiometricCredentials() {
  const enabled = await isBiometricLoginEnabled();
  if (!enabled) {
    return null;
  }

  try {
    const data = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY, {
      requireAuthentication: true,
      authenticationPrompt: AUTHENTICATION_PROMPT,
    });

    if (!data) {
      return null;
    }

    return JSON.parse(data) as BiometricCredentials;
  } catch {
    return null;
  }
}

export async function syncBiometricRefreshToken(
  email: string,
  refreshToken: string
) {
  const enabled = await isBiometricLoginEnabled();
  if (!enabled) {
    return;
  }

  await saveBiometricCredentials(email, refreshToken);
}

export async function clearBiometricLogin() {
  await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);

  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
  } catch {
    // Item may not exist.
  }
}

export async function authenticateBiometric(prompt = AUTHENTICATION_PROMPT) {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: prompt,
    cancelLabel: "Cancelar",
    disableDeviceFallback: false,
  });

  return result.success;
}

export async function getBiometricLabel() {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return "Face ID";
  }

  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return "digital";
  }

  return "biometria";
}
