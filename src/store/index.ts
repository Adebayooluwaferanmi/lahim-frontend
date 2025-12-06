import { configureStore, combineReducers, Action } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import { ThunkAction } from 'redux-thunk'
import patient from '../patients/patient-slice'
import patients from '../patients/patients-slice'
import appointment from '../scheduling/appointments/appointment-slice'
import appointments from '../scheduling/appointments/appointments-slice'
import user from '../user/user-slice'
import lab from '../labs/lab-slice'

/**
 * Minimal Redux store - only for complex state that hasn't been migrated yet
 * UI state (sidebar, title, breadcrumbs) is now in Zustand for better performance
 * 
 * Remaining Redux slices:
 * - user: Authentication and permissions (keep for now)
 * - patient/patients: Patient data management (complex, keep for now)
 * - appointment/appointments: Appointment data management (complex, keep for now)
 * - lab: Lab data management (complex, keep for now)
 * 
 * Migrated to Zustand:
 * - title: Now in ui-store
 * - breadcrumbs: Now in ui-store
 * - components (sidebar): Now in ui-store
 */
const reducer = combineReducers({
  patient,
  patients,
  user,
  appointment,
  appointments,
  lab,
})

const store = configureStore({
  reducer,
})

export type AppDispatch = typeof store.dispatch
export type AppThunk = ThunkAction<void, RootState, null, Action<string>>
export type RootState = ReturnType<typeof reducer>

// Typed hooks for use in components
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store
