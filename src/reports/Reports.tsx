import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, TextInput, Spinner, Alert, Table } from '@lahim/components'
import { useReports } from '../hooks/useReports'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { Report, ReportStatus } from '../model/Report'

const breadcrumbs = [{ i18nKey: 'reports.label', location: '/reports' }]

const Reports = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('reports.label', 'Reports'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [statusFilter, setStatusFilter] = useState('')
  const [reportTypeFilter, setReportTypeFilter] = useState('')
  const [patientIdFilter, setPatientIdFilter] = useState('')

  const { data: reports = [], isLoading, error } = useReports({
    status: statusFilter || undefined,
    reportType: reportTypeFilter || undefined,
    patientId: patientIdFilter || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="analyticsButton"
        color="info"
        icon="chart-bar"
        iconLocation="left"
        onClick={() => navigate('/reports/analytics')}
      >
        {String(t('reports.analytics', 'Analytics'))}
      </Button>,
      <Button
        key="administrativeButton"
        color="secondary"
        icon="chart-bar"
        iconLocation="left"
        onClick={() => navigate('/reports/administrative')}
      >
        {String(t('reports.administrative', 'Administrative'))}
      </Button>,
      <Button
        key="financialButton"
        color="warning"
        icon="chart-bar"
        iconLocation="left"
        onClick={() => navigate('/reports/financial')}
      >
        {String(t('reports.financial', 'Financial'))}
      </Button>,
      <Button
        key="customBuilderButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/reports/custom')}
      >
        {String(t('reports.customBuilder', 'Custom Builder'))}
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
        <Alert
          color="danger"
          title={String(t('states.error', 'Error'))}
          message={String(error.message || t('reports.loadError', 'Failed to load reports'))}
        />
      </Container>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadgeColor = (status: ReportStatus) => {
    switch (status) {
      case 'Delivered':
        return 'success'
      case 'Generated':
        return 'info'
      case 'Draft':
        return 'warning'
      case 'Archived':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  return (
    <Container>
      <Row>
        <Column>
          <h2>{t('reports.label', 'Reports')}</h2>
        </Column>
      </Row>

      <Row>
        <Column md={4}>
          <TextInput
            id="patientIdFilter"
            label={t('reports.searchPatientId', 'Search by Patient ID')}
            value={patientIdFilter}
            onChange={(e) => setPatientIdFilter(e.target.value)}
          />
        </Column>
        <Column md={4}>
          <select
            id="statusFilter"
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t('reports.allStatus', 'All Status')}</option>
            <option value="Draft">{t('reports.status.draft', 'Draft')}</option>
            <option value="Generated">{t('reports.status.generated', 'Generated')}</option>
            <option value="Delivered">{t('reports.status.delivered', 'Delivered')}</option>
            <option value="Archived">{t('reports.status.archived', 'Archived')}</option>
          </select>
        </Column>
        <Column md={4}>
          <select
            id="reportTypeFilter"
            className="form-control"
            value={reportTypeFilter}
            onChange={(e) => setReportTypeFilter(e.target.value)}
          >
            <option value="">{t('reports.allTypes', 'All Types')}</option>
            <option value="Lab Results">{t('reports.type.labResults', 'Lab Results')}</option>
            <option value="Patient Summary">{t('reports.type.patientSummary', 'Patient Summary')}</option>
            <option value="Visit Summary">{t('reports.type.visitSummary', 'Visit Summary')}</option>
            <option value="Billing Summary">{t('reports.type.billingSummary', 'Billing Summary')}</option>
            <option value="Medication History">{t('reports.type.medicationHistory', 'Medication History')}</option>
            <option value="Imaging Summary">{t('reports.type.imagingSummary', 'Imaging Summary')}</option>
            <option value="Incident Report">{t('reports.type.incidentReport', 'Incident Report')}</option>
          </select>
        </Column>
      </Row>

      <Row>
        <Column>
          <Table
            data={reports}
            getID={(row) => row.id || row._id}
            columns={[
              {
                label: t('reports.reportNumber', 'Report #'),
                key: 'reportNumber',
              },
              {
                label: t('reports.reportType', 'Type'),
                key: 'reportType',
              },
              {
                label: t('reports.generatedOn', 'Generated On'),
                key: 'generatedOn',
                formatter: (row: Report) => formatDate(row.generatedOn),
              },
              {
                label: t('reports.status', 'Status'),
                key: 'status',
                formatter: (row: Report) => (
                  <span className={`badge bg-${getStatusBadgeColor(row.status)}`}>{row.status}</span>
                ),
              },
              {
                label: t('reports.format', 'Format'),
                key: 'format',
              },
            ]}
            actionsHeaderText={t('actions.label', 'Actions')}
            actions={[
              {
                label: t('actions.view', 'View'),
                action: (row: Report) => navigate(`/reports/${row.id || row._id}`),
              },
            ]}
          />
        </Column>
      </Row>
    </Container>
  )
}

export default Reports

