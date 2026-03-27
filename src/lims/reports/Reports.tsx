import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, Spinner, Alert } from '@lahim/components'
import { useReports } from '../../hooks/useReports'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'

const breadcrumbs = [{ i18nKey: 'lims.reports.label', location: '/lims/reports' }]

const Reports = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.reports.label', 'Reports'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [statusFilter, setStatusFilter] = useState('')

  const { data: reports = [], isLoading, error } = useReports({
    status: statusFilter || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="generateReportButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/lims/reports/generate')}
      >
        {String(t('lims.reports.generate', 'Generate Report'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

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
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={String(error.message || t('lims.reports.loadError', 'Failed to load reports'))} />
      </Container>
    )
  }

  return (
    <Container>
      <Row>
        <Column md={6}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{String(t('lims.reports.allStatus', 'All Status'))}</option>
            <option value="draft">{String(t('lims.reports.status.draft', 'Draft'))}</option>
            <option value="final">{String(t('lims.reports.status.final', 'Final'))}</option>
            <option value="signed">{String(t('lims.reports.status.signed', 'Signed'))}</option>
            <option value="delivered">{String(t('lims.reports.status.delivered', 'Delivered'))}</option>
          </select>
        </Column>
      </Row>

      <Row>
        <Column>
          {reports.length === 0 ? (
            <div>{String(t('lims.reports.noReports', 'No reports found'))}</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{String(t('lims.reports.reportNumber', 'Report Number'))}</th>
                  <th>{String(t('lims.reports.patientName', 'Patient Name'))}</th>
                  <th>{String(t('lims.reports.status', 'Status'))}</th>
                  <th>{String(t('lims.reports.reportDate', 'Report Date'))}</th>
                  <th>{String(t('actions.view', 'View'))}</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id || report._id}>
                    <td>{report.reportNumber || '-'}</td>
                    <td>{report.patientName || '-'}</td>
                    <td>
                      <span className={`badge badge-${report.status === 'delivered' ? 'success' : 'warning'}`}>
                        {report.status || '-'}
                      </span>
                    </td>
                    <td>{report.reportDate ? new Date(report.reportDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/lims/reports/${report.id || report._id}`)}
                      >
                        {String(t('actions.view', 'View'))}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Column>
      </Row>
    </Container>
  )
}

export default Reports

