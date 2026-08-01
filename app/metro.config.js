const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.unstable_enableSymlinks = true;

const shimPath = path.resolve(projectRoot, "src/shims/react-native.ts");
const rnOriginalPath = require.resolve("react-native", {
  paths: [projectRoot, workspaceRoot],
});

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react-native-original") {
    return {
      filePath: rnOriginalPath,
      type: "sourceFile",
    };
  }

  if (moduleName === "react-native") {
    const origin = context.originModulePath ?? "";
    const inNodeModules = origin.includes(`${path.sep}node_modules${path.sep}`);
    const inFontShim =
      origin.includes(`${path.sep}src${path.sep}shims${path.sep}react-native`) ||
      origin.includes(`${path.sep}src${path.sep}components${path.sep}ui${path.sep}text`);

    if (!inNodeModules && !inFontShim) {
      return {
        filePath: shimPath,
        type: "sourceFile",
      };
    }
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
