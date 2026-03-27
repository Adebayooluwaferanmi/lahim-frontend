import { useEffect } from 'react'
import { useUIStore } from '../store/ui-store'

/**
 * Hook to set the page title
 * Uses Zustand for fast UI state updates
 */
export default function useTitle(title: string): void {
  const setTitle = useUIStore((state) => state.setTitle)

  useEffect(() => {
    setTitle(title)
  }, [title, setTitle])
}
