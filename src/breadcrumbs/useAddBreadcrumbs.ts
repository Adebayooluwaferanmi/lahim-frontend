import { useEffect, useMemo, useRef } from 'react'
import { useUIStore } from '../store/ui-store'
import Breadcrumb from '../model/Breadcrumb'

/**
 * Hook to add or remove breadcrumbs
 * Uses Zustand for fast UI state updates
 * Fixed to prevent infinite loops by memoizing dependencies
 */
export default function useAddBreadcrumbs(breadcrumbs: Breadcrumb[], withDashboard = false): void {
  const addBreadcrumbs = useUIStore((state) => state.addBreadcrumbs)
  const removeBreadcrumbs = useUIStore((state) => state.removeBreadcrumbs)

  // Memoize breadcrumbs array to prevent recreation on every render
  const breadcrumbsToAdd = useMemo(
    () =>
      withDashboard
        ? [...breadcrumbs, { i18nKey: 'dashboard.label', location: '/' }]
        : breadcrumbs,
    // Create a stable key from breadcrumbs for comparison
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(breadcrumbs), withDashboard]
  )

  // Use ref to track what was added for cleanup
  const addedBreadcrumbsRef = useRef<Breadcrumb[] | null>(null)

  useEffect(() => {
    // Store what we're adding
    addedBreadcrumbsRef.current = breadcrumbsToAdd
    addBreadcrumbs(breadcrumbsToAdd)

    return () => {
      // Cleanup: remove only what we added
      if (addedBreadcrumbsRef.current) {
        removeBreadcrumbs(addedBreadcrumbsRef.current)
        addedBreadcrumbsRef.current = null
      }
    }
    // Zustand selectors are stable, so we don't need them in deps
    // Only depend on the memoized breadcrumbs array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breadcrumbsToAdd])
}
