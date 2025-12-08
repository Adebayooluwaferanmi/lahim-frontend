import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, TextInput, Spinner, Alert, Table } from '@hospitalrun/components'
import { useImaging } from '../hooks/useImaging'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { Imaging as ImagingType } from '../model/Imaging'

const breadcrumbs = [{ i18nKey: 'imaging.label', location: '/imaging' }]

const Imaging = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('imaging.label', 'Imaging'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [statusFilter, setStatusFilter] = useState('')
  const [patientIdFilter, setPatientIdFilter] = useState('')

  const { data: imaging = [], isLoading, error } = useImaging({
    status: statusFilter || undefined,
    patientId: patientIdFilter || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="newImagingButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/imaging/new')}
      >
        {String(t('imaging.new', 'New Imaging Order'))}
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
          message={String(error.message || t('imaging.loadError', 'Failed to load imaging orders'))}
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
      case 'Completed':
        return 'success'
      case 'In Progress':
        return 'warning'
      case 'Requested':
        return 'info'
      case 'Cancelled':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  return (
    <Container>
      <Row>
        <Column>
          <h2>{t('imaging.label', 'Imaging Orders')}</h2>
        </Column>
      </Row>

      <Row>
        <Column md={4}>
          <TextInput
            id="patientIdFilter"
            label={t('imaging.searchPatientId', 'Search by Patient ID')}
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
            <option value="">{t('imaging.allStatus', 'All Status')}</option>
            <option value="Requested">{t('imaging.status.requested', 'Requested')}</option>
            <option value="In Progress">{t('imaging.status.inProgress', 'In Progress')}</option>
            <option value="Completed">{t('imaging.status.completed', 'Completed')}</option>
            <option value="Cancelled">{t('imaging.status.cancelled', 'Cancelled')}</option>
          </select>
        </Column>
      </Row>

      <Row>
        <Column>
          <Table
            data={imaging}
            getID={(row) => row.id}
            columns={[
              {
                label: t('imaging.patientId', 'Patient ID'),
                key: 'patientId',
              },
              {
                label: t('imaging.imagingType', 'Imaging Type'),
                key: 'imagingTypeName',
              },
              {
                label: t('imaging.requestedDate', 'Requested Date'),
                key: 'requestedDate',
                formatter: (row: ImagingType) => formatDate(row.requestedDate),
              },
              {
                label: t('imaging.imagingDate', 'Imaging Date'),
                key: 'imagingDate',
                formatter: (row: ImagingType) => formatDate(row.imagingDate),
              },
              {
                label: t('imaging.status', 'Status'),
                key: 'status',
                formatter: (row: ImagingType) => (
                  <span className={`badge bg-${getStatusBadgeColor(row.status)}`}>{row.status}</span>
                ),
              },
            ]}
            actionsHeaderText={t('actions.label', 'Actions')}
            actions={[
              {
                label: t('actions.view', 'View'),
                action: (row: ImagingType) => navigate(`/imaging/${row.id}`),
              },
            ]}
          />
        </Column>
      </Row>
    </Container>
  )
}

export default Imaging

