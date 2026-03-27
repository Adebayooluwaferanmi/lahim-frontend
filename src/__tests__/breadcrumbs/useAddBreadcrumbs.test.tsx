import { renderHook } from '@testing-library/react-hooks'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useUIStore } from '../../store/ui-store'

describe('useAddBreadcrumbs', () => {
  beforeEach(() => {
    useUIStore.setState({ breadcrumbs: [] })
  })

  it('should call addBreadcrumbs with the correct data', () => {
    const breadcrumbs = [
      {
        text: 'Patients',
        location: '/patients',
      },
    ]

    renderHook(() => useAddBreadcrumbs(breadcrumbs))
    expect(useUIStore.getState().breadcrumbs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: 'Patients', location: '/patients' }),
      ]),
    )
  })

  it('should call addBreadcrumbs with an additional dashboard breadcrumb', () => {
    const breadcrumbs = [
      {
        text: 'Patients',
        location: '/patients',
      },
    ]

    renderHook(() => useAddBreadcrumbs(breadcrumbs, true))
    expect(useUIStore.getState().breadcrumbs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: 'Patients', location: '/patients' }),
        expect.objectContaining({ i18nKey: 'dashboard.label', location: '/' }),
      ]),
    )
  })

  it('should call removeBreadcrumbs with the correct data after unmount', () => {
    const breadcrumbs = [
      {
        text: 'Patients',
        location: '/patients',
      },
    ]

    const { unmount } = renderHook(() => useAddBreadcrumbs(breadcrumbs))
    expect(useUIStore.getState().breadcrumbs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: 'Patients', location: '/patients' }),
      ]),
    )

    unmount()
    expect(useUIStore.getState().breadcrumbs).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: 'Patients', location: '/patients' }),
      ]),
    )
  })
})
