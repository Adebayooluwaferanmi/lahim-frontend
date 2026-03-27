import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import Lab from '../model/Lab'
import Patient from '../model/Patient'
import LabRepository from '../clients/db/LabRepository'
import PatientRepository from '../clients/db/PatientRepository'

interface LabError {
  result?: string
  patient?: string
  type?: string
  message?: string
}

interface LabState {
  error: LabError
  lab?: Lab
  patient?: Patient
  status: 'loading' | 'error' | 'success'
  fetchLab: (labId: string) => Promise<void>
  requestLab: (newLab: Lab, onSuccess?: (lab: Lab) => void) => Promise<void>
  cancelLab: (labToCancel: Lab, onSuccess?: (lab: Lab) => void) => Promise<void>
  completeLab: (labToComplete: Lab, onSuccess?: (lab: Lab) => void) => Promise<void>
  updateLab: (labToUpdate: Lab, onSuccess?: (lab: Lab) => void) => Promise<void>
}

const validateLabRequest = (newLab: Lab): LabError => {
  const labRequestError: LabError = {}
  if (!newLab.patientId) {
    labRequestError.patient = 'labs.requests.error.patientRequired'
  }
  if (!newLab.type) {
    labRequestError.type = 'labs.requests.error.typeRequired'
  }
  return labRequestError
}

const validateCompleteLab = (labToComplete: Lab): LabError => {
  const completeError: LabError = {}
  if (!labToComplete.result) {
    completeError.result = 'labs.requests.error.resultRequiredToComplete'
  }
  return completeError
}

export const useLabStore = create<LabState>()(
  devtools(
    (set) => ({
      error: {},
      lab: undefined,
      patient: undefined,
      status: 'loading',

      fetchLab: async (labId: string) => {
        set({ status: 'loading' }, false, 'fetchLabStart')
        const fetchedLab = await LabRepository.find(labId)
        const fetchedPatient = await PatientRepository.find(fetchedLab.patientId)
        set(
          { status: 'success', lab: fetchedLab, patient: fetchedPatient },
          false,
          'fetchLabSuccess',
        )
      },

      requestLab: async (newLab: Lab, onSuccess?: (lab: Lab) => void) => {
        set({ status: 'loading' }, false, 'requestLabStart')
        const labRequestError = validateLabRequest(newLab)

        if (Object.keys(labRequestError).length > 0) {
          labRequestError.message = 'labs.requests.error.unableToRequest'
          set({ status: 'error', error: labRequestError }, false, 'requestLabError')
        } else {
          newLab.status = 'requested'
          newLab.requestedOn = new Date(Date.now().valueOf()).toISOString()
          const requestedLab = await LabRepository.save(newLab)
          set({ status: 'success', lab: requestedLab, error: {} }, false, 'requestLabSuccess')
          if (onSuccess) onSuccess(requestedLab)
        }
      },

      cancelLab: async (labToCancel: Lab, onSuccess?: (lab: Lab) => void) => {
        set({ status: 'loading' }, false, 'cancelLabStart')
        labToCancel.canceledOn = new Date(Date.now().valueOf()).toISOString()
        labToCancel.status = 'canceled'
        const canceledLab = await LabRepository.saveOrUpdate(labToCancel)
        set({ status: 'success', lab: canceledLab, error: {} }, false, 'cancelLabSuccess')
        if (onSuccess) onSuccess(canceledLab)
      },

      completeLab: async (labToComplete: Lab, onSuccess?: (lab: Lab) => void) => {
        set({ status: 'loading' }, false, 'completeLabStart')
        const completeLabErrors = validateCompleteLab(labToComplete)

        if (Object.keys(completeLabErrors).length > 0) {
          completeLabErrors.message = 'labs.requests.error.unableToComplete'
          set({ status: 'error', error: completeLabErrors }, false, 'completeLabError')
        } else {
          labToComplete.completedOn = new Date(Date.now().valueOf()).toISOString()
          labToComplete.status = 'completed'
          const completedLab = await LabRepository.saveOrUpdate(labToComplete)
          set({ status: 'success', lab: completedLab, error: {} }, false, 'completeLabSuccess')
          if (onSuccess) onSuccess(completedLab)
        }
      },

      updateLab: async (labToUpdate: Lab, onSuccess?: (lab: Lab) => void) => {
        set({ status: 'loading' }, false, 'updateLabStart')
        const updatedLab = await LabRepository.saveOrUpdate(labToUpdate)
        set({ status: 'success', lab: updatedLab, error: {} }, false, 'updateLabSuccess')
        if (onSuccess) onSuccess(updatedLab)
      },
    }),
    { name: 'LabStore' },
  ),
)
