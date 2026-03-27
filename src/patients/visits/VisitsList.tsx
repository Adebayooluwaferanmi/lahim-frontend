import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, Table, Alert, Spinner } from '@lahim/components'
import { useVisits } from '../../hooks/useVisits'

interface Props {
  patientId: string
}

const VisitsList = ({ patientId }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: visits = [], isLoading, error } = useVisits({ patientId })

  if (isLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  if (error) {
    return (
      <Alert
        color="danger"
        title={String(t('states.error', 'Error'))}
        message={String(error.message || t('visits.loadError', 'Failed to load visits'))}
      />
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  if (visits.length === 0) {
    return (
      <div>
        <p>{String(t('visits.noVisits', 'No visits found for this patient'))}</p>
        <Button
          color="success"
          icon="add"
          onClick={() => navigate(`/visits/new?patientId=${patientId}`)}
        >
          {String(t('visits.new', 'New Visit'))}
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3">
        <Button
          color="success"
          icon="add"
          onClick={() => navigate(`/visits/new?patientId=${patientId}`)}
        >
          {String(t('visits.new', 'New Visit'))}
        </Button>
      </div>
      <Table
        data={visits.map((visit) => ({
          id: visit.id || visit._id,
          startDate: formatDate(visit.startDate),
          endDate: formatDate(visit.endDate),
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
          { label: t('visits.startDate', 'Start Date'), key: 'startDate' },
          { label: t('visits.endDate', 'End Date'), key: 'endDate' },
          { label: t('visits.visitType', 'Visit Type'), key: 'visitType' },
          { label: t('visits.status', 'Status'), key: 'status' },
          { label: t('visits.location', 'Location'), key: 'location' },
          { label: t('actions.label', 'Actions'), key: 'actions' },
        ]}
      />
    </div>
  )
}

export default VisitsList

