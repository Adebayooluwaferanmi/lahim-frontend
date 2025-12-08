# React Optimization Guide - Real-Time Read/Write Architecture

This guide explains the optimized React architecture implemented for fast real-time read and write operations.

## Architecture Overview

The application has been scaffolded with a modern, efficient React stack optimized for real-time operations:

### Core Technologies

1. **React Query (TanStack Query) v5** - Server state management with aggressive caching
2. **Zustand** - Lightweight client-side state management for UI state
3. **Centralized API Client** - Optimized HTTP client with retry logic and error handling
4. **Real-time Subscriptions** - WebSocket and SSE support for live updates
5. **Optimistic Updates** - Instant UI feedback for mutations

## Key Features

### 1. Fast Reads (Optimized Caching)

- **Aggressive Caching**: Data is cached for 30 seconds (staleTime) and persisted for 5 minutes (gcTime)
- **Smart Refetching**: Automatically refetches on window focus, network reconnect, and mount
- **Background Updates**: Updates cache in the background without blocking UI

```typescript
import { useApiQuery } from './lib'

// Simple query
const { data, isLoading } = useApiQuery(
  ['patients'],
  '/patients'
)

// Query with parameters
const { data } = useApiQueryWithParams(
  ['patients'],
  '/patients',
  { status: 'active', search: 'John' }
)
```

### 2. Fast Writes (Optimistic Updates)

Mutations provide instant UI feedback with automatic rollback on error:

```typescript
import { useCreateMutation, useUpdateMutation, useDeleteMutation } from './lib'

// Create with optimistic update
const createMutation = useCreateMutation('/patients', {
  queryKey: ['patients'],
  onSuccess: (data) => {
    console.log('Patient created:', data)
  }
})

// Update with optimistic update
const updateMutation = useUpdateMutation(`/patients/${id}`, {
  queryKey: ['patients', id],
  invalidateQueries: [['patients']]
})

// Delete with optimistic update
const deleteMutation = useDeleteMutation(`/patients/${id}`, {
  queryKey: ['patients', id],
  invalidateQueries: [['patients']]
})
```

### 3. Real-Time Subscriptions

Subscribe to real-time updates via WebSocket or Server-Sent Events:

```typescript
import { useRealtimeSubscription } from './lib/realtime'

// Subscribe to real-time updates
useRealtimeSubscription('patients', (event) => {
  if (event.type === 'create') {
    // Handle new patient
    queryClient.invalidateQueries(['patients'])
  } else if (event.type === 'update') {
    // Handle patient update
    queryClient.setQueryData(['patients', event.id], event.data)
  }
})
```

### 4. Centralized API Client

All API calls go through a centralized client with:
- Automatic retry logic (exponential backoff)
- Request/response interceptors
- Error handling
- Timeout management

```typescript
import { apiClient } from './lib'

// GET request
const patients = await apiClient.get<Patient[]>('/patients')

// POST request
const newPatient = await apiClient.post<Patient>('/patients', patientData)

// PUT request
const updated = await apiClient.put<Patient>(`/patients/${id}`, patientData)

// DELETE request
await apiClient.delete(`/patients/${id}`)
```

### 5. UI State Management (Zustand)

Lightweight state management for UI-only state:

```typescript
import { useUIStore } from './store/ui-store'

function MyComponent() {
  const { sidebarCollapsed, toggleSidebar, title, setTitle } = useUIStore()
  
  return (
    <div>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
      <h1>{title}</h1>
    </div>
  )
}
```

## File Structure

```
src/
├── lib/                    # Core utilities
│   ├── api-client.ts      # Centralized API client
│   ├── query-client.ts    # React Query configuration
│   ├── mutations.ts       # Mutation hooks with optimistic updates
│   ├── queries.ts         # Query hooks
│   ├── realtime.ts        # Real-time subscription utilities
│   └── index.ts           # Central exports
├── store/
│   └── ui-store.ts        # Zustand store for UI state
├── components/
│   ├── ErrorBoundary.tsx  # Error boundary component
│   └── LoadingFallback.tsx # Loading fallback for Suspense
└── App.tsx                # Main app with providers
```

## Migration Guide

### Migrating from Redux to React Query

**Before (Redux):**
```typescript
const dispatch = useDispatch()
const patients = useSelector(state => state.patients)

useEffect(() => {
  dispatch(fetchPatients())
}, [dispatch])
```

**After (React Query):**
```typescript
const { data: patients, isLoading } = useApiQuery(
  ['patients'],
  '/patients'
)
```

### Migrating UI State to Zustand

**Before (Redux):**
```typescript
const sidebarCollapsed = useSelector(state => state.components.sidebarCollapsed)
dispatch(updateSidebar())
```

**After (Zustand):**
```typescript
const { sidebarCollapsed, toggleSidebar } = useUIStore()
```

## Best Practices

### 1. Query Keys

Use consistent, hierarchical query keys:

```typescript
// List queries
['patients']
['appointments']

// Single item queries
['patients', id]
['appointments', id]

// Filtered queries
['patients', { status: 'active' }]
```

### 2. Optimistic Updates

Always provide optimistic updates for better UX:

```typescript
const mutation = useCreateMutation('/patients', {
  queryKey: ['patients'],
  onMutate: async (newPatient) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ['patients'] })
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['patients'])
    
    // Optimistically update
    queryClient.setQueryData(['patients'], (old: Patient[]) => [...old, newPatient])
    
    return { previous }
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['patients'], context.previous)
  }
})
```

### 3. Real-Time Integration

Combine React Query with real-time subscriptions:

```typescript
function PatientsList() {
  const { data: patients } = useApiQuery(['patients'], '/patients')
  
  // Subscribe to real-time updates
  useRealtimeSubscription('patients', (event) => {
    if (event.type === 'create') {
      queryClient.setQueryData(['patients'], (old: Patient[]) => [...old, event.data])
    } else if (event.type === 'update') {
      queryClient.setQueryData(['patients'], (old: Patient[]) =>
        old.map(p => p.id === event.id ? event.data : p)
      )
    }
  })
  
  return <div>{/* Render patients */}</div>
}
```

### 4. Error Handling

Use Error Boundaries for graceful error handling:

```typescript
<ErrorBoundary
  fallback={<ErrorComponent />}
  onError={(error, errorInfo) => {
    // Log to error tracking service
    console.error('Error caught:', error, errorInfo)
  }}
>
  <YourComponent />
</ErrorBoundary>
```

## Performance Optimizations

1. **Stale-While-Revalidate**: Data is served from cache while refetching in the background
2. **Request Deduplication**: Multiple components requesting the same data share a single request
3. **Automatic Garbage Collection**: Unused cache entries are automatically cleaned up
4. **Background Refetching**: Data is refreshed when window regains focus or network reconnects
5. **Optimistic Updates**: UI updates instantly before server confirmation

## Environment Variables

```env
REACT_APP_HOSPITALRUN_API=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000  # Optional, defaults to API URL
```

## Development Tools

React Query DevTools are automatically enabled in development mode. Access them via the floating icon in the bottom-right corner.

## Next Steps

1. Migrate existing Redux slices to React Query hooks
2. Implement real-time subscriptions for critical data
3. Add optimistic updates to all mutations
4. Use infinite queries for paginated lists
5. Implement proper error boundaries throughout the app

## Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

