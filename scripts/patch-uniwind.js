/**
 * Patches uniwind's native store so CSS-variable theme overrides don't crash.
 *
 * Why: `Object.assign` always performs strict-mode assignment, and uniwind's
 * `reinit` copies each theme's variable map onto a prototype-chained clone
 * (`Object.create(baseVars)`). When a key exists as a *getter-only accessor*
 * on the prototype (uniwind.css's regenerated `@theme { --background: unset; … }`
 * defaults are emitted as lazy getters for the base vars), that assignment
 * throws: `Cannot set property '--background' which has only a getter`.
 * Every app that overrides one of those vars in a theme (heroui-native setups
 * always do, e.g. `@variant light { --background: … }`) crashes at boot in dev.
 *
 * The fix copies property *descriptors* (getters stay lazy) instead of using
 * Object.assign, in two places in uniwind/src/core/native/store.ts:
 *   1. `reinit`   — theme maps onto their per-theme clone
 *   2. `resolveStyles` — scoped runtime variables onto the overlay clone
 *
 * Idempotent: exits 0 without changes when the patch marker already exists.
 * Runs automatically via the `postinstall` npm script.
 */
const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, '..', 'node_modules', 'uniwind', 'src', 'core', 'native', 'store.ts');

const ORIGINAL_ASSIGNS = [
  `            if (themeVars) {\n                Object.assign(clonedVars, themeVars)\n            }`,
  `            ? themeVars\n            : Object.assign(\n                Object.create(themeVars) as Vars,\n                getScopedVars(uniwindContext.variables),\n            )`,
];

if (!fs.existsSync(storePath)) {
  console.error('[patch-uniwind] store.ts not found — uniwind not installed? Skipping.');
  process.exit(0);
}

const source = fs.readFileSync(storePath, 'utf8');

if (source.includes('mergeVarDescriptors')) {
  // Already patched.
  process.exit(0);
}

if (!source.includes(ORIGINAL_ASSIGNS[0]) || !source.includes(ORIGINAL_ASSIGNS[1])) {
  console.error(
    '[patch-uniwind] Expected code shape not found in uniwind store.ts — the package may have changed; review manually.'
  );
  process.exit(1);
}

const PATCHED_ASSIGNS = [
  `            if (themeVars) {\n                mergeVarDescriptors(clonedVars, themeVars)\n            }`,
  `            ? themeVars\n            : mergeVarDescriptors(\n                Object.create(themeVars) as Vars,\n                getScopedVars(uniwindContext.variables),\n            )`,
];

let patched = source;
for (let i = 0; i < ORIGINAL_ASSIGNS.length; i++) {
  patched = patched.replace(ORIGINAL_ASSIGNS[i], PATCHED_ASSIGNS[i]);
}

const HELPER = `const mergeVarDescriptors = (target: Vars, source: Record<string, unknown>) => {
    // Object.assign always performs strict-mode assignment; copying descriptors
    // instead lets getter-only vars (from uniwind.css @theme defaults) be
    // overridden per theme without throwing. Getters stay lazy.
    for (const key of Object.getOwnPropertyNames(source)) {
        const descriptor = Object.getOwnPropertyDescriptor(source, key)
        if (descriptor) {
            Object.defineProperty(target, key, {
                configurable: true,
                enumerable: true,
                ...descriptor,
            })
        }
    }
    return target as Vars
}

`;
patched = patched.replace('class UniwindStoreBuilder {', HELPER + 'class UniwindStoreBuilder {', 1);

fs.writeFileSync(storePath, patched);
console.log('[patch-uniwind] applied descriptor-merge patch to', storePath);
