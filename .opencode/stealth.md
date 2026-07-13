# Stealth Techniques — XRayMOD

Based on research from cfnew and Nova-Proxy.

## Anti-Detection Layers

| Layer | Technique | Effect |
|-------|-----------|--------|
| UUID Gate | Path-based auth | 404 for unauthorized requests |
| Homepage | SPA fallback | Legitimate-looking root page |
| Obfuscation | RC4 string array | Hides protocol names from grep |
| Farsi Names | Variable naming | Defeats English keyword scanning |
| Socket Bootstrap | `request.fetcher.connect()` | Avoids `cloudflare:sockets` import |
| No eval | `browser-no-eval` target | Prevents Error 1101 |
| No node: imports | Removed `nodejs_compat` | No polyfill detection |
| Random Names | `cf-{hex}` worker names | No pattern fingerprinting |

## What Triggers Error 1101

Cloudflare blocks workers that:
1. Use `eval()` or `new Function()`
2. Import `cloudflare:sockets` at module level
3. Have `node:stream` or `node:events` polyfills
4. Use control-flow flattening in obfuscation

## Our Mitigations

1. `browser-no-eval` obfuscation target
2. `request.fetcher.connect()` instead of `import { connect }`
3. No `nodejs_compat` flag
4. No control-flow flattening
5. Farsi variable names (anti-grep)
6. Base64-encoded protocol names
