import '../../../__mocks__/matchMediaMock'
import React from 'react'
import { mount } from 'enzyme'
import { createMemoryHistory } from 'history'
import Patient from 'model/Patient'
import { Router } from 'react-router-dom'
import AppointmentsList from 'patients/appointments/AppointmentsList'
import * as components from '@lahim/components'
import { act } from 'react-dom/test-utils'
import { usePatientStore } from '../../../store/patient-store'
import { useAppointmentsStore } from '../../../store/appointments-store'

const expectedPatient = {
  id: '123',
} as Patient
const expectedAppointments = [
  {
    id: '123',
    rev: '1',
    patientId: '1234',
    startDateTime: new Date().toISOString(),
    endDateTime: new Date().toISOString(),
    location: 'location',
    reason: 'reason',
  },
]

const navigate = createMemoryHistory()

const setup = (patient = expectedPatient, appointments = expectedAppointments) => {
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
  useAppointmentsStore.setState({
    appointments,
    isLoading: false,
    fetchAppointments: vi.fn(),
    fetchPatientAppointments: vi.fn(),
  })

  const wrapper = mount(
    <Router history={history}>
      <AppointmentsList patientId={patient.id} />
    </Router>,
  )

  return wrapper
}

describe('AppointmentsList', () => {
  describe('add new appointment button', () => {
    it('should render a new appointment button', () => {
      const wrapper = setup()

      const addNewAppointmentButton = wrapper.find(components.Button).at(0)
      expect(addNewAppointmentButton).toHaveLength(1)
      expect(addNewAppointmentButton.text().trim()).toEqual('scheduling.appointments.new')
    })

    it('should navigate to new appointment page', () => {
      const wrapper = setup()

      act(() => {
        wrapper.find(components.Button).at(0).prop('onClick')()
      })
      wrapper.update()

      expect(history.location.pathname).toEqual('/appointments/new')
    })
  })
})
