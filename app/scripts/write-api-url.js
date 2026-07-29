#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { loadAppEnv } = require("./load-app-env");
const { resolveApiUrl } = require("./resolve-api-url");

const root = path.join(__dirname, "..");
loadAppEnv(root);

const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;
if (!rawApiUrl?.trim()) {
  console.error("❌ EXPO_PUBLIC_API_URL não definida em app/.env");
  process.exit(1);
}

const apiUrl = resolveApiUrl(rawApiUrl);

const output = path.join(root, "src/config/api-url.generated.ts");
const contents = `// Gerado automaticamente — não editar manualmente
export const API_URL = ${JSON.stringify(apiUrl)};
`;

fs.writeFileSync(output, contents);
console.log(`[api] URL embutida no app: ${apiUrl}`);
console.log("[api] Expo Go: celular e PC precisam estar na mesma rede Wi‑Fi.");
