const os = require("os");

function getLanIp() {
  const nets = os.networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family !== "IPv4" || net.internal) continue;
      if (net.address.startsWith("127.")) continue;
      return net.address;
    }
  }

  return null;
}

function resolveApiUrl(rawValue) {
  const value = rawValue.trim();

  if (value === "auto") {
    const ip = getLanIp();
    if (!ip) {
      console.error(
        "❌ Não foi possível detectar o IP local. Defina EXPO_PUBLIC_API_URL manualmente (ex.: http://192.168.0.10:3001/api)"
      );
      process.exit(1);
    }

    const url = `http://${ip}:3001/api`;
    console.log(`[api] Modo auto — IP local detectado: ${ip}`);
    return url;
  }

  if (value === "emulator") {
    const url = "http://10.0.2.2:3001/api";
    console.log("[api] Modo emulator — Android emulador (10.0.2.2)");
    return url;
  }

  return value.replace(/\/+$/, "");
}

module.exports = { getLanIp, resolveApiUrl };
