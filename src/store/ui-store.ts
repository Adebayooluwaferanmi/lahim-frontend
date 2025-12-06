/**
 * Zustand store for UI state management
 * Lightweight alternative to Redux for client-side UI state
 * Optimized for fast read/write operations
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import Breadcrumb from '../model/Breadcrumb'

interface UIState {
  // Sidebar state
  sidebarCollapsed: boolean
  
  // Title state
  title: string
  
  // Breadcrumbs state
  breadcrumbs: Breadcrumb[]
  
  // Button bar state
  buttons: React.ReactNode[]
  
  // Actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setTitle: (title: string) => void
  addBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void
  removeBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void
  setButtons: (buttons: React.ReactNode[]) => void
}

// Load sidebar state from localStorage
const getInitialSidebarState = (): boolean => {
  try {
    const stored = localStorage.getItem('ui-storage')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed?.state?.sidebarCollapsed ?? false
    }
  } catch {
    // Ignore errors
  }
  return false
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // Initial state
      sidebarCollapsed: getInitialSidebarState(),
      title: '',
      breadcrumbs: [],
      buttons: [],

      // Actions
      toggleSidebar: () => {
        set((state) => {
          const newState = !state.sidebarCollapsed
          // Persist to localStorage
          try {
            localStorage.setItem('ui-storage', JSON.stringify({ state: { sidebarCollapsed: newState } }))
          } catch {
            // Ignore errors
          }
          return { sidebarCollapsed: newState }
        }, false, 'toggleSidebar')
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed')
        // Persist to localStorage
        try {
          localStorage.setItem('ui-storage', JSON.stringify({ state: { sidebarCollapsed: collapsed } }))
        } catch {
          // Ignore errors
        }
      },

        setTitle: (title: string) =>
          set({ title }, false, 'setTitle'),

        addBreadcrumbs: (newBreadcrumbs: Breadcrumb[]) =>
          set((state) => {
            const combined = state.breadcrumbs.concat(newBreadcrumbs)
            // Sort by location length (shorter paths first)
            const sorted = combined.sort((b1, b2) => b1.location.length - b2.location.length)
            return { breadcrumbs: sorted }
          }, false, 'addBreadcrumbs'),

        removeBreadcrumbs: (breadcrumbsToRemove: Breadcrumb[]) =>
          set((state) => {
            const locations = breadcrumbsToRemove.map((b) => b.location)
            const filtered = state.breadcrumbs.filter(
              (breadcrumb) => !locations.includes(breadcrumb.location)
            )
            return { breadcrumbs: filtered }
          }, false, 'removeBreadcrumbs'),

        setButtons: (buttons: React.ReactNode[]) =>
          set({ buttons }, false, 'setButtons'),
    }),
    { name: 'UIStore' }
  )
)

