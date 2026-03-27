import '../../../__mocks__/matchMediaMock'
import React from 'react'
import { mount } from 'enzyme'
import Allergies from 'patients/allergies/Allergies'
import Permissions from 'model/Permissions'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'
import Patient from 'model/Patient'
import * as components from '@lahim/components'
import { act } from '@testing-library/react'
import PatientRepository from 'clients/db/PatientRepository'
import Allergy from 'model/Allergy'
import { usePatientStore } from '../../../store/patient-store'
import { useUserStore } from '../../../store/user-store'

const navigate = createMemoryHistory()
const expectedPatient = {
  id: '123',
  rev: '123',
  allergies: [
    { id: '1', name: 'allergy1' },
    { id: '2', name: 'allergy2' },
  ],
} as Patient

const setup = (patient = expectedPatient, permissions = [Permissions.AddAllergy]) => {
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
      <Allergies patient={patient} />
    </Router>,
  )

  return wrapper
}

describe('Allergies', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(PatientRepository, 'saveOrUpdate')
  })

  describe('add new allergy button', () => {
    it('should render a button to add new allergies', () => {
      const wrapper = setup()

      const addAllergyButton = wrapper.find(components.Button)
      expect(addAllergyButton).toHaveLength(1)
      expect(addAllergyButton.text().trim()).toEqual('patient.allergies.new')
    })

    it('should not render a button to add new allergies if the user does not have permissions', () => {
      const wrapper = setup(expectedPatient, [])

      const addAllergyButton = wrapper.find(components.Button)
      expect(addAllergyButton).toHaveLength(0)
    })

    it('should open the New Allergy Modal when clicked', () => {
      const wrapper = setup()

      act(() => {
        const addAllergyButton = wrapper.find(components.Button)
        const onClick = addAllergyButton.prop('onClick') as any
        onClick({} as React.MouseEvent<HTMLButtonElement>)
      })

      wrapper.update()

      expect(wrapper.find(components.Modal).prop('show')).toBeTruthy()
    })
  })

  describe('allergy list', () => {
    it('should list the patients allergies', () => {
      const allergies = expectedPatient.allergies as Allergy[]
      const wrapper = setup()

      const list = wrapper.find(components.List)
      const listItems = wrapper.find(components.ListItem)

      expect(list).toHaveLength(1)
      expect(listItems).toHaveLength(allergies.length)
    })

    it('should render a warning message if the patient does not have any allergies', () => {
      const wrapper = setup({ ...expectedPatient, allergies: [] })

      const alert = wrapper.find(components.Alert)

      expect(alert).toHaveLength(1)
      expect(alert.prop('title')).toEqual('patient.allergies.warning.noAllergies')
      expect(alert.prop('message')).toEqual('patient.allergies.addAllergyAbove')
    })
  })
})
