import '../../../__mocks__/matchMediaMock'
import React from 'react'
import { mount } from 'enzyme'
import { Router, Route } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { act } from 'react-dom/test-utils'
import * as components from '@lahim/components'
import NewPatient from '../../../patients/new/NewPatient'
import GeneralInformation from '../../../patients/GeneralInformation'
import Patient from '../../../model/Patient'
import * as titleUtil from '../../../page-header/useTitle'
import PatientRepository from '../../../clients/db/PatientRepository'
import { usePatientStore } from '../../../store/patient-store'

describe('New Patient', () => {
  const patient = {
    givenName: 'first',
    fullName: 'first',
  } as Patient

  let history: any

  const setup = (error?: any) => {
    vi.spyOn(PatientRepository, 'save')
    const mockedPatientRepository = vi.mocked(PatientRepository, true)
    mockedPatientRepository.save.mockResolvedValue(patient)

    history = createMemoryHistory()

    usePatientStore.setState({
      patient: {} as Patient,
      createError: error,
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

    navigate('/patients/new')
    const wrapper = mount(
      <Router history={history}>
        <Route path="/patients/new">
          <NewPatient />
        </Route>
      </Router>,
    )

    wrapper.update()
    return wrapper
  }

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should render a general information form', async () => {
    let wrapper: any
    await act(async () => {
      wrapper = await setup()
    })

    expect(wrapper.find(GeneralInformation)).toHaveLength(1)
  })

  it('should use "New Patient" as the header', async () => {
    vi.spyOn(titleUtil, 'default')
    await act(async () => {
      await setup()
    })

    expect(titleUtil.default).toHaveBeenCalledWith('patients.newPatient')
  })

  it('should pass the error object to general information', async () => {
    const expectedError = { message: 'some message' }
    let wrapper: any
    await act(async () => {
      wrapper = await setup(expectedError)
    })
    wrapper.update()

    const generalInformationForm = wrapper.find(GeneralInformation)
    expect(generalInformationForm.prop('error')).toEqual(expectedError)
  })

  it('should dispatch createPatient when save button is clicked', async () => {
    let wrapper: any
    await act(async () => {
      wrapper = await setup()
    })

    const generalInformationForm = wrapper.find(GeneralInformation)

    act(() => {
      generalInformationForm.prop('onFieldChange')('givenName', 'first')
    })

    wrapper.update()

    const saveButton = wrapper.find(components.Button).at(0)
    const onClick = saveButton.prop('onClick') as any
    expect(saveButton.text().trim()).toEqual('actions.save')

    await act(async () => {
      await onClick()
    })

    expect(usePatientStore.getState().createPatient).toHaveBeenCalled()
  })

  it('should navigate to /patients/:id and display a message after a new patient is successfully created', async () => {
    vi.spyOn(components, 'Toast')
    const mockedComponents = vi.mocked(components, true)
    let wrapper: any
    await act(async () => {
      wrapper = await setup()
    })

    const generalInformationForm = wrapper.find(GeneralInformation)

    act(() => {
      generalInformationForm.prop('onFieldChange')('givenName', 'first')
    })

    wrapper.update()

    const saveButton = wrapper.find(components.Button).at(0)
    const onClick = saveButton.prop('onClick') as any
    expect(saveButton.text().trim()).toEqual('actions.save')

    await act(async () => {
      await onClick()
    })

    expect(history.location.pathname).toEqual(`/patients/${patient.id}`)
    expect(mockedComponents.Toast).toHaveBeenCalledWith(
      'success',
      'states.success',
      `patients.successfullyCreated ${patient.fullName}`,
    )
  })

  it('should navigate to /patients when cancel is clicked', async () => {
    let wrapper: any
    await act(async () => {
      wrapper = await setup()
    })

    const cancelButton = wrapper.find(components.Button).at(1)
    const onClick = cancelButton.prop('onClick') as any
    expect(cancelButton.text().trim()).toEqual('actions.cancel')

    act(() => {
      onClick()
    })

    expect(history.location.pathname).toEqual('/patients')
  })
})
