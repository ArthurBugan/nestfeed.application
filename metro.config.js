const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

// @sentry/react-native <=8.31 still requires `expo-router/build/global-state/router-store`,
// a module removed in Expo SDK 58 (router state moved; Sentry catches the failure and
// degrades gracefully). Map the stale request to an empty module so Metro skips both
// the exports warning and the nonexistent file, with zero behavior change.
const sentryStaleRequest = "expo-router/build/global-state/router-store";

const uniwindConfig = withUniwindConfig(config, {
  cssEntryFile: "./global.css",
  dtsFile: "./src/uniwind-types.d.ts",
  extraThemes: ['groupify']
});

// Uniwind aliases *every* bare `react-native` import (any importer) to its own
// themed-components shim, which also re-exports the RN namespace (Platform,
// PixelRatio, Animated, ...) — libraries styled through uniwind (heroui-native)
// REQUIRE the alias, because only uniwind's components process `className`.
// The alias is fatal only for libraries importing exports the shim does not
// provide: on SDK 58, expo-asset imports `{ AssetRegistry } from 'react-native'`
// (the standalone @react-native/assets-registry package was removed in RN 0.88)
// so `_reactNative.AssetRegistry.getAssetByID(...)` threw
// "Cannot read property 'getAssetByID' of undefined" and broke useFonts -> white screen.
// Fix: keep uniwind's alias everywhere, but resolve the REAL react-native for
// libraries listed below (add more here as new offenders are discovered).
const realRnPackages = ["expo-asset"];

const uniwindResolve = uniwindConfig.resolver.resolveRequest;
uniwindConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === sentryStaleRequest) {
    // Serve an empty module instead of surfacing the export-map warning.
    return { type: "empty" };
  }
  if (moduleName === "react-native") {
    const origin = context.originModulePath ?? "";
    const needsRealRn = realRnPackages.some((pkg) =>
      origin.includes(`/node_modules/${pkg}/`)
    );
    if (needsRealRn) {
      // Bypass uniwind's alias: resolve straight to the real react-native package.
      return context.resolveRequest(context, moduleName, platform);
    }
  }
  return uniwindResolve(context, moduleName, platform);
};

module.exports = uniwindConfig;
