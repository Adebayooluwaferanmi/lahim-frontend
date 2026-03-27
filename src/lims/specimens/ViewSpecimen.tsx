import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Container, Row, Column, Spinner, Alert } from '@lahim/components'
import { useSpecimen } from '../../hooks/useSpecimens'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'

const ViewSpecimen = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: specimen, isLoading, error } = useSpecimen(id)
  const setButtonToolBar = useButtonToolbarSetter()

  useTitle(specimen ? `${String(t('lims.specimens.view', 'View Specimen'))} - ${specimen.accessionNumber || id}` : t('lims.specimens.view', 'View Specimen'))

  useAddBreadcrumbs(
    id
      ? [
          { i18nKey: 'lims.specimens.label', location: '/lims/specimens' },
          { i18nKey: 'lims.specimens.view', location: `/lims/specimens/${id}` },
        ]
      : [],
    true
  )

  useEffect(() => {
    const buttons = [
      <Button
        key="backButton"
        outlined
        color="secondary"
        icon="left-arrow"
        iconLocation="left"
        onClick={() => navigate('/lims/specimens')}
      >
        {String(t('actions.back', 'Back'))}
      </Button>,
    ]

    // Add reception button if specimen is not yet received
    if (specimen && specimen.status !== 'received' && specimen.status !== 'processing' && specimen.status !== 'completed') {
      buttons.push(
        <Button
          key="receptionButton"
          color="primary"
          icon="check"
          iconLocation="left"
          onClick={() => navigate(`/lims/specimens/${id}/reception`)}
        >
          {String(t('lims.specimens.receive', 'Receive Specimen'))}
        </Button>
      )
    }

    // Add processing button if specimen is received
    if (specimen && (specimen.status === 'received' || specimen.status === 'processing')) {
      buttons.push(
        <Button
          key="processingButton"
          color="info"
          icon="cog"
          iconLocation="left"
          onClick={() => navigate(`/lims/specimens/${id}/processing`)}
        >
          {String(t('lims.specimens.process', 'Process Specimen'))}
        </Button>
      )
    }

    setButtonToolBar(buttons)

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t, specimen, id])

  if (isLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  if (error || !specimen) {
    return (
      <Container>
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={String(error?.message || t('lims.specimens.notFound', 'Specimen not found'))} />
      </Container>
    )
  }

  return (
    <Container>
      <Panel title={`${String(t('lims.specimens.view', 'View Specimen'))} - ${specimen.accessionNumber || id}`}>
          <Row>
            <Column md={6}>
              <h4>{String(t('lims.specimens.specimenInformation', 'Specimen Information'))}</h4>
              <table className="table">
                <tbody>
                  <tr>
                    <td><strong>{String(t('lims.specimens.accessionNumber', 'Accession Number'))}</strong></td>
                    <td>{specimen.accessionNumber || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.specimens.specimenType', 'Specimen Type'))}</strong></td>
                    <td>{specimen.specimenType || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.specimens.patientName', 'Patient Name'))}</strong></td>
                    <td>{specimen.patientName || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.specimens.patientId', 'Patient ID'))}</strong></td>
                    <td>{specimen.patientId || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.specimens.status', 'Status'))}</strong></td>
                    <td>
                      <span className={`badge badge-${specimen.status === 'completed' ? 'success' : 'warning'}`}>
                        {specimen.status || '-'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.specimens.collectionDate', 'Collection Date'))}</strong></td>
                    <td>{specimen.collectionDate ? new Date(specimen.collectionDate).toLocaleString() : '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.specimens.receivedDate', 'Received Date'))}</strong></td>
                    <td>{specimen.receivedDate ? new Date(specimen.receivedDate).toLocaleString() : '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.specimens.storageLocation', 'Storage Location'))}</strong></td>
                    <td>{specimen.storageLocation || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </Column>
            <Column md={6}>
              {specimen.chainOfCustody && specimen.chainOfCustody.length > 0 && (
                <div>
                  <h4>{String(t('lims.specimens.chainOfCustody', 'Chain of Custody'))}</h4>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{String(t('lims.specimens.timestamp', 'Timestamp'))}</th>
                        <th>{String(t('lims.specimens.action', 'Action'))}</th>
                        <th>{String(t('lims.specimens.performedBy', 'Performed By'))}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specimen.chainOfCustody.map((entry, index) => (
                        <tr key={index}>
                          <td>{new Date(entry.timestamp).toLocaleString()}</td>
                          <td>{entry.action}</td>
                          <td>{entry.performedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Column>
          </Row>
        </Panel>
    </Container>
  )
}

export default ViewSpecimen

