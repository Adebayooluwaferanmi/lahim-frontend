import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Container, Row, Column, Panel, Spinner, Alert, Button } from '@hospitalrun/components'
import { useAnalytics } from '../hooks/useReports'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import DatePickerWithLabelFormGroup from '../components/input/DatePickerWithLabelFormGroup'

const breadcrumbs = [{ i18nKey: 'reports.analytics', location: '/reports/analytics' }]

const Analytics = () => {
  const { t } = useTranslation()
  useTitle(t('reports.analytics', 'Analytics'))
  useAddBreadcrumbs(breadcrumbs, true)

  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  const [endDate, setEndDate] = useState(new Date())

  const { data: analytics, isLoading, error, refetch } = useAnalytics({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  })

  const handleRefresh = () => {
    refetch()
  }

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
          message={String((error as any)?.message || t('reports.analyticsError', 'Failed to load analytics'))}
        />
      </Container>
    )
  }

  return (
    <Container>
      <Row>
        <Column>
          <h2>{t('reports.analytics', 'Analytics Dashboard')}</h2>
        </Column>
      </Row>

      <Row>
        <Column md={4}>
          <DatePickerWithLabelFormGroup
            name="startDate"
            label={t('reports.startDate', 'Start Date')}
            value={startDate}
            onChange={(date) => setStartDate(date)}
            isEditable
          />
        </Column>
        <Column md={4}>
          <DatePickerWithLabelFormGroup
            name="endDate"
            label={t('reports.endDate', 'End Date')}
            value={endDate}
            onChange={(date) => setEndDate(date)}
            isEditable
          />
        </Column>
        <Column md={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
          <Button color="primary" onClick={handleRefresh}>
            {String(t('actions.refresh', 'Refresh'))}
          </Button>
        </Column>
      </Row>

      {analytics && (
        <>
          {/* Visits Analytics */}
          {analytics.visits && (
            <Row>
              <Column md={6}>
                <Panel title={String(t('reports.visits', 'Visits'))}>
                  <p>
                    <strong>{t('reports.total', 'Total')}:</strong> {analytics.visits.total || 0}
                  </p>
                  {analytics.visits.byType && Object.keys(analytics.visits.byType).length > 0 && (
                    <div>
                      <strong>{t('reports.byType', 'By Type')}:</strong>
                      <ul>
                        {Object.entries(analytics.visits.byType).map(([type, count]) => (
                          <li key={type}>
                            {type}: {count as number}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analytics.visits.byStatus && Object.keys(analytics.visits.byStatus).length > 0 && (
                    <div>
                      <strong>{t('reports.byStatus', 'By Status')}:</strong>
                      <ul>
                        {Object.entries(analytics.visits.byStatus).map(([status, count]) => (
                          <li key={status}>
                            {status}: {count as number}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Panel>
              </Column>
            </Row>
          )}

          {/* Financial Analytics */}
          {analytics.financial && (
            <Row>
              <Column md={6}>
                <Panel title={String(t('reports.financial', 'Financial'))}>
                  <p>
                    <strong>{t('reports.totalInvoices', 'Total Invoices')}:</strong>{' '}
                    {analytics.financial.totalInvoices || 0}
                  </p>
                  <p>
                    <strong>{t('reports.totalRevenue', 'Total Revenue')}:</strong> $
                    {(analytics.financial.totalRevenue || 0).toFixed(2)}
                  </p>
                  <p>
                    <strong>{t('reports.totalPaid', 'Total Paid')}:</strong> $
                    {(analytics.financial.totalPaid || 0).toFixed(2)}
                  </p>
                  <p>
                    <strong>{t('reports.totalOutstanding', 'Total Outstanding')}:</strong> $
                    {(analytics.financial.totalOutstanding || 0).toFixed(2)}
                  </p>
                  {analytics.financial.byStatus && Object.keys(analytics.financial.byStatus).length > 0 && (
                    <div>
                      <strong>{t('reports.byStatus', 'By Status')}:</strong>
                      <ul>
                        {Object.entries(analytics.financial.byStatus).map(([status, count]) => (
                          <li key={status}>
                            {status}: {count as number}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Panel>
              </Column>
            </Row>
          )}

          {/* Incidents Analytics */}
          {analytics.incidents && (
            <Row>
              <Column md={6}>
                <Panel title={String(t('reports.incidents', 'Incidents'))}>
                  <p>
                    <strong>{t('reports.total', 'Total')}:</strong> {analytics.incidents.total || 0}
                  </p>
                  {analytics.incidents.bySeverity && Object.keys(analytics.incidents.bySeverity).length > 0 && (
                    <div>
                      <strong>{t('reports.bySeverity', 'By Severity')}:</strong>
                      <ul>
                        {Object.entries(analytics.incidents.bySeverity).map(([severity, count]) => (
                          <li key={severity}>
                            {severity}: {count as number}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analytics.incidents.byCategory && Object.keys(analytics.incidents.byCategory).length > 0 && (
                    <div>
                      <strong>{t('reports.byCategory', 'By Category')}:</strong>
                      <ul>
                        {Object.entries(analytics.incidents.byCategory).map(([category, count]) => (
                          <li key={category}>
                            {category}: {count as number}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analytics.incidents.byStatus && Object.keys(analytics.incidents.byStatus).length > 0 && (
                    <div>
                      <strong>{t('reports.byStatus', 'By Status')}:</strong>
                      <ul>
                        {Object.entries(analytics.incidents.byStatus).map(([status, count]) => (
                          <li key={status}>
                            {status}: {count as number}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Panel>
              </Column>
            </Row>
          )}

          {/* Imaging Analytics */}
          {analytics.imaging && (
            <Row>
              <Column md={6}>
                <Panel title={String(t('reports.imaging', 'Imaging'))}>
                  <p>
                    <strong>{t('reports.total', 'Total')}:</strong> {analytics.imaging.total || 0}
                  </p>
                  {analytics.imaging.byStatus && Object.keys(analytics.imaging.byStatus).length > 0 && (
                    <div>
                      <strong>{t('reports.byStatus', 'By Status')}:</strong>
                      <ul>
                        {Object.entries(analytics.imaging.byStatus).map(([status, count]) => (
                          <li key={status}>
                            {status}: {count as number}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Panel>
              </Column>
            </Row>
          )}
        </>
      )}
    </Container>
  )
}

export default Analytics

