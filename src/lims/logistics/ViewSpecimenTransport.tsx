import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Container,
  Row,
  Column,
  Spinner,
  Alert,
  Panel,
  Modal,
} from '@hospitalrun/components'
import {
  useSpecimenTransport,
  useSpecimenTransportStatus,
  useUpdateSpecimenTransport,
  useTrackSpecimenTransport,
} from '../../hooks/useSpecimenTransport'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import TextFieldWithLabelFormGroup from '../../components/input/TextFieldWithLabelFormGroup'
import SelectWithLableFormGroup from '../../components/input/SelectWithLableFormGroup'

const ViewSpecimenTransport = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: transport, isLoading, error } = useSpecimenTransport(id)
  const { data: status } = useSpecimenTransportStatus(id)
  const updateMutation = useUpdateSpecimenTransport()
  const trackMutation = useTrackSpecimenTransport()
  const setButtonToolBar = useButtonToolbarSetter()

  const [showTrackModal, setShowTrackModal] = useState(false)
  const [trackingData, setTrackingData] = useState({
    status: '',
    location: '',
    temperature: '',
    notes: '',
  })

  useTitle(t('lims.logistics.viewTransport', 'View Transport'))
  useAddBreadcrumbs(
    id
      ? [
          { i18nKey: 'lims.logistics.specimenTransport', location: '/lims/logistics/transport' },
          {
            i18nKey: 'lims.logistics.viewTransport',
            location: `/lims/logistics/transport/${id}`,
          },
        ]
      : [],
    true
  )

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="backButton"
        outlined
        color="secondary"
        icon="left-arrow"
        iconLocation="left"
        onClick={() => navigate('/lims/logistics/transport')}
      >
        {String(t('actions.back', 'Back'))}
      </Button>,
      <Button
        key="trackButton"
        color="info"
        icon="location"
        iconLocation="left"
        onClick={() => setShowTrackModal(true)}
      >
        {String(t('lims.logistics.track', 'Track'))}
      </Button>,
    ])
    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  const handleTrack = async () => {
    if (!id) return

    try {
      await trackMutation.mutateAsync({
        id,
        status: trackingData.status || undefined,
        location: trackingData.location || undefined,
        temperature: trackingData.temperature ? parseFloat(trackingData.temperature) : undefined,
        notes: trackingData.notes || undefined,
      })
      setShowTrackModal(false)
      setTrackingData({ status: '', location: '', temperature: '', notes: '' })
    } catch (err) {
      // Error handled by mutation
    }
  }

  if (isLoading) {
    return (
      <Container>
        <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
      </Container>
    )
  }

  if (error || !transport) {
    return (
      <Container>
        <Alert
          color="danger"
          title={String(t('states.error', 'Error'))}
          message={String(error?.message || t('lims.logistics.loadError', 'Failed to load transport'))}
        />
      </Container>
    )
  }

  const transportId = transport.id || transport._id

  return (
    <Container>
      <Row>
        <Column md={12}>
          <Panel>
            <Panel.Header
              title={String(t('lims.logistics.transportDetails', 'Transport Details'))}
            />
            <Panel.Body>
              <Row>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.trackingNumber', 'Tracking Number'))}:</strong>{' '}
                  {transport.trackingNumber || '-'}
                </Column>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.status', 'Status'))}:</strong>{' '}
                  <span className={`badge badge-${status?.status === 'delivered' ? 'success' : 'warning'}`}>
                    {status?.status || transport.status || '-'}
                  </span>
                </Column>
              </Row>
              <Row>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.transportType', 'Transport Type'))}:</strong>{' '}
                  {transport.transportType || '-'}
                </Column>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.carrier', 'Carrier'))}:</strong>{' '}
                  {transport.carrier || '-'}
                </Column>
              </Row>
              <Row>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.origin', 'Origin'))}:</strong> {transport.origin || '-'}
                </Column>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.destination', 'Destination'))}:</strong>{' '}
                  {transport.destination || '-'}
                </Column>
              </Row>
              <Row>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.scheduledAt', 'Scheduled At'))}:</strong>{' '}
                  {transport.scheduledAt
                    ? new Date(transport.scheduledAt).toLocaleString()
                    : '-'}
                </Column>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.pickedUpAt', 'Picked Up At'))}:</strong>{' '}
                  {transport.pickedUpAt ? new Date(transport.pickedUpAt).toLocaleString() : '-'}
                </Column>
              </Row>
              <Row>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.deliveredAt', 'Delivered At'))}:</strong>{' '}
                  {transport.deliveredAt
                    ? new Date(transport.deliveredAt).toLocaleString()
                    : '-'}
                </Column>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.temperature', 'Temperature'))}:</strong>{' '}
                  {status?.temperature || transport.temperature || '-'}°C
                </Column>
              </Row>
              {transport.cost && (
                <Row>
                  <Column md={6}>
                    <strong>{String(t('lims.logistics.cost', 'Cost'))}:</strong> ${transport.cost.toFixed(2)}
                  </Column>
                </Row>
              )}
              {transport.notes && (
                <Row>
                  <Column md={12}>
                    <strong>{String(t('lims.logistics.notes', 'Notes'))}:</strong>
                    <div>{transport.notes}</div>
                  </Column>
                </Row>
              )}
            </Panel.Body>
          </Panel>
        </Column>
      </Row>

      {/* Track Modal */}
      <Modal
        show={showTrackModal}
        toggle={() => setShowTrackModal(false)}
        title={String(t('lims.logistics.trackTransport', 'Track Transport'))}
        closeButton={{
          children: String(t('actions.cancel', 'Cancel')),
          color: 'secondary',
          onClick: () => setShowTrackModal(false),
        }}
        successButton={{
          children: String(t('actions.save', 'Save')),
          color: 'primary',
          onClick: handleTrack,
        }}
      >
        <Row>
          <Column md={12}>
            <SelectWithLableFormGroup
              label={String(t('lims.logistics.status', 'Status'))}
              name="status"
              value={trackingData.status}
              onChange={(e) => setTrackingData({ ...trackingData, status: e.target.value })}
              isEditable={true}
            >
              <option value="">{String(t('lims.logistics.selectStatus', 'Select Status'))}</option>
              <option value="scheduled">{String(t('lims.logistics.status.scheduled', 'Scheduled'))}</option>
              <option value="in-transit">{String(t('lims.logistics.status.inTransit', 'In Transit'))}</option>
              <option value="delivered">{String(t('lims.logistics.status.delivered', 'Delivered'))}</option>
              <option value="failed">{String(t('lims.logistics.status.failed', 'Failed'))}</option>
              <option value="cancelled">{String(t('lims.logistics.status.cancelled', 'Cancelled'))}</option>
            </SelectWithLableFormGroup>
          </Column>
        </Row>
        <Row>
          <Column md={12}>
            <TextInputWithLabelFormGroup
              label={String(t('lims.logistics.location', 'Location'))}
              name="location"
              value={trackingData.location}
              onChange={(e) => setTrackingData({ ...trackingData, location: e.target.value })}
              isEditable={true}
            />
          </Column>
        </Row>
        <Row>
          <Column md={12}>
            <TextInputWithLabelFormGroup
              label={String(t('lims.logistics.temperature', 'Temperature'))}
              name="temperature"
              type="number"
              value={trackingData.temperature}
              onChange={(e) => setTrackingData({ ...trackingData, temperature: e.target.value })}
              isEditable={true}
            />
          </Column>
        </Row>
        <Row>
          <Column md={12}>
            <TextFieldWithLabelFormGroup
              label={String(t('lims.logistics.notes', 'Notes'))}
              name="notes"
              value={trackingData.notes}
              onChange={(e) => setTrackingData({ ...trackingData, notes: e.target.value })}
              isEditable={true}
            />
          </Column>
        </Row>
      </Modal>
    </Container>
  )
}

export default ViewSpecimenTransport

