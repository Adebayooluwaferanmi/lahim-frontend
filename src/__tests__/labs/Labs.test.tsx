import '../../__mocks__/matchMediaMock'
import React from 'react'
import { mount } from 'enzyme'
import { MemoryRouter } from 'react-router-dom'
import { act } from '@testing-library/react'
import Labs from 'labs/Labs'
import NewLabRequest from 'labs/requests/NewLabRequest'
import Permissions from 'model/Permissions'
import ViewLab from 'labs/ViewLab'
import LabRepository from 'clients/db/LabRepository'
import Lab from 'model/Lab'
import Patient from 'model/Patient'
import PatientRepository from 'clients/db/PatientRepository'
import { useUserStore } from '../../store/user-store'
import { useLabStore } from '../../store/lab-store'

describe('Labs', () => {
  vi.spyOn(LabRepository, 'findAll').mockResolvedValue([])
  vi
    .spyOn(LabRepository, 'find')
    .mockResolvedValue({ id: '1234', requestedOn: new Date().toISOString() } as Lab)
  vi
    .spyOn(PatientRepository, 'find')
    .mockResolvedValue({ id: '12345', fullName: 'test test' } as Patient)

  describe('routing', () => {
    describe('/labs/new', () => {
      it('should render the new lab request screen when /labs/new is accessed', () => {
        useUserStore.setState({ permissions: [Permissions.RequestLab] })
        useLabStore.setState({
          lab: { id: 'labId', patientId: 'patientId' } as Lab,
          patient: { id: 'patientId', fullName: 'some name' } as Patient,
          status: 'success',
          error: {},
          fetchLab: vi.fn(),
          requestLab: vi.fn(),
          cancelLab: vi.fn(),
          completeLab: vi.fn(),
          updateLab: vi.fn(),
        })

        const wrapper = mount(
          <MemoryRouter initialEntries={['/labs/new']}>
            <Labs />
          </MemoryRouter>,
        )

        expect(wrapper.find(NewLabRequest)).toHaveLength(1)
      })

      it('should not navigate to /labs/new if the user does not have RequestLab permissions', () => {
        useUserStore.setState({ permissions: [] })

        const wrapper = mount(
          <MemoryRouter initialEntries={['/labs/new']}>
            <Labs />
          </MemoryRouter>,
        )

        expect(wrapper.find(NewLabRequest)).toHaveLength(0)
      })
    })

    describe('/labs/:id', () => {
      it('should render the view lab screen when /labs/:id is accessed', async () => {
        useUserStore.setState({ permissions: [Permissions.ViewLab] })
        useLabStore.setState({
          lab: {
            id: 'labId',
            patientId: 'patientId',
            requestedOn: new Date().toISOString(),
          } as Lab,
          patient: { id: 'patientId', fullName: 'some name' } as Patient,
          status: 'success',
          error: {},
          fetchLab: vi.fn(),
          requestLab: vi.fn(),
          cancelLab: vi.fn(),
          completeLab: vi.fn(),
          updateLab: vi.fn(),
        })

        let wrapper: any

        await act(async () => {
          wrapper = await mount(
            <MemoryRouter initialEntries={['/labs/1234']}>
              <Labs />
            </MemoryRouter>,
          )

          expect(wrapper.find(ViewLab)).toHaveLength(1)
        })
      })

      it('should not navigate to /labs/:id if the user does not have ViewLab permissions', async () => {
        useUserStore.setState({ permissions: [] })

        const wrapper = await mount(
          <MemoryRouter initialEntries={['/labs/1234']}>
            <Labs />
          </MemoryRouter>,
        )

        expect(wrapper.find(ViewLab)).toHaveLength(0)
      })
    })
  })
})
