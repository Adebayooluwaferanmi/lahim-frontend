import '../../../__mocks__/matchMediaMock'
import React from 'react'
import NewAllergyModal from 'patients/allergies/NewAllergyModal'
import { mount } from 'enzyme'
import { Modal, Alert } from '@lahim/components'
import { act } from '@testing-library/react'
import TextInputWithLabelFormGroup from '../../../components/input/TextInputWithLabelFormGroup'
import PatientRepository from '../../../clients/db/PatientRepository'
import Patient from '../../../model/Patient'
import { usePatientStore } from '../../../store/patient-store'

describe('New Allergy Modal', () => {
  const mockPatient = {
    id: '123',
    givenName: 'someName',
  } as Patient

  beforeEach(() => {
    vi.spyOn(PatientRepository, 'saveOrUpdate').mockResolvedValue(mockPatient)
    vi.spyOn(PatientRepository, 'find').mockResolvedValue(mockPatient)
  })

  it('should render a modal with the correct labels', () => {
    usePatientStore.setState({
      patient: { id: '123' } as Patient,
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
      <NewAllergyModal show onCloseButtonClick={vi.fn()} />,
    )

    const modal = wrapper.find(Modal)
    expect(modal).toHaveLength(1)
    expect(modal.prop('title')).toEqual('patient.allergies.new')
    expect(modal.prop('closeButton')?.children).toEqual('actions.cancel')
    expect(modal.prop('closeButton')?.color).toEqual('danger')
    expect(modal.prop('successButton')?.children).toEqual('patient.allergies.new')
    expect(modal.prop('successButton')?.color).toEqual('success')
    expect(modal.prop('successButton')?.icon).toEqual('add')
  })

  it('should display the errors', () => {
    const expectedError = {
      message: 'some error message',
      name: 'some name message',
    }
    usePatientStore.setState({
      patient: { id: '123' } as Patient,
      allergyError: expectedError,
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
      <NewAllergyModal show onCloseButtonClick={vi.fn()} />,
    )
    wrapper.update()

    const alert = wrapper.find(Alert)
    const nameField = wrapper.find(TextInputWithLabelFormGroup)

    expect(alert.prop('title')).toEqual('states.error')
    expect(alert.prop('message')).toEqual(expectedError.message)
    expect(nameField.prop('isInvalid')).toBeTruthy()
    expect(nameField.prop('feedback')).toEqual(expectedError.name)
  })

  describe('cancel', () => {
    it('should call the onCloseButtonClick function when the close button is clicked', () => {
      const onCloseButtonClickSpy = vi.fn()
      usePatientStore.setState({
        patient: { id: '123' } as Patient,
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
        <NewAllergyModal show onCloseButtonClick={onCloseButtonClickSpy} />,
      )
      act(() => {
        const modal = wrapper.find(Modal)
        const { onClick } = modal.prop('closeButton') as any
        onClick()
      })

      expect(onCloseButtonClickSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('save', () => {
    it('should dispatch add allergy', () => {
      const expectedName = 'expected name'
      const patient = {
        id: '123',
      }
      usePatientStore.setState({
        patient: patient as Patient,
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
        <NewAllergyModal show onCloseButtonClick={vi.fn()} />,
      )
      wrapper.update()

      act(() => {
        const input = wrapper.findWhere((c) => c.prop('name') === 'name')
        const onChange = input.prop('onChange')
        onChange({ target: { value: expectedName } })
      })

      wrapper.update()

      act(() => {
        const modal = wrapper.find(Modal)
        const onSave = (modal.prop('successButton') as any).onClick
        onSave({} as React.MouseEvent<HTMLButtonElement>)
      })

      expect(usePatientStore.getState().addAllergy).toHaveBeenCalledWith(patient.id, { name: expectedName })
    })
  })
})
