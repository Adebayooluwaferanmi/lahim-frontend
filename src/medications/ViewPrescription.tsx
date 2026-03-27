import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column, Badge } from '@lahim/components'
import { usePrescription } from '../hooks/useMedications'
import { usePrescriptionPharmacyStatus, useRoutePrescriptionToPharmacy } from '../hooks/usePharmacy'
import { usePharmacies } from '../hooks/usePharmacy'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import SelectWithLableFormGroup from '../components/input/SelectWithLableFormGroup'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'

const ViewPrescription = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setButtonToolBar = useButtonToolbarSetter()

  const { data: prescription, isLoading, error } = usePrescription(id)
  const { data: pharmacyStatus } = usePrescriptionPharmacyStatus(id)
  const { data: pharmacies = [] } = usePharmacies({ active: true })
  const { mutate: routePrescription, isPending: isRouting } = useRoutePrescriptionToPharmacy(id || '')

  const [selectedPharmacyId, setSelectedPharmacyId] = useState('')
  const [routingNotes, setRoutingNotes] = useState('')

  useTitle(prescription ? `${t('prescriptions.view', 'View Prescription')}: ${prescription.medicationName}` : t('prescriptions.view', 'View Prescription'))
  useAddBreadcrumbs(
    [
      { i18nKey: 'prescriptions.label', location: '/prescriptions' },
      { text: prescription?.medicationName || '', location: `/prescriptions/${id}` },
    ],
    true
  )

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="backButton"
        outlined
        color="secondary"
        onClick={() => navigate('/prescriptions')}
      >
        {String(t('actions.back', 'Back'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  const handleRouteToPharmacy = () => {
    if (!selectedPharmacyId || !id) return

    routePrescription(
      { pharmacyId: selectedPharmacyId, notes: routingNotes },
      {
        onSuccess: () => {
          setSelectedPharmacyId('')
          setRoutingNotes('')
          alert(t('pharmacy.prescriptionRouted', 'Prescription routed successfully'))
        },
      }
    )
  }

  if (isLoading) {
    return (
      <Container>
        <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
      </Container>
    )
  }

  if (error || !prescription) {
    return (
      <Container>
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={String(error?.message || t('prescriptions.notFound', 'Prescription not found'))} />
      </Container>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Container>
      <Panel title={String(t('prescriptions.details', 'Prescription Details'))}>
        <Row>
          <Column md={6}>
            <strong>{t('prescriptions.patientId', 'Patient ID')}:</strong> {prescription.patientId}
          </Column>
          <Column md={6}>
            <strong>{t('prescriptions.medicationName', 'Medication')}:</strong> {prescription.medicationName}
          </Column>
        </Row>
        <Row>
          <Column md={6}>
            <strong>{t('prescriptions.dosage', 'Dosage')}:</strong> {prescription.dosage}
          </Column>
          <Column md={6}>
            <strong>{t('prescriptions.frequency', 'Frequency')}:</strong> {prescription.frequency}
          </Column>
        </Row>
        <Row>
          <Column md={6}>
            <strong>{t('prescriptions.route', 'Route')}:</strong> {prescription.route}
          </Column>
          <Column md={6}>
            <strong>{t('prescriptions.startDate', 'Start Date')}:</strong> {formatDate(prescription.startDate)}
          </Column>
        </Row>
        <Row>
          <Column md={6}>
            <strong>{t('prescriptions.status', 'Status')}:</strong>{' '}
            <Badge color={
              prescription.status === 'active' ? 'success' :
              prescription.status === 'completed' ? 'info' :
              prescription.status === 'cancelled' ? 'danger' : 'secondary'
            }>
              {prescription.status}
            </Badge>
          </Column>
          {prescription.quantity && (
            <Column md={6}>
              <strong>{t('prescriptions.quantity', 'Quantity')}:</strong> {prescription.quantity} {prescription.quantityUnit || ''}
            </Column>
          )}
        </Row>
        {prescription.instructions && (
          <Row>
            <Column>
              <strong>{t('prescriptions.instructions', 'Instructions')}:</strong> {prescription.instructions}
            </Column>
          </Row>
        )}
      </Panel>

      {/* Pharmacy Status */}
      {pharmacyStatus?.routed && (
        <Panel title={String(t('pharmacy.status', 'Pharmacy Status'))} className="mt-3">
          <Row>
            <Column md={6}>
              <strong>{t('pharmacy.name', 'Pharmacy')}:</strong> {pharmacyStatus.pharmacy?.name || '-'}
            </Column>
            <Column md={6}>
              <strong>{t('pharmacy.status', 'Status')}:</strong>{' '}
              <Badge color={
                pharmacyStatus.routing?.status === 'picked_up' ? 'success' :
                pharmacyStatus.routing?.status === 'filled' ? 'info' :
                pharmacyStatus.routing?.status === 'received' ? 'warning' :
                'secondary'
              }>
                {pharmacyStatus.routing?.status || 'sent'}
              </Badge>
            </Column>
          </Row>
          {pharmacyStatus.routing?.sentDate && (
            <Row>
              <Column>
                <strong>{t('pharmacy.sentDate', 'Sent Date')}:</strong> {formatDate(pharmacyStatus.routing.sentDate)}
              </Column>
            </Row>
          )}
          {pharmacyStatus.routing?.notes && (
            <Row>
              <Column>
                <strong>{t('pharmacy.notes', 'Notes')}:</strong> {pharmacyStatus.routing.notes}
              </Column>
            </Row>
          )}
        </Panel>
      )}

      {/* Route to Pharmacy */}
      {!pharmacyStatus?.routed && (
        <Panel title={String(t('pharmacy.routePrescription', 'Route to Pharmacy'))} className="mt-3">
          <Row>
            <Column md={6}>
              <SelectWithLableFormGroup
                label={String(t('pharmacy.selectPharmacy', 'Select Pharmacy'))}
                name="pharmacyId"
                value={selectedPharmacyId}
                onChange={(e) => setSelectedPharmacyId(e.target.value)}
                options={[
                  { label: t('pharmacy.selectPharmacy', 'Select Pharmacy'), value: '' },
                  ...pharmacies.map((p) => ({
                    label: p.name,
                    value: p.id || p._id || '',
                  })),
                ]}
                isEditable
              />
            </Column>
          </Row>
          <Row>
            <Column md={12}>
              <TextInputWithLabelFormGroup
                label={String(t('pharmacy.notes', 'Notes'))}
                name="notes"
                type="text"
                value={routingNotes}
                onChange={(e) => setRoutingNotes(e.target.value)}
                isEditable
              />
            </Column>
          </Row>
          <Row>
            <Column>
              <Button color="success" onClick={handleRouteToPharmacy} disabled={!selectedPharmacyId || isRouting}>
                {String(t('pharmacy.route', 'Route to Pharmacy'))}
              </Button>
            </Column>
          </Row>
        </Panel>
      )}
    </Container>
  )
}

export default ViewPrescription
