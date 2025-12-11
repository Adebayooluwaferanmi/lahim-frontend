import React from 'react'
import { useTranslation } from 'react-i18next'
import { Container, Row, Column, Panel, Spinner, Alert } from '@hospitalrun/components'
import { useWorkflowDashboard } from '../../hooks/useWorkflow'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'

const breadcrumbs = [{ i18nKey: 'lims.workflow.dashboard', location: '/lims/workflow' }]

const WorkflowDashboard = () => {
  const { t } = useTranslation()
  useTitle(t('lims.workflow.dashboard', 'Workflow Dashboard'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const { data: dashboard, isLoading, error } = useWorkflowDashboard()

  React.useEffect(() => {
    setButtonToolBar([])
    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar])

  if (isLoading) {
    return (
      <Container>
        <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Alert
          color="danger"
          title={String(t('states.error', 'Error'))}
          message={String(error.message || t('lims.workflow.loadError', 'Failed to load workflow dashboard'))}
        />
      </Container>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in-progress': return 'info'
      case 'received': return 'primary'
      case 'collected': return 'warning'
      case 'requested': return 'secondary'
      default: return 'secondary'
    }
  }

  return (
    <Container>
      <Row>
        <Column md={4}>
          <Panel title={String(t('lims.workflow.preAnalytical', 'Pre-Analytical'))} color="primary">
            <table className="table">
              <tbody>
                <tr>
                  <td>{String(t('lims.workflow.requested', 'Requested'))}</td>
                  <td><span className={`badge badge-${getStatusColor('requested')}`}>{dashboard?.preAnalytical.requested || 0}</span></td>
                </tr>
                <tr>
                  <td>{String(t('lims.workflow.approved', 'Approved'))}</td>
                  <td><span className={`badge badge-${getStatusColor('approved')}`}>{dashboard?.preAnalytical.approved || 0}</span></td>
                </tr>
                <tr>
                  <td>{String(t('lims.workflow.collected', 'Collected'))}</td>
                  <td><span className={`badge badge-${getStatusColor('collected')}`}>{dashboard?.preAnalytical.collected || 0}</span></td>
                </tr>
                <tr>
                  <td>{String(t('lims.workflow.received', 'Received'))}</td>
                  <td><span className={`badge badge-${getStatusColor('received')}`}>{dashboard?.preAnalytical.received || 0}</span></td>
                </tr>
                <tr>
                  <td><strong>{String(t('lims.workflow.pendingSpecimens', 'Pending Specimens'))}</strong></td>
                  <td><span className="badge badge-warning">{dashboard?.preAnalytical.pendingSpecimens || 0}</span></td>
                </tr>
              </tbody>
            </table>
          </Panel>
        </Column>
        <Column md={4}>
          <Panel title={String(t('lims.workflow.analytical', 'Analytical'))} color="info">
            <table className="table">
              <tbody>
                <tr>
                  <td>{String(t('lims.workflow.inProgress', 'In Progress'))}</td>
                  <td><span className={`badge badge-${getStatusColor('in-progress')}`}>{dashboard?.analytical['in-progress'] || 0}</span></td>
                </tr>
                <tr>
                  <td><strong>{String(t('lims.workflow.pendingResults', 'Pending Results'))}</strong></td>
                  <td><span className="badge badge-warning">{dashboard?.analytical.pendingResults || 0}</span></td>
                </tr>
              </tbody>
            </table>
          </Panel>
        </Column>
        <Column md={4}>
          <Panel title={String(t('lims.workflow.postAnalytical', 'Post-Analytical'))} color="success">
            <table className="table">
              <tbody>
                <tr>
                  <td>{String(t('lims.workflow.completed', 'Completed'))}</td>
                  <td><span className={`badge badge-${getStatusColor('completed')}`}>{dashboard?.postAnalytical.completed || 0}</span></td>
                </tr>
                <tr>
                  <td><strong>{String(t('lims.workflow.pendingReports', 'Pending Reports'))}</strong></td>
                  <td><span className="badge badge-warning">{dashboard?.postAnalytical.pendingReports || 0}</span></td>
                </tr>
              </tbody>
            </table>
          </Panel>
        </Column>
      </Row>
    </Container>
  )
}

export default WorkflowDashboard



