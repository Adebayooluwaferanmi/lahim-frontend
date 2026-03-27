import '../../../__mocks__/matchMediaMock'
import React from 'react'
import { mount } from 'enzyme'
import { Router, Route } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { act } from 'react-dom/test-utils'
import { Button } from '@lahim/components'
import { subDays } from 'date-fns'
import EditPatient from '../../../patients/edit/EditPatient'
import GeneralInformation from '../../../patients/GeneralInformation'
import Patient from '../../../model/Patient'
import * as titleUtil from '../../../page-header/useTitle'
import PatientRepository from '../../../clients/db/PatientRepository'
import { usePatientStore } from '../../../store/patient-store'

describe('Edit Patient', () => {
  const patient = {
    id: '123',
    prefix: 'prefix',
    givenName: 'givenName',
    familyName: 'familyName',
    suffix: 'suffix',
    fullName: 'givenName familyName suffix',
    sex: 'male',
    type: 'charity',
    occupation: 'occupation',
    preferredLanguage: 'preferredLanguage',
    phoneNumber: '123456789',
    email: 'email@email.com',
    address: 'address',
    code: 'P00001',
    dateOfBirth: subDays(new Date(), 2).toISOString(),
  } as Patient

  let history: any

  const setup = () => {
    vi.spyOn(PatientRepository, 'saveOrUpdate').mockResolvedValue(patient)
    vi.spyOn(PatientRepository, 'find').mockResolvedValue(patient)

    history = createMemoryHistory()

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

    navigate('/patients/edit/123')
    const wrapper = mount(
      <Router history={history}>
        <Route path="/patients/edit/:id">
          <EditPatient />
        </Route>
      </Router>,
    )

    wrapper.update()
    return wrapper
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should render an edit patient form', async () => {
    let wrapper: any
    await act(async () => {
      wrapper = await setup()
    })

    expect(wrapper.find(GeneralInformation)).toHaveLength(1)
  })

  it('should dispatch fetchPatient when component loads', async () => {
    await act(async () => {
      await setup()
    })

    expect(usePatientStore.getState().fetchPatient).toHaveBeenCalledWith(patient.id)
  })

  it('should use "Edit Patient: " plus patient full name as the title', async () => {
    vi.spyOn(titleUtil, 'default')
    await act(async () => {
      await setup()
    })
    expect(titleUtil.default).toHaveBeenCalledWith(
      'patients.editPatient: givenName familyName suffix (P00001)',
    )
  })

  it('should dispatch updatePatient when save button is clicked', async () => {
    let wrapper: any
    await act(async () => {
      wrapper = await setup()
    })

    wrapper.update()

    const saveButton = wrapper.find(Button).at(0)
    const onClick = saveButton.prop('onClick') as any
    expect(saveButton.text().trim()).toEqual('actions.save')

    await act(async () => {
      await onClick()
    })

    expect(usePatientStore.getState().updatePatient).toHaveBeenCalled()
  })

  it('should navigate to /patients/:id when cancel is clicked', async () => {
    let wrapper: any
    await act(async () => {
      wrapper = await setup()
    })

    wrapper.update()

    const cancelButton = wrapper.find(Button).at(1)
    const onClick = cancelButton.prop('onClick') as any
    expect(cancelButton.text().trim()).toEqual('actions.cancel')

    act(() => {
      onClick()
    })

    wrapper.update()
    expect(history.location.pathname).toEqual('/patients/123')
  })
})
