import '../../../__mocks__/matchMediaMock'
import React from 'react'
import NewNoteModal from 'patients/notes/NewNoteModal'
import { mount } from 'enzyme'
import { Alert, Modal } from '@lahim/components'
import { act } from '@testing-library/react'
import TextFieldWithLabelFormGroup from 'components/input/TextFieldWithLabelFormGroup'
import PatientRepository from '../../../clients/db/PatientRepository'
import Patient from '../../../model/Patient'
import { usePatientStore } from '../../../store/patient-store'

describe('New Note Modal', () => {
  beforeEach(() => {
    vi.spyOn(PatientRepository, 'find')
    vi.spyOn(PatientRepository, 'saveOrUpdate')
  })

  it('should render a modal with the correct labels', () => {
    const expectedPatient = {
      id: '1234',
      givenName: 'some name',
    }
    usePatientStore.setState({
      patient: expectedPatient as Patient,
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
    const wrapper = mount(
      <NewNoteModal show onCloseButtonClick={vi.fn()} toggle={vi.fn()} />,
    )
    const modal = wrapper.find(Modal)
    expect(modal).toHaveLength(1)
    expect(modal.prop('title')).toEqual('patient.notes.new')
    expect(modal.prop('closeButton')?.children).toEqual('actions.cancel')
    expect(modal.prop('closeButton')?.color).toEqual('danger')
    expect(modal.prop('successButton')?.children).toEqual('patient.notes.new')
    expect(modal.prop('successButton')?.color).toEqual('success')
    expect(modal.prop('successButton')?.icon).toEqual('add')
  })

  it('should render a notes rich text editor', () => {
    const expectedPatient = {
      id: '1234',
      givenName: 'some name',
    }
    usePatientStore.setState({
      patient: expectedPatient as Patient,
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
    const wrapper = mount(
      <NewNoteModal show onCloseButtonClick={vi.fn()} toggle={vi.fn()} />,
    )

    const noteTextField = wrapper.find(TextFieldWithLabelFormGroup)
    expect(noteTextField.prop('label')).toEqual('patient.note')
    expect(noteTextField.prop('isRequired')).toBeTruthy()
    expect(noteTextField).toHaveLength(1)
  })

  it('should render note error', () => {
    const expectedPatient = {
      id: '1234',
      givenName: 'some name',
    }
    const expectedError = {
      message: 'some message',
      note: 'some note error',
    }
    usePatientStore.setState({
      patient: expectedPatient as Patient,
      noteError: expectedError,
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
    const wrapper = mount(
      <NewNoteModal show onCloseButtonClick={vi.fn()} toggle={vi.fn()} />,
    )

    const alert = wrapper.find(Alert)
    const noteTextField = wrapper.find(TextFieldWithLabelFormGroup)
    expect(alert.prop('title')).toEqual('states.error')
    expect(alert.prop('message')).toEqual(expectedError.message)
    expect(noteTextField.prop('isInvalid')).toBeTruthy()
    expect(noteTextField.prop('feedback')).toEqual(expectedError.note)
  })

  describe('on cancel', () => {
    it('should call the onCloseButtonCLick function when the cancel button is clicked', () => {
      const onCloseButtonClickSpy = vi.fn()
      const expectedPatient = {
        id: '1234',
        givenName: 'some name',
      }
      usePatientStore.setState({
        patient: expectedPatient as Patient,
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
      const wrapper = mount(
        <NewNoteModal show onCloseButtonClick={onCloseButtonClickSpy} toggle={vi.fn()} />,
      )

      act(() => {
        const modal = wrapper.find(Modal)
        const { onClick } = modal.prop('closeButton') as any
        onClick()
      })

      expect(onCloseButtonClickSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('on save', () => {
    it('should dispatch add note', () => {
      const expectedNote = 'some note'
      const expectedPatient = {
        id: '1234',
        givenName: 'some name',
      }
      usePatientStore.setState({
        patient: expectedPatient as Patient,
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

      vi.spyOn(PatientRepository, 'find').mockResolvedValue(expectedPatient as Patient)
      vi.spyOn(PatientRepository, 'saveOrUpdate').mockResolvedValue(expectedPatient as Patient)

      const wrapper = mount(
        <NewNoteModal show onCloseButtonClick={vi.fn()} toggle={vi.fn()} />,
      )

      act(() => {
        const noteTextField = wrapper.find(TextFieldWithLabelFormGroup)
        const onChange = noteTextField.prop('onChange') as any
        onChange({ currentTarget: { value: expectedNote } })
      })

      wrapper.update()
      act(() => {
        const modal = wrapper.find(Modal)
        const { onClick } = modal.prop('successButton') as any
        onClick()
      })

      expect(usePatientStore.getState().addNote).toHaveBeenCalledWith(expectedPatient.id, { text: expectedNote })
    })
  })
})
