import { renderHook } from '@testing-library/react-hooks'
import useTitle from '../../page-header/useTitle'
import { useUIStore } from '../../store/ui-store'

describe('useTitle', () => {
  beforeEach(() => {
    useUIStore.setState({ title: '' })
  })

  it('should call the updateTitle with the correct data', () => {
    const expectedTitle = 'title'

    renderHook(() => useTitle(expectedTitle))
    expect(useUIStore.getState().title).toBe(expectedTitle)
  })
})
