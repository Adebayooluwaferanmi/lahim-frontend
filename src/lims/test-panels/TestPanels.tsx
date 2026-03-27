import React, { useCallback } from 'react'
import useTitle from '../../page-header/useTitle'
import { useTranslation } from 'react-i18next'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import { Button, Container, Spinner, Alert } from '@lahim/components'
import { useNavigate } from 'react-router-dom'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useTestPanels } from '../../hooks/useTestPanels'

const breadcrumbs = [{ i18nKey: 'lims.testPanels.label', location: '/lims/test-panels' }]

const TestPanels = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setButtons = useButtonToolbarSetter()
  useTitle(t('lims.testPanels.label', 'Test Panels'))
  useAddBreadcrumbs(breadcrumbs, true)

  const { data, isLoading, error } = useTestPanels()

  // Normalize response format
  const panels = data
    ? Array.isArray(data)
      ? data
      : (data as { panels?: any[] }).panels || []
    : []

  const getButtons = useCallback(() => {
    return [
      <Button
        icon="add"
        onClick={() => navigate('/lims/test-panels/new')}
        outlined
        color="success"
        key="testPanels.new"
      >
        {String(t('lims.testPanels.new', 'New Panel'))}
      </Button>,
    ]
  }, [navigate, t])

  React.useEffect(() => {
    setButtons(getButtons())

    return () => {
      setButtons([])
    }
  }, [setButtons, getButtons])

  const onTableRowClick = (panel: any) => {
    navigate(`/lims/test-panels/${panel.id || panel._id}`)
  }

  if (isLoading) {
    return (
      <Container>
        <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
      </Container>
    )
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : (error as any)?.message || String(error) || t('lims.testPanels.loadError', 'Failed to load test panels')
    return (
      <Container>
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={errorMessage} />
      </Container>
    )
  }

  return (
    <Container>
      {panels.length === 0 ? (
        <Alert color="info" title={String(t('lims.testPanels.noPanels', 'No Test Panels'))} message={String(t('lims.testPanels.noPanelsMessage', 'No test panels found. Create a new panel to get started.'))} />
      ) : (
        <table className="table table-hover">
          <thead className="thead-light">
            <tr>
              <th>{String(t('lims.testPanels.code', 'Panel Code'))}</th>
              <th>{String(t('lims.testPanels.name', 'Panel Name'))}</th>
              <th>{String(t('lims.testPanels.department', 'Department'))}</th>
              <th>{String(t('lims.testPanels.parameters', 'Parameters'))}</th>
              <th>{String(t('lims.testPanels.active', 'Active'))}</th>
            </tr>
          </thead>
          <tbody>
            {panels.map((panel) => (
              <tr onClick={() => onTableRowClick(panel)} key={panel.id || panel._id}>
                <td>{panel.code}</td>
                <td>{panel.name}</td>
                <td>{panel.department || '-'}</td>
                <td>{panel.parameters?.length || 0}</td>
                <td>{panel.active ? String(t('common.yes', 'Yes')) : String(t('common.no', 'No'))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Container>
  )
}

export default TestPanels

