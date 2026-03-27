import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import Patient from '../model/Patient'
import PatientRepository from '../clients/db/PatientRepository'

interface PatientsState {
  isLoading: boolean
  patients: Patient[]
  fetchPatients: () => Promise<void>
  searchPatients: (searchString: string) => Promise<void>
}

export const usePatientsStore = create<PatientsState>()(
  devtools(
    (set) => ({
      isLoading: false,
      patients: [],

      fetchPatients: async () => {
        set({ isLoading: true }, false, 'fetchPatientsStart')
        const patients = await PatientRepository.findAll()
        set({ isLoading: false, patients }, false, 'fetchPatientsSuccess')
      },

      searchPatients: async (searchString: string) => {
        set({ isLoading: true }, false, 'searchPatientsStart')
        const patients =
          searchString.trim() === ''
            ? await PatientRepository.findAll()
            : await PatientRepository.search(searchString)
        set({ isLoading: false, patients }, false, 'searchPatientsSuccess')
      },
    }),
    { name: 'PatientsStore' },
  ),
)
