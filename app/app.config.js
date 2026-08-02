const { loadAppEnv } = require("./scripts/load-app-env");
const { resolveApiUrl } = require("./scripts/resolve-api-url");

loadAppEnv(__dirname);

const fs = require("fs");
const path = require("path");
const appJson = require("./app.json");
const packageJson = require("./package.json");
const withAndroidPreferIpv4 = require("./plugins/with-android-prefer-ipv4");

const versionFile = path.join(__dirname, "version.build.json");
const buildMeta = fs.existsSync(versionFile)
  ? JSON.parse(fs.readFileSync(versionFile, "utf8"))
  : { versionCode: 1 };

const rawApiUrl = process.env.EXPO_PUBLIC_API_URL ?? "";
const resolvedApiUrl =
  rawApiUrl.trim() && !["auto", "emulator"].includes(rawApiUrl.trim())
    ? rawApiUrl.trim().replace(/\/+$/, "")
    : resolveApiUrl(rawApiUrl.trim() || "auto");

/** Cleartext só em dev local; builds de produção exigem HTTPS. */
const isProductionBuild =
  process.env.EAS_BUILD === "true" || process.env.NODE_ENV === "production";

if (isProductionBuild && resolvedApiUrl.startsWith("http://")) {
  throw new Error(
    "EXPO_PUBLIC_API_URL deve usar HTTPS em builds de produção."
  );
}

const allowCleartextTraffic =
  !isProductionBuild && resolvedApiUrl.startsWith("http://");

const googleServicesFilePath = path.join(__dirname, "google-services.json");
const hasGoogleServices = fs.existsSync(googleServicesFilePath);

const plugins = (appJson.expo.plugins ?? []).map((plugin) => {
  if (Array.isArray(plugin) && plugin[0] === "expo-build-properties") {
    return [
      "expo-build-properties",
      {
        ...plugin[1],
        android: {
          ...plugin[1].android,
          usesCleartextTraffic: allowCleartextTraffic,
        },
      },
    ];
  }
  return plugin;
});

/** @type {import("@expo/config").ExpoConfig} */
module.exports = {
  ...appJson.expo,
  version: packageJson.version,
  android: {
    ...appJson.expo.android,
    versionCode: buildMeta.versionCode,
    usesCleartextTraffic: allowCleartextTraffic,
    ...(hasGoogleServices ? { googleServicesFile: "./google-services.json" } : {}),
  },
  plugins: [...plugins, withAndroidPreferIpv4],
  extra: {
    ...appJson.expo.extra,
    appVersion: packageJson.version,
    versionCode: buildMeta.versionCode,
    apiUrl: resolvedApiUrl,
    hasGoogleServices,
  },
};
