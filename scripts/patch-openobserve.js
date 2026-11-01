/**
 * Patches @openobserve/mobile-react-native's Obj-C bridge files so they import
 * React's header before the codegen-generated -Swift.h.
 *
 * Why: the generated OpenObserveSDKReactNative-Swift.h declares methods whose
 * signatures use the RCTPromiseResolveBlock / RCTPromiseRejectBlock typedefs,
 * which live in <React/RCTBridgeModule.h>. The SDK's .mm files import only the
 * -Swift.h and count on it being self-contained; on React Native >= 0.87 with
 * static frameworks (see app.json useFrameworks: "static") those typedefs are
 * not visible, and every .mm fails with dozens of
 * "unknown type name 'RCTPromiseResolveBlock'" errors inside the -Swift.h.
 * (Upstream: openobserve/openobserve-react-native-rum — the umbrella header
 * DOES import RCTBridgeModule.h, but the -Swift.h is imported by the .mm
 * files directly, before/independent of the umbrella.)
 *
 * The fix inserts a guarded `#import <React/RCTBridgeModule.h>` at the top of
 * every *.mm under ios/Sources, before the -Swift.h import.
 *
 * Idempotent: exits 0 without changes when the patch marker already exists.
 * Runs automatically via the `postinstall` npm script, right after
 * patch-uniwind.js.
 */
const fs = require('fs');
const path = require('path');

const sourcesDir = path.join(
  __dirname,
  '..',
  'node_modules',
  '@openobserve',
  'mobile-react-native',
  'ios',
  'Sources',
);

const PATCH_MARKER = 'patch-openobserve.js';
const IMPORT_BLOCK = `// imported by scripts/${PATCH_MARKER}: the codegen -Swift.h declares methods with
// RCTPromiseResolveBlock / RCTPromiseRejectBlock typedefs, which live in
// React's RCTBridgeModule.h and are not otherwise visible to this .mm
// (React Native >= 0.87 with static frameworks).
#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#elif __has_include("React/RCTBridgeModule.h")
#import "React/RCTBridgeModule.h"
#elif __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#endif
`;

if (!fs.existsSync(sourcesDir)) {
  console.error(
    '[patch-openobserve] ios/Sources not found — @openobserve/mobile-react-native not installed? Skipping.'
  );
  process.exit(0);
}

const mmFiles = fs.readdirSync(sourcesDir).filter((f) => f.endsWith('.mm'));
if (mmFiles.length === 0) {
  console.error('[patch-openobserve] no .mm files found — package layout changed? Skipping.');
  process.exit(0);
}

let patched = 0;
for (const file of mmFiles) {
  const filePath = path.join(sourcesDir, file);
  const source = fs.readFileSync(filePath, 'utf8');

  if (source.includes(PATCH_MARKER)) continue;

  if (source.includes('RCTBridgeModule.h')) {
    // Already imports React's header some other way — nothing to do.
    continue;
  }

  // Insert right after the top license comment block so the import precedes
  // the -Swift.h include (which is always the first import in these files).
  fs.writeFileSync(filePath, IMPORT_BLOCK + source);
  patched++;
}

console.log(`[patch-openobserve] imported React/RCTBridgeModule.h into ${patched} .mm file(s)`);
