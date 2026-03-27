import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import Appointment from '../model/Appointment'
import AppointmentRepository from '../clients/db/AppointmentRepository'

interface AppointmentsState {
  isLoading: boolean
  appointments: Appointment[]
  fetchAppointments: () => Promise<void>
  fetchPatientAppointments: (patientId: string, searchString?: string) => Promise<void>
}

export const useAppointmentsStore = create<AppointmentsState>()(
  devtools(
    (set) => ({
      isLoading: false,
      appointments: [],

      fetchAppointments: async () => {
        set({ isLoading: true }, false, 'fetchAppointmentsStart')
        const appointments = await AppointmentRepository.findAll()
        set({ isLoading: false, appointments }, false, 'fetchAppointmentsSuccess')
      },

      fetchPatientAppointments: async (patientId: string, searchString?: string) => {
        set({ isLoading: true }, false, 'fetchPatientAppointmentsStart')

        let appointments
        if (searchString === undefined || searchString.trim() === '') {
          const query = { selector: { patientId } }
          appointments = await AppointmentRepository.search(query)
        } else {
          appointments = await AppointmentRepository.searchPatientAppointments(
            patientId,
            searchString,
          )
        }

        set({ isLoading: false, appointments }, false, 'fetchPatientAppointmentsSuccess')
      },
    }),
    { name: 'AppointmentsStore' },
  ),
)
