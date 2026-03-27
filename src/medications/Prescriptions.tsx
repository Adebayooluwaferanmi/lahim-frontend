import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, Spinner, Alert, Table } from '@lahim/components'
import { usePrescriptions } from '../hooks/useMedications'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { Prescription } from '../model/Medication'

const breadcrumbs = [{ i18nKey: 'prescriptions.label', location: '/prescriptions' }]

const Prescriptions = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('prescriptions.label', 'Prescriptions'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [statusFilter, setStatusFilter] = useState('')
  const [patientIdFilter, setPatientIdFilter] = useState('')

  const { data: prescriptions = [], isLoading, error } = usePrescriptions({
    status: statusFilter || undefined,
    patientId: patientIdFilter || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="newPrescriptionButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/prescriptions/new')}
      >
        {String(t('prescriptions.new', 'New Prescription'))}
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
          message={String(error.message || t('prescriptions.loadError', 'Failed to load prescriptions'))}
        />
      </Container>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Container>
      <Row>
        <Column md={4}>
          <input
            type="text"
            className="form-control"
            placeholder={String(t('prescriptions.searchPatientId', 'Search by Patient ID'))}
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
            <option value="">{String(t('prescriptions.allStatus', 'All Status'))}</option>
            <option value="active">{String(t('prescriptions.statusValues.active', 'Active'))}</option>
            <option value="completed">{String(t('prescriptions.statusValues.completed', 'Completed'))}</option>
            <option value="cancelled">{String(t('prescriptions.statusValues.cancelled', 'Cancelled'))}</option>
            <option value="discontinued">{String(t('prescriptions.statusValues.discontinued', 'Discontinued'))}</option>
          </select>
        </Column>
      </Row>

      <Row className="mt-3">
        <Column>
          <Table
            data={prescriptions.map((prescription: Prescription) => ({
              id: prescription.id || prescription._id,
              patientId: prescription.patientId,
              medicationName: prescription.medicationName,
              dosage: prescription.dosage,
              frequency: prescription.frequency,
              startDate: formatDate(prescription.startDate),
              status: prescription.status,
              actions: (
                <Button
                  color="primary"
                  onClick={() => navigate(`/prescriptions/${prescription.id || prescription._id}`)}
                >
                  {String(t('actions.view', 'View'))}
                </Button>
              ),
            }))}
            columns={[
              { label: t('prescriptions.patientId', 'Patient ID'), key: 'patientId' },
              { label: t('prescriptions.medicationName', 'Medication'), key: 'medicationName' },
              { label: t('prescriptions.dosage', 'Dosage'), key: 'dosage' },
              { label: t('prescriptions.frequency', 'Frequency'), key: 'frequency' },
              { label: t('prescriptions.startDate', 'Start Date'), key: 'startDate' },
              { label: t('prescriptions.status', 'Status'), key: 'status' },
              { label: t('actions.label', 'Actions'), key: 'actions' },
            ]}
          />
        </Column>
      </Row>
    </Container>
  )
}

export default Prescriptions

