import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Container, Row, Column, Spinner, Alert, Modal } from '@lahim/components'
import { useSpecimen } from '../../hooks/useSpecimens'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api-client'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import TextFieldWithLabelFormGroup from '../../components/input/TextFieldWithLabelFormGroup'

const SpecimenReception = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: specimen, isLoading, error } = useSpecimen(id)
  const setButtonToolBar = useButtonToolbarSetter()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    integrityCheck: true,
    labelingCheck: true,
    receptionNotes: '',
    storageLocation: '',
    storageTemperature: 'room',
    receivedBy: '',
  })

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  useTitle(t('lims.specimens.reception', 'Specimen Reception'))

  useAddBreadcrumbs(
    id
      ? [
          { i18nKey: 'lims.specimens.label', location: '/lims/specimens' },
          { i18nKey: 'lims.specimens.view', location: `/lims/specimens/${id}` },
          { i18nKey: 'lims.specimens.reception', location: `/lims/specimens/${id}/reception` },
        ]
      : [],
    true
  )

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiClient.post(`/specimens/${id}/register`, {
        integrityCheck: data.integrityCheck,
        labelingCheck: data.labelingCheck,
        receptionNotes: data.receptionNotes,
        storageLocation: data.storageLocation,
        storageTemperature: data.storageTemperature,
        receivedBy: data.receivedBy,
        status: 'received',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specimens', id] })
      queryClient.invalidateQueries({ queryKey: ['specimens'] })
      navigate(`/lims/specimens/${id}`)
    },
    onError: (err: Error) => {
      setSubmitError(err.message || t('lims.specimens.receptionError', 'Failed to register specimen'))
    },
  })

  useEffect(() => {
    setButtonToolBar([
      <Button
        key="backButton"
        outlined
        color="secondary"
        icon="left-arrow"
        iconLocation="left"
        onClick={() => navigate(`/lims/specimens/${id}`)}
      >
        {String(t('actions.back', 'Back'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t, id])

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSubmitError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.receivedBy) {
      setSubmitError(t('lims.specimens.receivedByRequired', 'Received by is required'))
      return
    }

    if (!formData.integrityCheck || !formData.labelingCheck) {
      setShowConfirmModal(true)
      return
    }

    registerMutation.mutate(formData)
  }

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false)
    registerMutation.mutate(formData)
  }

  if (isLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  if (error || !specimen) {
    return (
      <Container>
        <Alert
          color="danger"
          title={String(t('states.error', 'Error'))}
          message={String(error?.message || t('lims.specimens.notFound', 'Specimen not found'))}
        />
      </Container>
    )
  }

  if (specimen.status === 'received' || specimen.status === 'processing' || specimen.status === 'completed') {
    return (
      <Container>
        <Alert
          color="warning"
          title={String(t('lims.specimens.alreadyReceived', 'Already Received'))}
          message={String(t('lims.specimens.alreadyReceivedMessage', 'This specimen has already been received.'))}
        />
        <Button
          outlined
          color="secondary"
          onClick={() => navigate(`/lims/specimens/${id}`)}
        >
          {String(t('actions.back', 'Back'))}
        </Button>
      </Container>
    )
  }

  return (
    <Container>
      <Panel title={String(t('lims.specimens.reception', 'Specimen Reception'))}>
        <form onSubmit={handleSubmit}>
          {submitError && (
            <Alert
              color="danger"
              title={String(t('states.error', 'Error'))}
              message={String(submitError)}
            />
          )}

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
                </tbody>
              </table>
            </Column>
            <Column md={6}>
              <h4>{String(t('lims.specimens.receptionChecks', 'Reception Checks'))}</h4>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.integrityCheck}
                    onChange={(e) => handleFieldChange('integrityCheck', e.target.checked)}
                  />
                  {' '}
                  {String(t('lims.specimens.integrityCheck', 'Specimen Integrity Check Passed'))}
                </label>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.labelingCheck}
                    onChange={(e) => handleFieldChange('labelingCheck', e.target.checked)}
                  />
                  {' '}
                  {String(t('lims.specimens.labelingCheck', 'Labeling Check Passed'))}
                </label>
              </div>

              <TextInputWithLabelFormGroup
                name="receivedBy"
                label={String(t('lims.specimens.receivedBy', 'Received By'))}
                isRequired
                value={formData.receivedBy}
                onChange={(e) => handleFieldChange('receivedBy', e.target.value)}
                isEditable
              />

              <TextInputWithLabelFormGroup
                name="storageLocation"
                label={String(t('lims.specimens.storageLocation', 'Storage Location'))}
                value={formData.storageLocation}
                onChange={(e) => handleFieldChange('storageLocation', e.target.value)}
                isEditable
                placeholder={String(t('lims.specimens.storageLocationPlaceholder', 'e.g., Refrigerator A1'))}
              />

              <div className="form-group">
                <label>{String(t('lims.specimens.storageTemperature', 'Storage Temperature'))}</label>
                <select
                  className="form-control"
                  value={formData.storageTemperature}
                  onChange={(e) => handleFieldChange('storageTemperature', e.target.value)}
                >
                  <option value="room">{String(t('lims.specimens.temperature.room', 'Room Temperature'))}</option>
                  <option value="refrigerated">{String(t('lims.specimens.temperature.refrigerated', 'Refrigerated (2-8°C)'))}</option>
                  <option value="frozen">{String(t('lims.specimens.temperature.frozen', 'Frozen (-20°C)'))}</option>
                  <option value="deepFrozen">{String(t('lims.specimens.temperature.deepFrozen', 'Deep Frozen (-80°C)'))}</option>
                </select>
              </div>

              <TextFieldWithLabelFormGroup
                name="receptionNotes"
                label={String(t('lims.specimens.receptionNotes', 'Reception Notes'))}
                value={formData.receptionNotes}
                onChange={(e) => handleFieldChange('receptionNotes', e.target.value)}
                isEditable
                rows={3}
              />
            </Column>
          </Row>

          <div className="row">
            <div className="col-md-12">
              <div className="btn-group float-right">
                <Button
                  outlined
                  color="secondary"
                  onClick={() => navigate(`/lims/specimens/${id}`)}
                >
                  {String(t('actions.cancel', 'Cancel'))}
                </Button>
                <Button
                  color="success"
                  icon="save"
                  iconLocation="left"
                  type="submit"
                  disabled={registerMutation.isPending}
                >
                  {String(t('lims.specimens.register', 'Register Specimen'))}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Panel>

      <Modal
        show={showConfirmModal}
        toggle={() => setShowConfirmModal(false)}
        title={String(t('lims.specimens.confirmReception', 'Confirm Reception'))}
        body={
          <div>
            <p>{String(t('lims.specimens.confirmReceptionMessage', 'One or more checks failed. Do you want to proceed with registration?'))}</p>
          </div>
        }
        closeButton={{
          children: String(t('actions.cancel', 'Cancel')),
          color: 'danger',
          onClick: () => setShowConfirmModal(false),
        }}
        successButton={{
          children: String(t('actions.confirm', 'Confirm')),
          color: 'warning',
          onClick: handleConfirmSubmit,
        }}
      />
    </Container>
  )
}

export default SpecimenReception

