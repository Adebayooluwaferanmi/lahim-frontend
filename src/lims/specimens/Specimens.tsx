import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, TextInput, Spinner, Alert } from '@lahim/components'
import { useSpecimens } from '../../hooks/useSpecimens'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'

const breadcrumbs = [{ i18nKey: 'lims.specimens.label', location: '/lims/specimens' }]

const Specimens = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.specimens.label', 'Specimens'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: specimens = [], isLoading, error } = useSpecimens({
    search: searchTerm || undefined,
    status: statusFilter || undefined,
  })

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
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={String(error.message || t('lims.specimens.loadError', 'Failed to load specimens'))} />
      </Container>
    )
  }

  return (
    <Container>
      <Row>
        <Column md={6}>
          <TextInput
            placeholder={String(t('lims.specimens.searchPlaceholder', 'Search by accession number or patient name'))}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Column>
        <Column md={6}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{String(t('lims.specimens.allStatus', 'All Status'))}</option>
            <option value="pending">{String(t('lims.specimens.status.pending', 'Pending'))}</option>
            <option value="collected">{String(t('lims.specimens.status.collected', 'Collected'))}</option>
            <option value="received">{String(t('lims.specimens.status.received', 'Received'))}</option>
            <option value="processing">{String(t('lims.specimens.status.processing', 'Processing'))}</option>
            <option value="completed">{String(t('lims.specimens.status.completed', 'Completed'))}</option>
          </select>
        </Column>
      </Row>

      <Row>
        <Column>
          {specimens.length === 0 ? (
            <div>{String(t('lims.specimens.noSpecimens', 'No specimens found'))}</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{String(t('lims.specimens.accessionNumber', 'Accession Number'))}</th>
                  <th>{String(t('lims.specimens.specimenType', 'Specimen Type'))}</th>
                  <th>{String(t('lims.specimens.patientName', 'Patient Name'))}</th>
                  <th>{String(t('lims.specimens.status', 'Status'))}</th>
                  <th>{String(t('lims.specimens.collectionDate', 'Collection Date'))}</th>
                  <th>{String(t('actions.view', 'View'))}</th>
                </tr>
              </thead>
              <tbody>
                {specimens.map((specimen) => (
                  <tr key={specimen.id || specimen._id}>
                    <td>{specimen.accessionNumber || '-'}</td>
                    <td>{specimen.specimenType || '-'}</td>
                    <td>{specimen.patientName || '-'}</td>
                    <td>
                      <span className={`badge badge-${specimen.status === 'completed' ? 'success' : 'warning'}`}>
                        {specimen.status || '-'}
                      </span>
                    </td>
                    <td>{specimen.collectionDate ? new Date(specimen.collectionDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/lims/specimens/${specimen.id || specimen._id}`)}
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

export default Specimens

