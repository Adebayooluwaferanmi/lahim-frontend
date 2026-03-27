import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column, Badge } from '@lahim/components'
import { usePharmacies, useRoutePrescriptionToPharmacy, usePrescriptionPharmacyStatus, Pharmacy } from '../hooks/usePharmacy'
import { usePrescriptions } from '../hooks/useMedications'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'
import SelectWithLableFormGroup from '../components/input/SelectWithLableFormGroup'

const ViewPharmacy = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setButtonToolBar = useButtonToolbarSetter()

  const { data: pharmacies = [], isLoading } = usePharmacies({})
  const pharmacy = pharmacies.find((p) => (p.id || p._id) === id)

  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState('')
  const [routingNotes, setRoutingNotes] = useState('')
  const { data: prescriptions = [] } = usePrescriptions({})
  const { mutate: routePrescription, isPending: isRouting } = useRoutePrescriptionToPharmacy(selectedPrescriptionId)

  useTitle(pharmacy ? `${t('pharmacy.view', 'View Pharmacy')}: ${pharmacy.name}` : t('pharmacy.view', 'View Pharmacy'))
  useAddBreadcrumbs(
    [
      { i18nKey: 'pharmacy.label', location: '/pharmacy' },
      { text: pharmacy?.name || '', location: `/pharmacy/${id}` },
    ],
    true
  )

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="editButton"
        outlined
        color="success"
        icon="edit"
        onClick={() => navigate(`/pharmacy/edit/${id}`)}
      >
        {String(t('actions.edit', 'Edit'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, id, t])

  const handleRoutePrescription = () => {
    if (!selectedPrescriptionId || !id) return

    routePrescription(
      { pharmacyId: id, notes: routingNotes },
      {
        onSuccess: () => {
          setSelectedPrescriptionId('')
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

  if (!pharmacy) {
    return (
      <Container>
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={String(t('pharmacy.notFound', 'Pharmacy not found'))} />
      </Container>
    )
  }

  return (
    <Container>
      <Panel title={String(t('pharmacy.details', 'Pharmacy Details'))}>
        <Row>
          <Column md={6}>
            <strong>{t('pharmacy.name', 'Name')}:</strong> {pharmacy.name}
          </Column>
          <Column md={6}>
            <strong>{t('pharmacy.status', 'Status')}:</strong>{' '}
            <Badge color={pharmacy.active ? 'success' : 'secondary'}>
              {pharmacy.active ? t('pharmacy.active', 'Active') : t('pharmacy.inactive', 'Inactive')}
            </Badge>
          </Column>
        </Row>
        {pharmacy.address && (
          <Row>
            <Column>
              <strong>{t('pharmacy.address', 'Address')}:</strong> {pharmacy.address}
            </Column>
          </Row>
        )}
        {pharmacy.phone && (
          <Row>
            <Column md={6}>
              <strong>{t('pharmacy.phone', 'Phone')}:</strong> {pharmacy.phone}
            </Column>
          </Row>
        )}
        {pharmacy.email && (
          <Row>
            <Column md={6}>
              <strong>{t('pharmacy.email', 'Email')}:</strong> {pharmacy.email}
            </Column>
          </Row>
        )}
        {pharmacy.contactPerson && (
          <Row>
            <Column md={6}>
              <strong>{t('pharmacy.contactPerson', 'Contact Person')}:</strong> {pharmacy.contactPerson}
            </Column>
          </Row>
        )}
      </Panel>

      <Panel title={String(t('pharmacy.routePrescription', 'Route Prescription'))} className="mt-3">
        <Row>
          <Column md={6}>
            <SelectWithLableFormGroup
              label={String(t('prescriptions.label', 'Prescription'))}
              name="prescriptionId"
              value={selectedPrescriptionId}
              onChange={(e) => setSelectedPrescriptionId(e.target.value)}
              options={[
                { label: t('pharmacy.selectPrescription', 'Select Prescription'), value: '' },
                ...prescriptions.map((p) => ({
                  label: `${p.medicationName} - ${p.patientId}`,
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
            <Button color="success" onClick={handleRoutePrescription} disabled={!selectedPrescriptionId || isRouting}>
              {String(t('pharmacy.route', 'Route to Pharmacy'))}
            </Button>
          </Column>
        </Row>
      </Panel>
    </Container>
  )
}

export default ViewPharmacy



