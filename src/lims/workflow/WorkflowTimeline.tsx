import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Container, Row, Column, Panel, Spinner, Alert, Button } from '@hospitalrun/components'
import { useWorkflowTimeline, useAdvanceOrder } from '../../hooks/useWorkflow'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'

const WorkflowTimeline = () => {
  const { t } = useTranslation()
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { data: timeline, isLoading, error } = useWorkflowTimeline(orderId)
  const advanceOrderMutation = useAdvanceOrder()
  const setButtonToolBar = useButtonToolbarSetter()

  useTitle(timeline ? `${String(t('lims.workflow.timeline', 'Workflow Timeline'))} - ${orderId}` : t('lims.workflow.timeline', 'Workflow Timeline'))
  useAddBreadcrumbs(
    orderId
      ? [
          { i18nKey: 'lims.labOrders.label', location: '/lims/lab-orders' },
          { i18nKey: 'lims.workflow.timeline', location: `/lims/workflow/${orderId}` },
        ]
      : [],
    true
  )

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="backButton"
        outlined
        color="secondary"
        icon="left-arrow"
        iconLocation="left"
        onClick={() => navigate(`/lims/lab-orders/${orderId}`)}
      >
        {String(t('actions.back', 'Back'))}
      </Button>,
      timeline && timeline.currentStatus !== 'completed' && (
        <Button
          key="advanceButton"
          color="primary"
          icon="arrow-right"
          iconLocation="right"
          onClick={() => {
            const performedBy = prompt(t('lims.workflow.performedBy', 'Performed By (name or ID):'))
            if (performedBy) {
              advanceOrderMutation.mutate({
                orderId: orderId!,
                performedBy,
              })
            }
          }}
        >
          {String(t('lims.workflow.advance', 'Advance to Next Stage'))}
        </Button>
      ),
    ].filter(Boolean) as React.ReactElement[])
    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t, orderId, timeline, advanceOrderMutation])

  if (isLoading) {
    return (
      <Container>
        <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
      </Container>
    )
  }

  if (error || !timeline) {
    return (
      <Container>
        <Alert
          color="danger"
          title={String(t('states.error', 'Error'))}
          message={String(error?.message || t('lims.workflow.timelineError', 'Failed to load workflow timeline'))}
        />
      </Container>
    )
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'pre-analytical': return 'primary'
      case 'analytical': return 'info'
      case 'post-analytical': return 'success'
      default: return 'secondary'
    }
  }

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'order_created': return 'file-alt'
      case 'specimen_collected': return 'syringe'
      case 'specimen_received': return 'inbox'
      case 'specimen_processed': return 'cog'
      case 'result_entered': return 'flask'
      case 'result_finalized': return 'check-circle'
      case 'report_generated': return 'file-pdf'
      case 'report_delivered': return 'paper-plane'
      default: return 'circle'
    }
  }

  return (
    <Container>
      <Row>
        <Column md={12}>
          <Panel title={`${String(t('lims.workflow.timeline', 'Workflow Timeline'))} - Order ${orderId}`}>
            <Row>
              <Column md={12}>
                <div className="mb-3">
                  <strong>{String(t('lims.workflow.currentStatus', 'Current Status'))}:</strong>{' '}
                  <span className={`badge badge-${getStageColor(timeline.currentStage)}`}>
                    {timeline.currentStatus}
                  </span>
                  {' '}
                  <strong>{String(t('lims.workflow.currentStage', 'Current Stage'))}:</strong>{' '}
                  <span className={`badge badge-${getStageColor(timeline.currentStage)}`}>
                    {timeline.currentStage}
                  </span>
                </div>
                <div className="mb-3">
                  <strong>{String(t('lims.workflow.summary', 'Summary'))}:</strong>{' '}
                  {String(t('lims.workflow.preAnalytical', 'Pre-Analytical'))}: {timeline.summary.preAnalytical}, {' '}
                  {String(t('lims.workflow.analytical', 'Analytical'))}: {timeline.summary.analytical}, {' '}
                  {String(t('lims.workflow.postAnalytical', 'Post-Analytical'))}: {timeline.summary.postAnalytical}
                </div>
              </Column>
            </Row>
            <Row>
              <Column md={12}>
                <div className="timeline">
                  {timeline.timeline.map((event, index) => (
                    <div key={index} className="timeline-item mb-3">
                      <div className="d-flex">
                        <div className="mr-3">
                          <i className={`fas fa-${getEventIcon(event.event)} text-${getStageColor(event.stage)}`} style={{ fontSize: '1.5rem' }} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <div>
                              <strong>{event.description}</strong>
                              <br />
                              <small className="text-muted">
                                {new Date(event.timestamp).toLocaleString()}
                              </small>
                            </div>
                            <div>
                              <span className={`badge badge-${getStageColor(event.stage)}`}>
                                {event.stage}
                              </span>
                              {' '}
                              <span className={`badge badge-${event.status === 'completed' || event.status === 'finalized' ? 'success' : 'secondary'}`}>
                                {event.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Column>
            </Row>
          </Panel>
        </Column>
      </Row>
    </Container>
  )
}

export default WorkflowTimeline


