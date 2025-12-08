# Vite Migration Plan

## Current State Analysis

**Current Setup:**
- `react-app-rewired` + `react-scripts` (Webpack 5)
- Complex `config-overrides.js` (90+ lines)
- Issues: React version conflicts, ESLint conflicts, slow builds
- Node.js polyfills needed: stream, crypto, buffer, process, assert

**Vite Integration Status:**
- ✅ Vitest already configured and working
- ✅ `@vitejs/plugin-react` already installed
- ❌ Dev server still using Webpack
- ❌ Build still using Webpack

## Migration Benefits

1. **Performance:**
   - Dev server startup: ~2-5 seconds (vs 30-60s with Webpack)
   - HMR: Near-instant (vs 1-3s with Webpack)
   - Build time: 30-50% faster

2. **Developer Experience:**
   - Simpler configuration
   - Better error messages
   - Faster feedback loop

3. **Maintenance:**
   - Less custom webpack config
   - Better long-term support
   - Modern tooling ecosystem

## Migration Steps

### Phase 1: Setup Vite Config
1. Create `vite.config.ts` with:
   - React plugin
   - Node.js polyfills
   - React version aliasing
   - Path aliases
   - Environment variables

### Phase 2: Update Dependencies
1. Install `vite` and `vite-plugin-node-polyfills`
2. Keep `react-app-rewired` temporarily for fallback
3. Update scripts to use Vite

### Phase 3: Test & Verify
1. Test dev server
2. Test production build
3. Verify all features work
4. Check bundle size

### Phase 4: Cleanup
1. Remove `react-app-rewired` and `react-scripts`
2. Remove `config-overrides.js`
3. Update documentation

## Estimated Time
- Setup: 2-4 hours
- Testing: 2-3 hours
- Total: 4-7 hours

## Risk Assessment
- **Low Risk**: Vite is mature, well-tested
- **Medium Risk**: Node.js polyfills need testing
- **Mitigation**: Keep webpack setup as backup during migration

