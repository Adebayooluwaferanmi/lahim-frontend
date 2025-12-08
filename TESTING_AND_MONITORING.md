# Testing and Performance Monitoring Guide

## 🧪 Testing the Optimized Architecture

### 1. Start the Development Server

```bash
cd packages/frontend
yarn start
# or
npm start
```

### 2. Verify React Query DevTools

Once the app loads:
- Look for the **floating React Query icon** in the bottom-right corner
- Click it to open DevTools
- You should see:
  - Active queries list
  - Query status (fresh, stale, fetching)
  - Cache data
  - Mutation history

### 3. Test Key Features

#### ✅ Query Hooks (Fast Reads)
Navigate to these pages and verify:

1. **Lab Orders** (`/lims/lab-orders`)
   - ✅ Data loads correctly
   - ✅ Loading spinner appears briefly
   - ✅ Subsequent visits are instant (from cache)
   - ✅ React Query DevTools shows query status

2. **Specimens** (`/lims/specimens`)
   - ✅ Same as above
   - ✅ Filtering works (status, type)
   - ✅ Cache is used for filtered queries

3. **Instruments** (`/lims/instruments`)
   - ✅ List loads quickly
   - ✅ Individual instrument pages load from cache

4. **Worklists** (`/lims/worklists`)
   - ✅ List loads with filters
   - ✅ Cache persists across navigation

#### ✅ Mutation Hooks (Fast Writes)
Test creating/updating data:

1. **Create Lab Order**
   - Navigate to `/lims/lab-orders/new`
   - Fill form and submit
   - ✅ UI updates immediately (optimistic update)
   - ✅ Success message appears
   - ✅ List refreshes automatically
   - ✅ React Query DevTools shows mutation

2. **Create QC Result**
   - Navigate to `/lims/qc-results/new`
   - Submit form
   - ✅ Same optimistic behavior

3. **Generate Report**
   - Navigate to `/lims/reports/generate`
   - Generate a report
   - ✅ Mutation completes successfully

#### ✅ UI State (Zustand)
Test UI state management:

1. **Sidebar**
   - Click collapse/expand button
   - ✅ Sidebar toggles instantly
   - ✅ State persists after page refresh
   - ✅ No Redux warnings in console

2. **Page Title**
   - Navigate between pages
   - ✅ Title updates correctly
   - ✅ No delays

3. **Breadcrumbs**
   - Navigate to nested pages
   - ✅ Breadcrumbs appear correctly
   - ✅ Clicking breadcrumbs navigates
   - ✅ Breadcrumbs update on navigation

### 4. Performance Monitoring

#### Using React Query DevTools

1. **Open DevTools** (bottom-right icon)

2. **Check Query Status**
   - Green dot = Fresh data
   - Yellow dot = Stale data
   - Blue dot = Fetching
   - Gray dot = Inactive

3. **Monitor Cache Hit Rate**
   - Navigate between pages
   - Check if queries are served from cache
   - High cache hit rate = good performance

4. **Check Query Times**
   - Hover over queries to see timing
   - Cached queries should be < 50ms
   - Network queries should be < 500ms

5. **Monitor Mutations**
   - Check mutation history
   - Verify optimistic updates
   - Check error handling

#### Browser DevTools

1. **Network Tab**
   - Check request count
   - Verify request deduplication
   - Check for unnecessary refetches

2. **Performance Tab**
   - Record performance
   - Check render times
   - Verify no unnecessary re-renders

3. **Console**
   - ✅ No Redux warnings
   - ✅ No React Query errors
   - ✅ No TypeScript errors
   - ⚠️ Check for WebSocket connection messages

### 5. Real-time Testing (When Backend is Ready)

#### WebSocket Connection
1. Check browser console for:
   ```
   [WebSocket] Connected
   ```

2. Test real-time updates:
   - Open lab orders page in two browser tabs
   - Create a new order in one tab
   - ✅ Order appears in other tab automatically

3. Test reconnection:
   - Disconnect network briefly
   - ✅ WebSocket reconnects automatically
   - ✅ Data syncs after reconnection

#### Server-Sent Events (SSE)
1. If using SSE instead of WebSocket:
   - Check Network tab for SSE connection
   - Verify events are received

2. Test event handling:
   - Trigger events from backend
   - ✅ UI updates automatically

## 📊 Performance Benchmarks

### Expected Performance

| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Initial Load | 500-1000ms | 500-1000ms | Same |
| Cached Load | 300-500ms | **< 50ms** | **10x faster** ⚡ |
| Mutation Feedback | 200-300ms | **Instant** | **Instant** ⚡ |
| UI State Update | 10-20ms | **1-2ms** | **10x faster** ⚡ |
| Bundle Size | ~50KB Redux | **~35KB** | **30% smaller** 📉 |

### Cache Performance

- **Cache Hit Rate**: Should be > 80% after initial load
- **Stale Time**: 30 seconds (data fresh for 30s)
- **Cache Time**: 5 minutes (data persists for 5min)
- **Background Refetch**: On window focus, network reconnect

## 🐛 Troubleshooting

### Issue: Queries not caching
**Check:**
- Query keys are consistent
- No unnecessary query invalidation
- Stale time is set correctly

**Solution:**
- Verify query keys match across components
- Check React Query DevTools for query status

### Issue: Optimistic updates not working
**Check:**
- Mutations use new mutation hooks
- Cache invalidation is correct
- Error handling is in place

**Solution:**
- Use `useCreateMutation`, `useUpdateMutation`, etc.
- Check React Query DevTools for mutation status

### Issue: Real-time not working
**Check:**
- WebSocket/SSE endpoint is available
- Connection is established
- Event format matches expected

**Solution:**
- Check browser console for connection errors
- Verify backend WebSocket/SSE implementation
- Check event format in React Query DevTools

### Issue: UI state not persisting
**Check:**
- Zustand persist middleware is working
- localStorage is available
- State is being saved

**Solution:**
- Check browser localStorage
- Verify Zustand store configuration
- Check for localStorage errors in console

## ✅ Success Criteria

You'll know everything is working when:

- ✅ No console errors
- ✅ Data loads quickly from cache
- ✅ UI updates instantly on mutations
- ✅ React Query DevTools shows healthy cache
- ✅ Sidebar state persists across refreshes
- ✅ All hooks use the new API client
- ✅ Real-time updates work (when backend ready)
- ✅ Bundle size is reduced
- ✅ Performance is improved

## 📝 Testing Checklist

- [ ] App starts without errors
- [ ] React Query DevTools appears
- [ ] All query hooks work correctly
- [ ] All mutation hooks work correctly
- [ ] UI state (sidebar, title, breadcrumbs) works
- [ ] Cache is being used effectively
- [ ] Optimistic updates work
- [ ] Error handling works
- [ ] Real-time subscriptions work (when backend ready)
- [ ] Performance is improved
- [ ] No Redux warnings
- [ ] Bundle size is reduced

## 🚀 Next Steps After Testing

1. **Monitor Performance**
   - Use React Query DevTools regularly
   - Check cache hit rates
   - Monitor query times

2. **Add Real-time**
   - Implement WebSocket/SSE endpoints
   - Use `realtime-integration.tsx` as reference
   - Test with multiple clients

3. **Optimize Further**
   - Add infinite queries for pagination
   - Implement prefetching
   - Add request cancellation

4. **Documentation**
   - Document any custom hooks
   - Update team on new patterns
   - Share performance improvements

---

**Happy testing! 🎉**

