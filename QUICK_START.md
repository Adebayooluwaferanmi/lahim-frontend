# Quick Start Guide - Testing the Optimized Architecture

## ✅ Installation Complete!

Your React app is now optimized for real-time read/write operations. Follow these steps to verify everything is working.

## 🧪 Verification Steps

### 1. Start the Development Server

```bash
cd packages/frontend
yarn start
# or
npm start
```

### 2. Check for React Query DevTools

Once the app loads, you should see:
- A floating React Query icon in the **bottom-right corner** (development only)
- Click it to open the DevTools and see:
  - All active queries
  - Cache status
  - Query states (loading, success, error)
  - Mutation history

### 3. Test Basic Functionality

#### Test Query Hooks
Navigate to any page that uses data fetching:
- **Lab Orders** (`/lims/lab-orders`)
- **Specimens** (`/lims/specimens`)
- **Instruments** (`/lims/instruments`)
- **Worklists** (`/lims/worklists`)

**What to check:**
- ✅ Data loads correctly
- ✅ Loading states appear briefly
- ✅ No console errors
- ✅ React Query DevTools shows the queries

#### Test Mutation Hooks
Try creating a new item:
- Create a new lab order
- Create a new QC result
- Generate a report

**What to check:**
- ✅ Form submission works
- ✅ UI updates immediately (optimistic update)
- ✅ Success/error messages appear
- ✅ List refreshes automatically

#### Test UI State (Zustand)
- **Sidebar**: Click the collapse/expand button
  - ✅ Sidebar toggles instantly
  - ✅ State persists after page refresh (checked in localStorage)
- **Page Title**: Navigate between pages
  - ✅ Title updates correctly
  - ✅ No Redux warnings in console

### 4. Check Browser Console

Look for:
- ✅ No Redux deprecation warnings
- ✅ No React Query errors
- ✅ WebSocket connection messages (if real-time is enabled)
- ⚠️ Any TypeScript errors

### 5. Verify Performance

Open React Query DevTools and check:
- **Cache Hit Rate**: Should be high after initial load
- **Query Times**: Should be fast (< 100ms for cached data)
- **Background Refetching**: Queries refetch when window regains focus

## 🔍 Common Issues & Solutions

### Issue: "Cannot find module 'zustand'"
**Solution:**
```bash
cd packages/frontend
yarn install
# or
npm install
```

### Issue: React Query DevTools not showing
**Solution:**
- Ensure you're in development mode (`NODE_ENV=development`)
- Check that `@tanstack/react-query-devtools` is installed
- The DevTools only appear in development

### Issue: Hooks returning undefined
**Solution:**
- Check that API server is running
- Verify `REACT_APP_HOSPITALRUN_API` environment variable
- Check browser Network tab for failed requests

### Issue: Optimistic updates not working
**Solution:**
- Ensure mutations use the new mutation hooks (`useCreateMutation`, etc.)
- Check React Query DevTools to see mutation status
- Verify cache invalidation is working

## 📊 Performance Benchmarks

After testing, you should see:

### Before Optimization
- Initial load: ~500-1000ms
- Subsequent loads: ~300-500ms
- Mutation feedback: ~200-300ms delay

### After Optimization
- Initial load: ~500-1000ms (same)
- Subsequent loads: **< 50ms** (from cache) ⚡
- Mutation feedback: **Instant** (optimistic) ⚡

## 🚀 Next Steps

### Immediate
1. ✅ Test all major features
2. ✅ Verify no console errors
3. ✅ Check React Query DevTools

### Short-term
1. **Add Real-time Subscriptions**
   - Implement WebSocket/SSE endpoints on backend
   - Use `RealtimeExample` component as reference
   - Add subscriptions to critical data (lab orders, specimens)

2. **Monitor Performance**
   - Use React Query DevTools to monitor cache hit rates
   - Check Network tab for request optimization
   - Monitor bundle size (should be similar or smaller)

3. **Migrate Remaining Components**
   - Update any components still using old Redux patterns
   - Migrate `useInventory` hook if needed
   - Update any remaining direct `fetch` calls

### Long-term
1. **Remove Redux** (if no longer needed)
   - Keep only for user/auth state if required
   - Remove Redux dependencies once fully migrated

2. **Add Advanced Features**
   - Infinite queries for pagination
   - Prefetching for common navigation paths
   - Request cancellation for unmounted components

## 📚 Resources

- **React Query DevTools**: Click the floating icon in bottom-right
- **Documentation**: See `REACT_OPTIMIZATION_GUIDE.md`
- **Migration Details**: See `MIGRATION_SUMMARY.md`
- **React Query Docs**: https://tanstack.com/query/latest
- **Zustand Docs**: https://zustand-demo.pmnd.rs/

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ No console errors
- ✅ Data loads quickly from cache
- ✅ UI updates instantly on mutations
- ✅ React Query DevTools shows healthy cache
- ✅ Sidebar state persists across refreshes
- ✅ All hooks use the new API client

## 🐛 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check React Query DevTools for query status
3. Verify API server is running
4. Check Network tab for failed requests
5. Review `REACT_OPTIMIZATION_GUIDE.md` for usage examples

---

**Happy coding! 🚀**

