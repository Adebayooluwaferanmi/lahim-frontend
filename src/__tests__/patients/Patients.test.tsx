import '../../__mocks__/matchMediaMock'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { mount } from 'enzyme'
import { act } from 'react-dom/test-utils'
import Permissions from '../../model/Permissions'
import LaHIM from '../../LaHIM'
import NewPatient from '../../patients/new/NewPatient'
import Dashboard from '../../dashboard/Dashboard'
import PatientRepository from '../../clients/db/PatientRepository'
import Patient from '../../model/Patient'
import EditPatient from '../../patients/edit/EditPatient'
import ViewPatient from '../../patients/view/ViewPatient'
import { usePatientStore } from '../../store/patient-store'
import { useUserStore } from '../../store/user-store'
import { useUIStore } from '../../store/ui-store'

describe('/patients/new', () => {
  it('should render the new patient screen when /patients/new is accessed', async () => {
    useUIStore.setState({
      title: 'test',
      breadcrumbs: [],
      sidebarCollapsed: false,
      addBreadcrumbs: vi.fn(),
    })
    useUserStore.setState({ permissions: [Permissions.WritePatients] })
    usePatientStore.setState({
      patient: {} as Patient,
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

    let wrapper: any

    await act(async () => {
      wrapper = await mount(
        <MemoryRouter initialEntries={['/patients/new']}>
          <LaHIM />
        </MemoryRouter>,
      )
    })

    expect(wrapper.find(NewPatient)).toHaveLength(1)

    expect(useUIStore.getState().addBreadcrumbs).toHaveBeenCalledWith([
      { i18nKey: 'patients.label', location: '/patients' },
      { i18nKey: 'patients.newPatient', location: '/patients/new' },
      { i18nKey: 'dashboard.label', location: '/' },
    ])
  })

  it('should render the Dashboard if the user does not have write patient privileges', () => {
    useUIStore.setState({
      title: 'test',
      breadcrumbs: [],
      sidebarCollapsed: false,
      addBreadcrumbs: vi.fn(),
    })
    useUserStore.setState({ permissions: [] })
    usePatientStore.setState({
      patient: {} as Patient,
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
      <MemoryRouter initialEntries={['/patients/new']}>
        <HospitalRun />
      </MemoryRouter>,
    )

    expect(wrapper.find(Dashboard)).toHaveLength(1)
  })
})

describe('/patients/edit/:id', () => {
  it('should render the edit patient screen when /patients/edit/:id is accessed', () => {
    const patient = {
      id: '123',
      prefix: 'test',
      givenName: 'test',
      familyName: 'test',
      suffix: 'test',
      code: 'P00001',
    } as Patient

    vi.spyOn(PatientRepository, 'find').mockResolvedValue(patient)

    useUIStore.setState({
      title: 'test',
      breadcrumbs: [],
      sidebarCollapsed: false,
      addBreadcrumbs: vi.fn(),
    })
    useUserStore.setState({
      permissions: [Permissions.WritePatients, Permissions.ReadPatients],
    })
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

    const wrapper = mount(
      <MemoryRouter initialEntries={['/patients/edit/123']}>
        <HospitalRun />
      </MemoryRouter>,
    )

    expect(wrapper.find(EditPatient)).toHaveLength(1)

    expect(useUIStore.getState().addBreadcrumbs).toHaveBeenCalledWith([
      { i18nKey: 'patients.label', location: '/patients' },
      { text: 'test test test', location: `/patients/${patient.id}` },
      { i18nKey: 'patients.editPatient', location: `/patients/${patient.id}/edit` },
      { i18nKey: 'dashboard.label', location: '/' },
    ])
  })

  it('should render the Dashboard when the user does not have read patient privileges', () => {
    useUIStore.setState({
      title: 'test',
      breadcrumbs: [],
      sidebarCollapsed: false,
      addBreadcrumbs: vi.fn(),
    })
    useUserStore.setState({ permissions: [Permissions.WritePatients] })
    usePatientStore.setState({
      patient: {} as Patient,
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
      <MemoryRouter initialEntries={['/patients/edit/123']}>
        <HospitalRun />
      </MemoryRouter>,
    )

    expect(wrapper.find(Dashboard)).toHaveLength(1)
  })

  it('should render the Dashboard when the user does not have write patient privileges', () => {
    useUIStore.setState({
      title: 'test',
      breadcrumbs: [],
      sidebarCollapsed: false,
      addBreadcrumbs: vi.fn(),
    })
    useUserStore.setState({ permissions: [Permissions.ReadPatients] })
    usePatientStore.setState({
      patient: {} as Patient,
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
      <MemoryRouter initialEntries={['/patients/edit/123']}>
        <HospitalRun />
      </MemoryRouter>,
    )

    expect(wrapper.find(Dashboard)).toHaveLength(1)
  })
})

describe('/patients/:id', () => {
  it('should render the view patient screen when /patients/:id is accessed', async () => {
    const patient = {
      id: '123',
      prefix: 'test',
      givenName: 'test',
      familyName: 'test',
      suffix: 'test',
      code: 'P00001',
    } as Patient

    vi.spyOn(PatientRepository, 'find').mockResolvedValue(patient)

    useUIStore.setState({
      title: 'test',
      breadcrumbs: [],
      sidebarCollapsed: false,
      addBreadcrumbs: vi.fn(),
    })
    useUserStore.setState({ permissions: [Permissions.ReadPatients] })
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

    const wrapper = mount(
      <MemoryRouter initialEntries={['/patients/123']}>
        <HospitalRun />
      </MemoryRouter>,
    )

    expect(wrapper.find(ViewPatient)).toHaveLength(1)

    expect(useUIStore.getState().addBreadcrumbs).toHaveBeenCalledWith([
      { i18nKey: 'patients.label', location: '/patients' },
      { text: 'test test test', location: `/patients/${patient.id}` },
      { i18nKey: 'dashboard.label', location: '/' },
    ])
  })

  it('should render the Dashboard when the user does not have read patient privileges', () => {
    useUIStore.setState({
      title: 'test',
      breadcrumbs: [],
      sidebarCollapsed: false,
      addBreadcrumbs: vi.fn(),
    })
    useUserStore.setState({ permissions: [] })
    usePatientStore.setState({
      patient: {} as Patient,
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
      <MemoryRouter initialEntries={['/patients/123']}>
        <HospitalRun />
      </MemoryRouter>,
    )

    expect(wrapper.find(Dashboard)).toHaveLength(1)
  })
})
