# package.json
- Do NOT use `./dist/` prefix in `main` or `types` fields in package.json files; use `./src/` instead to avoid `/dist/dist` resolution errors during `pnpm dev`. Confidence: 0.85
- The `exports` field in package.json must point to `./dist/` paths (e.g. `./dist/src/index.js`), not `./src/`, for aliases to resolve correctly during `pnpm dev`. Confidence: 0.70

# Nx

# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

