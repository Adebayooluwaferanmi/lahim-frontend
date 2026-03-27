import '../__mocks__/matchMediaMock'
import React from 'react'
import { mount } from 'enzyme'
import { MemoryRouter } from 'react-router-dom'
import { Toaster } from '@lahim/components'
import { act } from 'react-dom/test-utils'
import Dashboard from 'dashboard/Dashboard'
import Appointments from 'scheduling/appointments/Appointments'
import NewAppointment from 'scheduling/appointments/new/NewAppointment'
import EditAppointment from 'scheduling/appointments/edit/EditAppointment'
import ViewLabs from 'labs/ViewLabs'
import LabRepository from 'clients/db/LabRepository'
import PatientRepository from '../clients/db/PatientRepository'
import AppointmentRepository from '../clients/db/AppointmentRepository'
import Patient from '../model/Patient'
import Appointment from '../model/Appointment'
import LaHIM from '../LaHIM'
import Permissions from '../model/Permissions'
import { useUIStore } from '../store/ui-store'
import { useUserStore } from '../store/user-store'

describe('LaHIM', () => {
  beforeEach(() => {
    useUIStore.setState({ title: '', sidebarCollapsed: false, breadcrumbs: [], buttons: [] })
    useUserStore.setState({ permissions: [] })
  })

  describe('routing', () => {
    describe('/appointments', () => {
      it('should render the appointments screen when /appointments is accessed', async () => {
        useUIStore.setState({ title: 'test', sidebarCollapsed: false, breadcrumbs: [] })
        useUserStore.setState({ permissions: [Permissions.ReadAppointments] })

        const wrapper = mount(
          <MemoryRouter initialEntries={['/appointments']}>
            <LaHIM />
          </MemoryRouter>,
        )

        await act(async () => {
          wrapper.update()
        })

        expect(wrapper.find(Appointments)).toHaveLength(1)

        expect(useUIStore.getState().breadcrumbs).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ i18nKey: 'scheduling.appointments.label', location: '/appointments' }),
            expect.objectContaining({ i18nKey: 'dashboard.label', location: '/' }),
          ]),
        )
      })

      it('should render the Dashboard when the user does not have read appointment privileges', () => {
        useUIStore.setState({ title: 'test', sidebarCollapsed: false, breadcrumbs: [] })
        useUserStore.setState({ permissions: [] })

        const wrapper = mount(
          <MemoryRouter initialEntries={['/appointments']}>
            <LaHIM />
          </MemoryRouter>,
        )

        expect(wrapper.find(Dashboard)).toHaveLength(1)
      })
    })

    describe('/appointments/new', () => {
      it('should render the new appointment screen when /appointments/new is accessed', async () => {
        useUIStore.setState({ title: 'test', sidebarCollapsed: false, breadcrumbs: [] })
        useUserStore.setState({ permissions: [Permissions.WriteAppointments] })

        const wrapper = mount(
          <MemoryRouter initialEntries={['/appointments/new']}>
            <LaHIM />
          </MemoryRouter>,
        )

        wrapper.update()

        expect(wrapper.find(NewAppointment)).toHaveLength(1)
        expect(useUIStore.getState().breadcrumbs).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ i18nKey: 'scheduling.appointments.label', location: '/appointments' }),
            expect.objectContaining({ i18nKey: 'scheduling.appointments.new', location: '/appointments/new' }),
            expect.objectContaining({ i18nKey: 'dashboard.label', location: '/' }),
          ]),
        )
      })

      it('should render the Dashboard when the user does not have read appointment privileges', () => {
        useUIStore.setState({ title: 'test', sidebarCollapsed: false, breadcrumbs: [] })
        useUserStore.setState({ permissions: [] })

        const wrapper = mount(
          <MemoryRouter initialEntries={['/appointments/new']}>
            <LaHIM />
          </MemoryRouter>,
        )

        expect(wrapper.find(Dashboard)).toHaveLength(1)
      })
    })

    describe('/appointments/edit/:id', () => {
      it('should render the edit appointment screen when /appointments/edit/:id is accessed', () => {
        const appointment = {
          id: '123',
          patientId: '456',
        } as Appointment

        const patient = {
          id: '456',
        } as Patient

        vi.spyOn(AppointmentRepository, 'find').mockResolvedValue(appointment)
        vi.spyOn(PatientRepository, 'find').mockResolvedValue(patient)

        useUIStore.setState({ title: 'test', sidebarCollapsed: false, breadcrumbs: [] })
        useUserStore.setState({
          permissions: [Permissions.WriteAppointments, Permissions.ReadAppointments],
        })

        const wrapper = mount(
          <MemoryRouter initialEntries={['/appointments/edit/123']}>
            <LaHIM />
          </MemoryRouter>,
        )

        expect(wrapper.find(EditAppointment)).toHaveLength(1)

        expect(useUIStore.getState().breadcrumbs).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ i18nKey: 'scheduling.appointments.label', location: '/appointments' }),
            expect.objectContaining({ text: '123', location: '/appointments/123' }),
            expect.objectContaining({
              i18nKey: 'scheduling.appointments.editAppointment',
              location: '/appointments/edit/123',
            }),
            expect.objectContaining({ i18nKey: 'dashboard.label', location: '/' }),
          ]),
        )
      })

      it('should render the Dashboard when the user does not have read appointment privileges', () => {
        useUIStore.setState({ title: 'test', sidebarCollapsed: false, breadcrumbs: [] })
        useUserStore.setState({ permissions: [Permissions.WriteAppointments] })

        const wrapper = mount(
          <MemoryRouter initialEntries={['/appointments/edit/123']}>
            <LaHIM />
          </MemoryRouter>,
        )

        expect(wrapper.find(Dashboard)).toHaveLength(1)
      })

      it('should render the Dashboard when the user does not have write appointment privileges', () => {
        useUIStore.setState({ title: 'test', sidebarCollapsed: false, breadcrumbs: [] })
        useUserStore.setState({ permissions: [Permissions.ReadAppointments] })

        const wrapper = mount(
          <MemoryRouter initialEntries={['/appointments/edit/123']}>
            <LaHIM />
          </MemoryRouter>,
        )

        expect(wrapper.find(Dashboard)).toHaveLength(1)
      })
    })

    describe('/labs', () => {
      it('should render the Labs component when /labs is accessed', async () => {
        vi.spyOn(LabRepository, 'findAll').mockResolvedValue([])
        useUIStore.setState({ title: 'test', sidebarCollapsed: false, breadcrumbs: [] })
        useUserStore.setState({ permissions: [Permissions.ViewLabs] })

        let wrapper: any
        await act(async () => {
          wrapper = await mount(
            <MemoryRouter initialEntries={['/labs']}>
              <LaHIM />
            </MemoryRouter>,
          )
        })
        wrapper.update()

        expect(wrapper.find(ViewLabs)).toHaveLength(1)
      })

      it('should render the dashboard if the user does not have permissions to view labs', () => {
        vi.spyOn(LabRepository, 'findAll').mockResolvedValue([])
        useUIStore.setState({ title: 'test', sidebarCollapsed: false, breadcrumbs: [] })
        useUserStore.setState({ permissions: [] })

        const wrapper = mount(
          <MemoryRouter initialEntries={['/labs']}>
            <LaHIM />
          </MemoryRouter>,
        )

        expect(wrapper.find(ViewLabs)).toHaveLength(0)
        expect(wrapper.find(Dashboard)).toHaveLength(1)
      })
    })
  })

  describe('layout', () => {
    it('should render a Toaster', () => {
      useUIStore.setState({ title: 'test', sidebarCollapsed: false, breadcrumbs: [] })
      useUserStore.setState({ permissions: [Permissions.WritePatients] })

      const wrapper = mount(
        <MemoryRouter initialEntries={['/']}>
          <HospitalRun />
        </MemoryRouter>,
      )

      expect(wrapper.find(Toaster)).toHaveLength(1)
    })
  })
})
