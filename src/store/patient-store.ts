import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { isAfter, parseISO } from 'date-fns'
import _ from 'lodash'
import validator from 'validator'

import { uuid } from '../util/uuid'
import Patient from '../model/Patient'
import PatientRepository from '../clients/db/PatientRepository'
import RelatedPerson from '../model/RelatedPerson'
import Diagnosis from '../model/Diagnosis'
import Allergy from '../model/Allergy'
import Note from '../model/Note'

interface PatientError {
  message?: string
  givenName?: string
  dateOfBirth?: string
  suffix?: string
  prefix?: string
  familyName?: string
  preferredLanguage?: string
  email?: string
  phoneNumber?: string
}

interface AddRelatedPersonError {
  message?: string
  relatedPerson?: string
  relationshipType?: string
}

interface AddAllergyError {
  message?: string
  name?: string
}

interface AddDiagnosisError {
  message?: string
  name?: string
  date?: string
}

interface AddNoteError {
  message?: string
  note?: string
}

interface PatientState {
  status: 'loading' | 'error' | 'completed'
  isUpdatedSuccessfully: boolean
  patient: Patient
  relatedPersons: Patient[]
  createError?: PatientError
  updateError?: PatientError
  allergyError?: AddAllergyError
  diagnosisError?: AddDiagnosisError
  noteError?: AddNoteError
  relatedPersonError?: AddRelatedPersonError
}

interface PatientActions {
  fetchPatient: (id: string) => Promise<void>
  createPatient: (patient: Patient, onSuccess?: (patient: Patient) => void) => Promise<void>
  updatePatient: (patient: Patient, onSuccess?: (patient: Patient) => void) => Promise<void>
  addRelatedPerson: (
    patientId: string,
    relatedPerson: RelatedPerson,
    onSuccess?: (patient: Patient) => void,
  ) => Promise<void>
  removeRelatedPerson: (
    patientId: string,
    relatedPersonId: string,
    onSuccess?: (patient: Patient) => void,
  ) => Promise<void>
  addDiagnosis: (
    patientId: string,
    diagnosis: Diagnosis,
    onSuccess?: (patient: Patient) => void,
  ) => Promise<void>
  addAllergy: (
    patientId: string,
    allergy: Allergy,
    onSuccess?: (patient: Patient) => void,
  ) => Promise<void>
  addNote: (
    patientId: string,
    note: Note,
    onSuccess?: (patient: Patient) => void,
  ) => Promise<void>
}

function validatePatient(patient: Patient): PatientError {
  const error: PatientError = {}
  const regexContainsNumber = /\d/

  if (!patient.givenName) {
    error.givenName = 'patient.errors.patientGivenNameFeedback'
  }

  if (patient.dateOfBirth) {
    const today = new Date(Date.now())
    const dob = parseISO(patient.dateOfBirth)
    if (isAfter(dob, today)) {
      error.dateOfBirth = 'patient.errors.patientDateOfBirthFeedback'
    }
  }

  if (patient.suffix && regexContainsNumber.test(patient.suffix)) {
    error.suffix = 'patient.errors.patientNumInSuffixFeedback'
  }

  if (patient.prefix && regexContainsNumber.test(patient.prefix)) {
    error.prefix = 'patient.errors.patientNumInPrefixFeedback'
  }

  if (patient.familyName && regexContainsNumber.test(patient.familyName)) {
    error.familyName = 'patient.errors.patientNumInFamilyNameFeedback'
  }

  if (patient.preferredLanguage && regexContainsNumber.test(patient.preferredLanguage)) {
    error.preferredLanguage = 'patient.errors.patientNumInPreferredLanguageFeedback'
  }

  if (patient.email && !validator.isEmail(patient.email)) {
    error.email = 'patient.errors.invalidEmail'
  }

  if (patient.phoneNumber && !validator.isMobilePhone(patient.phoneNumber)) {
    error.phoneNumber = 'patient.errors.invalidPhoneNumber'
  }

  return error
}

function validateRelatedPerson(relatedPerson: RelatedPerson): AddRelatedPersonError {
  const error: AddRelatedPersonError = {}
  if (!relatedPerson.patientId) {
    error.relatedPerson = 'patient.relatedPersons.error.relatedPersonRequired'
  }
  if (!relatedPerson.type) {
    error.relationshipType = 'patient.relatedPersons.error.relationshipTypeRequired'
  }
  return error
}

function validateDiagnosis(diagnosis: Diagnosis): AddDiagnosisError {
  const error: AddDiagnosisError = {}
  if (!diagnosis.name) {
    error.name = 'patient.diagnoses.error.nameRequired'
  }
  if (!diagnosis.diagnosisDate) {
    error.date = 'patient.diagnoses.error.dateRequired'
  }
  return error
}

function validateAllergy(allergy: Allergy): AddAllergyError {
  const error: AddAllergyError = {}
  if (!allergy.name) {
    error.name = 'patient.allergies.error.nameRequired'
  }
  return error
}

function validateNote(note: Note): AddNoteError {
  const error: AddNoteError = {}
  if (!note.text) {
    error.message = 'patient.notes.error.noteRequired'
  }
  return error
}

export const usePatientStore = create<PatientState & PatientActions>()(
  devtools(
    (set, get) => ({
      status: 'loading',
      isUpdatedSuccessfully: false,
      patient: {} as Patient,
      relatedPersons: [],
      createError: undefined,
      updateError: undefined,
      allergyError: undefined,
      diagnosisError: undefined,
      noteError: undefined,
      relatedPersonError: undefined,

      fetchPatient: async (id: string) => {
        set({ status: 'loading', createError: {} }, false, 'fetchPatientStart')
        const patient = await PatientRepository.find(id)
        set({ status: 'completed', patient }, false, 'fetchPatientSuccess')
      },

      createPatient: async (patient: Patient, onSuccess?: (p: Patient) => void) => {
        set({ status: 'loading', createError: {} }, false, 'createPatientStart')
        const newPatientError = validatePatient(patient)

        if (_.isEmpty(newPatientError)) {
          const newPatient = await PatientRepository.save(patient)
          set({ status: 'completed' }, false, 'createPatientSuccess')
          if (onSuccess) onSuccess(newPatient)
        } else {
          newPatientError.message = 'patient.errors.createPatientError'
          set({ status: 'error', createError: newPatientError }, false, 'createPatientError')
        }
      },

      updatePatient: async (patient: Patient, onSuccess?: (p: Patient) => void) => {
        set({ status: 'loading', createError: {} }, false, 'updatePatientStart')
        const updateError = validatePatient(patient)

        if (_.isEmpty(updateError)) {
          const updatedPatient = await PatientRepository.saveOrUpdate(patient)
          set({ status: 'completed', patient: updatedPatient }, false, 'updatePatientSuccess')
          if (onSuccess) onSuccess(updatedPatient)
        } else {
          updateError.message = 'patient.errors.updatePatientError'
          set({ status: 'error', updateError }, false, 'updatePatientError')
        }
      },

      addRelatedPerson: async (
        patientId: string,
        relatedPerson: RelatedPerson,
        onSuccess?: (p: Patient) => void,
      ) => {
        const newRelatedPersonError = validateRelatedPerson(relatedPerson)

        if (_.isEmpty(newRelatedPersonError)) {
          const patient = await PatientRepository.find(patientId)
          const relatedPersons = patient.relatedPersons || []
          relatedPersons.push({ ...relatedPerson, id: uuid() })
          patient.relatedPersons = relatedPersons
          await get().updatePatient(patient, onSuccess)
        } else {
          newRelatedPersonError.message =
            'patient.relatedPersons.error.unableToAddRelatedPerson'
          set(
            { status: 'error', relatedPersonError: newRelatedPersonError },
            false,
            'addRelatedPersonError',
          )
        }
      },

      removeRelatedPerson: async (
        patientId: string,
        relatedPersonId: string,
        onSuccess?: (p: Patient) => void,
      ) => {
        const patient = await PatientRepository.find(patientId)
        patient.relatedPersons = patient.relatedPersons?.filter(
          (r) => r.patientId !== relatedPersonId,
        )
        await get().updatePatient(patient, onSuccess)
      },

      addDiagnosis: async (
        patientId: string,
        diagnosis: Diagnosis,
        onSuccess?: (p: Patient) => void,
      ) => {
        const newDiagnosisError = validateDiagnosis(diagnosis)

        if (_.isEmpty(newDiagnosisError)) {
          const patient = await PatientRepository.find(patientId)
          const diagnoses = patient.diagnoses || []
          diagnoses.push({ ...diagnosis, id: uuid() })
          patient.diagnoses = diagnoses
          await get().updatePatient(patient, onSuccess)
        } else {
          newDiagnosisError.message = 'patient.diagnoses.error.unableToAdd'
          set(
            { status: 'error', diagnosisError: newDiagnosisError },
            false,
            'addDiagnosisError',
          )
        }
      },

      addAllergy: async (
        patientId: string,
        allergy: Allergy,
        onSuccess?: (p: Patient) => void,
      ) => {
        const newAllergyError = validateAllergy(allergy)

        if (_.isEmpty(newAllergyError)) {
          const patient = await PatientRepository.find(patientId)
          const allergies = patient.allergies || []
          allergies.push({ ...allergy, id: uuid() })
          patient.allergies = allergies
          await get().updatePatient(patient, onSuccess)
        } else {
          newAllergyError.message = 'patient.allergies.error.unableToAdd'
          set(
            { status: 'error', allergyError: newAllergyError },
            false,
            'addAllergyError',
          )
        }
      },

      addNote: async (
        patientId: string,
        note: Note,
        onSuccess?: (p: Patient) => void,
      ) => {
        const newNoteError = validateNote(note)

        if (_.isEmpty(newNoteError)) {
          const patient = await PatientRepository.find(patientId)
          const notes = patient.notes || []
          notes.push({ ...note, id: uuid(), date: new Date().toISOString() })
          patient.notes = notes
          await get().updatePatient(patient, onSuccess)
        } else {
          newNoteError.message = 'patient.notes.error.unableToAdd'
          set({ status: 'error', noteError: newNoteError }, false, 'addNoteError')
        }
      },
    }),
    { name: 'PatientStore' },
  ),
)
