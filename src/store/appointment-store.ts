import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import Appointment from '../model/Appointment'
import Patient from '../model/Patient'
import AppointmentRepository from '../clients/db/AppointmentRepository'
import PatientRepository from '../clients/db/PatientRepository'

interface AppointmentState {
  appointment: Appointment
  patient: Patient
  isLoading: boolean
  fetchAppointment: (id: string) => Promise<void>
  createAppointment: (
    appointment: Appointment,
    onSuccess?: (appointment: Appointment) => void,
  ) => Promise<void>
  updateAppointment: (
    appointment: Appointment,
    onSuccess?: (appointment: Appointment) => void,
  ) => Promise<void>
  deleteAppointment: (appointment: Appointment, onSuccess?: () => void) => Promise<void>
}

export const useAppointmentStore = create<AppointmentState>()(
  devtools(
    (set) => ({
      appointment: {} as Appointment,
      patient: {} as Patient,
      isLoading: false,

      fetchAppointment: async (id: string) => {
        set({ isLoading: true }, false, 'fetchAppointmentStart')
        const appointment = await AppointmentRepository.find(id)
        const patient = await PatientRepository.find(appointment.patientId)
        set({ isLoading: false, appointment, patient }, false, 'fetchAppointmentSuccess')
      },

      createAppointment: async (
        appointment: Appointment,
        onSuccess?: (a: Appointment) => void,
      ) => {
        set({ isLoading: true }, false, 'createAppointmentStart')
        const newAppointment = await AppointmentRepository.save(appointment)
        set({ isLoading: false }, false, 'createAppointmentSuccess')
        if (onSuccess) onSuccess(newAppointment)
      },

      updateAppointment: async (
        appointment: Appointment,
        onSuccess?: (a: Appointment) => void,
      ) => {
        set({ isLoading: true }, false, 'updateAppointmentStart')
        const updatedAppointment = await AppointmentRepository.saveOrUpdate(appointment)
        set(
          { isLoading: false, appointment: updatedAppointment },
          false,
          'updateAppointmentSuccess',
        )
        if (onSuccess) onSuccess(updatedAppointment)
      },

      deleteAppointment: async (appointment: Appointment, onSuccess?: () => void) => {
        set({ isLoading: true }, false, 'deleteAppointmentStart')
        await AppointmentRepository.delete(appointment)
        set({ isLoading: false }, false, 'deleteAppointmentSuccess')
        if (onSuccess) onSuccess()
      },
    }),
    { name: 'AppointmentStore' },
  ),
)
