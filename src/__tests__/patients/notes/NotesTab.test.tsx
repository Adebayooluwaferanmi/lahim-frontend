import '../../../__mocks__/matchMediaMock'
import React from 'react'
import PatientRepository from 'clients/db/PatientRepository'
import Note from 'model/Note'
import { createMemoryHistory } from 'history'
import Patient from 'model/Patient'
import { mount } from 'enzyme'
import { Router } from 'react-router-dom'
import NoteTab from 'patients/notes/NoteTab'
import * as components from '@lahim/components'
import { act } from 'react-dom/test-utils'
import Permissions from '../../../model/Permissions'
import { usePatientStore } from '../../../store/patient-store'
import { useUserStore } from '../../../store/user-store'

const expectedPatient = {
  id: '123',
  notes: [{ date: new Date().toISOString(), text: 'notes1' } as Note],
} as Patient

const navigate = createMemoryHistory()

const setup = (patient = expectedPatient, permissions = [Permissions.WritePatients]) => {
  usePatientStore.setState({
    patient,
    status: 'completed',
    fetchPatient: vi.fn(),
    createPatient: vi.fn(),
    updatePatient: vi.fn(),
    addRelatedPerson: vi.fn(),
    removeRelatedPerson: vi.fn(),
    addDiagnosis: vi.fn(),
    addAllergy: vi.fn(),
    addNote: vi.fn(),
  })
  useUserStore.setState({ permissions })

  const wrapper = mount(
    <Router history={history}>
      <NoteTab patient={patient} />
    </Router>,
  )

  return wrapper
}

describe('Notes Tab', () => {
  describe('Add New Note', () => {
    beforeEach(() => {
      vi.resetAllMocks()
      vi.spyOn(PatientRepository, 'saveOrUpdate')
    })

    it('should render a add notes button', () => {
      const wrapper = setup()

      const addNoteButton = wrapper.find(components.Button)
      expect(addNoteButton).toHaveLength(1)
      expect(addNoteButton.text().trim()).toEqual('patient.notes.new')
    })

    it('should not render a add notes button if the user does not have permissions', () => {
      const wrapper = setup(expectedPatient, [])

      const addNotesButton = wrapper.find(components.Button)
      expect(addNotesButton).toHaveLength(0)
    })

    it('should open the Add Notes Modal', () => {
      const wrapper = setup()

      act(() => {
        const onClick = wrapper.find(components.Button).prop('onClick') as any
        onClick()
      })
      wrapper.update()

      expect(wrapper.find(components.Modal).prop('show')).toBeTruthy()
    })
  })

  describe('notes list', () => {
    it('should list the patients diagnoses', () => {
      const notes = expectedPatient.notes as Note[]
      const wrapper = setup()

      const list = wrapper.find(components.List)
      const listItems = wrapper.find(components.ListItem)

      expect(list).toHaveLength(1)
      expect(listItems).toHaveLength(notes.length)
    })

    it('should render a warning message if the patient does not have any diagnoses', () => {
      const wrapper = setup({ ...expectedPatient, notes: [] })

      const alert = wrapper.find(components.Alert)

      expect(alert).toHaveLength(1)
      expect(alert.prop('title')).toEqual('patient.notes.warning.noNotes')
      expect(alert.prop('message')).toEqual('patient.notes.addNoteAbove')
    })
  })
})
