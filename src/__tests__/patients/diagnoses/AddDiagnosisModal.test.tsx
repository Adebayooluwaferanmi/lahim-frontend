import '../../../__mocks__/matchMediaMock'
import React from 'react'
import { mount } from 'enzyme'
import { Modal, Alert } from '@lahim/components'
import { act } from '@testing-library/react'
import AddDiagnosisModal from 'patients/diagnoses/AddDiagnosisModal'
import TextInputWithLabelFormGroup from '../../../components/input/TextInputWithLabelFormGroup'
import DatePickerWithLabelFormGroup from '../../../components/input/DatePickerWithLabelFormGroup'
import Diagnosis from '../../../model/Diagnosis'
import PatientRepository from '../../../clients/db/PatientRepository'
import Patient from '../../../model/Patient'
import { usePatientStore } from '../../../store/patient-store'

describe('Add Diagnosis Modal', () => {
  beforeEach(() => {
    vi.spyOn(PatientRepository, 'find')
    vi.spyOn(PatientRepository, 'saveOrUpdate')
  })

  it('should render a modal with the correct labels', () => {
    usePatientStore.setState({
      patient: { id: '1234' } as Patient,
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
      <AddDiagnosisModal show onCloseButtonClick={vi.fn()} />,
    )
    wrapper.update()
    const modal = wrapper.find(Modal)
    expect(modal).toHaveLength(1)
    expect(modal.prop('title')).toEqual('patient.diagnoses.new')
    expect(modal.prop('closeButton')?.children).toEqual('actions.cancel')
    expect(modal.prop('closeButton')?.color).toEqual('danger')
    expect(modal.prop('successButton')?.children).toEqual('patient.diagnoses.new')
    expect(modal.prop('successButton')?.color).toEqual('success')
    expect(modal.prop('successButton')?.icon).toEqual('add')
  })

  it('should display an errors', () => {
    const expectedDiagnosisError = {
      message: 'some message',
      date: 'some date message',
      name: 'some date message',
    }
    usePatientStore.setState({
      patient: {} as Patient,
      diagnosisError: expectedDiagnosisError,
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
      <AddDiagnosisModal show onCloseButtonClick={vi.fn()} />,
    )
    wrapper.update()

    expect(wrapper.find(Alert)).toHaveLength(1)

    expect(wrapper.find(Alert).prop('title')).toEqual('states.error')
    expect(wrapper.find(Alert).prop('message')).toContain(expectedDiagnosisError.message)
    expect(wrapper.find(TextInputWithLabelFormGroup).prop('feedback')).toContain(
      expectedDiagnosisError.name,
    )
    expect(wrapper.find(TextInputWithLabelFormGroup).prop('isInvalid')).toBeTruthy()
    expect(wrapper.find(DatePickerWithLabelFormGroup).prop('feedback')).toContain(
      expectedDiagnosisError.date,
    )
    expect(wrapper.find(DatePickerWithLabelFormGroup).prop('isInvalid')).toBeTruthy()
  })

  describe('cancel', () => {
    it('should call the onCloseButtonClick function when the close button is clicked', () => {
      const onCloseButtonClickSpy = vi.fn()
      usePatientStore.setState({
        patient: { id: '1234' } as Patient,
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
        <AddDiagnosisModal show onCloseButtonClick={onCloseButtonClickSpy} />,
      )
      wrapper.update()

      act(() => {
        const modal = wrapper.find(Modal)
        const { onClick } = modal.prop('closeButton') as any
        onClick()
      })

      expect(onCloseButtonClickSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('save', () => {
    it('should dispatch add diagnosis', () => {
      const expectedName = 'expected name'
      const expectedDate = new Date()
      const patient = {
        id: '1234',
        givenName: 'some name',
      }

      vi.spyOn(PatientRepository, 'find').mockResolvedValue(patient as Patient)
      vi.spyOn(PatientRepository, 'saveOrUpdate').mockResolvedValue(patient as Patient)

      const diagnosis = {
        name: expectedName,
        diagnosisDate: expectedDate.toISOString(),
      } as Diagnosis

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
        <AddDiagnosisModal show onCloseButtonClick={vi.fn()} />,
      )

      act(() => {
        const input = wrapper.findWhere((c: any) => c.prop('name') === 'name')
        const onChange = input.prop('onChange')
        onChange({ target: { value: expectedName } })
      })
      wrapper.update()

      act(() => {
        const input = wrapper.findWhere((c: any) => c.prop('name') === 'diagnosisDate')
        const onChange = input.prop('onChange')
        onChange(expectedDate)
      })
      wrapper.update()

      act(() => {
        const modal = wrapper.find(Modal)
        const { onClick } = modal.prop('successButton') as any
        onClick()
      })

      expect(usePatientStore.getState().addDiagnosis).toHaveBeenCalledWith(patient.id, { ...diagnosis })
    })
  })
})
