import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, TextInput, Spinner, Alert, Table } from '@hospitalrun/components'
import { useIncidents } from '../hooks/useIncidents'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { Incident, IncidentStatus, IncidentSeverity, IncidentCategory } from '../model/Incident'

const breadcrumbs = [{ i18nKey: 'incidents.label', location: '/incidents' }]

const Incidents = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('incidents.label', 'Incidents'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [statusFilter, setStatusFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [patientIdFilter, setPatientIdFilter] = useState('')

  const { data: incidents = [], isLoading, error } = useIncidents({
    status: statusFilter || undefined,
    severity: severityFilter || undefined,
    category: categoryFilter || undefined,
    patientId: patientIdFilter || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="newIncidentButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/incidents/new')}
      >
        {String(t('incidents.new', 'New Incident'))}
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
          message={String(error.message || t('incidents.loadError', 'Failed to load incidents'))}
        />
      </Container>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadgeColor = (status: IncidentStatus) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return 'success'
      case 'Under Investigation':
        return 'warning'
      case 'Reported':
        return 'info'
      case 'Cancelled':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  const getSeverityBadgeColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'danger'
      case 'High':
        return 'warning'
      case 'Medium':
        return 'info'
      case 'Low':
        return 'success'
      default:
        return 'secondary'
    }
  }

  return (
    <Container>
      <Row>
        <Column>
          <h2>{t('incidents.label', 'Incidents')}</h2>
        </Column>
      </Row>

      <Row>
        <Column md={3}>
          <TextInput
            id="patientIdFilter"
            label={t('incidents.searchPatientId', 'Search by Patient ID')}
            value={patientIdFilter}
            onChange={(e) => setPatientIdFilter(e.target.value)}
          />
        </Column>
        <Column md={3}>
          <select
            id="statusFilter"
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t('incidents.allStatus', 'All Status')}</option>
            <option value="Reported">{t('incidents.status.reported', 'Reported')}</option>
            <option value="Under Investigation">{t('incidents.status.underInvestigation', 'Under Investigation')}</option>
            <option value="Resolved">{t('incidents.status.resolved', 'Resolved')}</option>
            <option value="Closed">{t('incidents.status.closed', 'Closed')}</option>
            <option value="Cancelled">{t('incidents.status.cancelled', 'Cancelled')}</option>
          </select>
        </Column>
        <Column md={3}>
          <select
            id="severityFilter"
            className="form-control"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="">{t('incidents.allSeverity', 'All Severity')}</option>
            <option value="Critical">{t('incidents.severity.critical', 'Critical')}</option>
            <option value="High">{t('incidents.severity.high', 'High')}</option>
            <option value="Medium">{t('incidents.severity.medium', 'Medium')}</option>
            <option value="Low">{t('incidents.severity.low', 'Low')}</option>
          </select>
        </Column>
        <Column md={3}>
          <select
            id="categoryFilter"
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">{t('incidents.allCategory', 'All Categories')}</option>
            <option value="Patient Safety">{t('incidents.category.patientSafety', 'Patient Safety')}</option>
            <option value="Medication Error">{t('incidents.category.medicationError', 'Medication Error')}</option>
            <option value="Equipment Failure">{t('incidents.category.equipmentFailure', 'Equipment Failure')}</option>
            <option value="Infection Control">{t('incidents.category.infectionControl', 'Infection Control')}</option>
            <option value="Staff Safety">{t('incidents.category.staffSafety', 'Staff Safety')}</option>
            <option value="Environmental">{t('incidents.category.environmental', 'Environmental')}</option>
            <option value="Documentation Error">{t('incidents.category.documentationError', 'Documentation Error')}</option>
            <option value="Other">{t('incidents.category.other', 'Other')}</option>
          </select>
        </Column>
      </Row>

      <Row>
        <Column>
          <Table
            data={incidents}
            getID={(row) => row.id || row._id}
            columns={[
              {
                label: t('incidents.incidentNumber', 'Incident #'),
                key: 'incidentNumber',
              },
              {
                label: t('incidents.category', 'Category'),
                key: 'category',
              },
              {
                label: t('incidents.severity', 'Severity'),
                key: 'severity',
                formatter: (row: Incident) => (
                  <span className={`badge bg-${getSeverityBadgeColor(row.severity)}`}>{row.severity}</span>
                ),
              },
              {
                label: t('incidents.reportedDate', 'Reported Date'),
                key: 'reportedDate',
                formatter: (row: Incident) => formatDate(row.reportedDate),
              },
              {
                label: t('incidents.status', 'Status'),
                key: 'status',
                formatter: (row: Incident) => (
                  <span className={`badge bg-${getStatusBadgeColor(row.status)}`}>{row.status}</span>
                ),
              },
            ]}
            actionsHeaderText={t('actions.label', 'Actions')}
            actions={[
              {
                label: t('actions.view', 'View'),
                action: (row: Incident) => navigate(`/incidents/${row.id || row._id}`),
              },
            ]}
          />
        </Column>
      </Row>
    </Container>
  )
}

export default Incidents

