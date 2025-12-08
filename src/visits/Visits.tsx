import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, TextInput, Spinner, Alert, Table } from '@hospitalrun/components'
import { useVisits } from '../hooks/useVisits'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import Visit from '../model/Visit'

const breadcrumbs = [{ i18nKey: 'visits.label', location: '/visits' }]

const Visits = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('visits.label', 'Visits'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [statusFilter, setStatusFilter] = useState('')
  const [patientIdFilter, setPatientIdFilter] = useState('')

  const { data: visits = [], isLoading, error } = useVisits({
    status: statusFilter || undefined,
    patientId: patientIdFilter || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="newVisitButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/visits/new')}
      >
        {String(t('visits.new', 'New Visit'))}
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
          message={String(error.message || t('visits.loadError', 'Failed to load visits'))}
        />
      </Container>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Admitted':
        return 'primary'
      case 'Discharged':
        return 'success'
      case 'CheckedOut':
        return 'info'
      case 'InProgress':
        return 'warning'
      case 'Cancelled':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  return (
    <Container>
      <Row>
        <Column md={4}>
          <TextInput
            placeholder={String(t('visits.searchPatientId', 'Search by Patient ID'))}
            value={patientIdFilter}
            onChange={(e) => setPatientIdFilter(e.target.value)}
          />
        </Column>
        <Column md={4}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{String(t('visits.allStatus', 'All Status'))}</option>
            <option value="Admitted">{String(t('visits.statusValues.admitted', 'Admitted'))}</option>
            <option value="Discharged">{String(t('visits.statusValues.discharged', 'Discharged'))}</option>
            <option value="CheckedOut">{String(t('visits.statusValues.checkedOut', 'Checked Out'))}</option>
            <option value="InProgress">{String(t('visits.statusValues.inProgress', 'In Progress'))}</option>
            <option value="Cancelled">{String(t('visits.statusValues.cancelled', 'Cancelled'))}</option>
          </select>
        </Column>
      </Row>

      <Row className="mt-3">
        <Column>
          <Table
            data={visits.map((visit: Visit) => ({
              id: visit.id || visit._id,
              patientId: visit.patientId,
              startDate: formatDate(visit.startDate),
              visitType: visit.visitType,
              status: visit.status,
              location: visit.location,
              actions: (
                <Button
                  color="primary"
                  onClick={() => navigate(`/visits/${visit.id || visit._id}`)}
                >
                  {String(t('actions.view', 'View'))}
                </Button>
              ),
            }))}
            columns={[
              { label: t('visits.patientId', 'Patient ID'), key: 'patientId' },
              { label: t('visits.startDate', 'Start Date'), key: 'startDate' },
              { label: t('visits.visitType', 'Visit Type'), key: 'visitType' },
              { label: t('visits.status', 'Status'), key: 'status' },
              { label: t('visits.location', 'Location'), key: 'location' },
              { label: t('actions.label', 'Actions'), key: 'actions' },
            ]}
          />
        </Column>
      </Row>
    </Container>
  )
}

export default Visits

