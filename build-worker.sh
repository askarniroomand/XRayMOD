#!/bin/bash
# XRayMOD Worker Build + Obfuscation
# Uses javascript-obfuscator with browser-no-eval target
# to avoid Cloudflare Error 1101

set -e

echo "Building worker..."
npx wrangler deploy --dry-run --outdir=/tmp/xraymod-build 2>&1 | tail -5

echo "Obfuscating..."
npx javascript-obfuscator /tmp/xraymod-build/index.js \
  --output worker.js \
  --target browser-no-eval \
  --compact true \
  --simplify true \
  --string-array true \
  --string-array-encoding 'rc4' \
  --string-array-threshold 1.0 \
  --string-array-rotate true \
  --string-array-shuffle true \
  --string-array-index-shift true \
  --string-array-wrappers-count 1 \
  --string-array-wrappers-type 'function' \
  --identifier-names-generator 'mangled' \
  --dead-code-injection false \
  --control-flow-flattening false \
  --disable-console-output false

rm -rf /tmp/xraymod-build
echo "Done: worker.js ($(wc -c < worker.js) bytes)"
