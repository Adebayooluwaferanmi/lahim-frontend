import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Container, Row, Column, Spinner, Alert } from '@hospitalrun/components'
import { useSpecimen } from '../../hooks/useSpecimens'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api-client'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import TextFieldWithLabelFormGroup from '../../components/input/TextFieldWithLabelFormGroup'

const SpecimenProcessing = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: specimen, isLoading, error } = useSpecimen(id)
  const setButtonToolBar = useButtonToolbarSetter()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    centrifuged: false,
    centrifugedBy: '',
    centrifugationTime: '',
    centrifugationSpeed: '',
    preAnalyticalQC: {
      hemolysis: false,
      lipemia: false,
      icterus: false,
      notes: '',
    },
    processedBy: '',
    status: 'processing' as 'processing' | 'processed',
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  useTitle(t('lims.specimens.processing', 'Specimen Processing'))

  useAddBreadcrumbs(
    id
      ? [
          { i18nKey: 'lims.specimens.label', location: '/lims/specimens' },
          { i18nKey: 'lims.specimens.view', location: `/lims/specimens/${id}` },
          { i18nKey: 'lims.specimens.processing', location: `/lims/specimens/${id}/processing` },
        ]
      : [],
    true
  )

  const processMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiClient.post(`/specimens/${id}/process`, {
        centrifuged: data.centrifuged,
        centrifugedBy: data.centrifugedBy,
        centrifugationTime: data.centrifugationTime,
        centrifugationSpeed: data.centrifugationSpeed,
        preAnalyticalQC: data.preAnalyticalQC,
        processedBy: data.processedBy,
        status: data.status,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specimens', id] })
      queryClient.invalidateQueries({ queryKey: ['specimens'] })
      navigate(`/lims/specimens/${id}`)
    },
    onError: (err: Error) => {
      setSubmitError(err.message || t('lims.specimens.processingError', 'Failed to process specimen'))
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

  const handlePreAnalyticalQCChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      preAnalyticalQC: { ...prev.preAnalyticalQC, [field]: value },
    }))
    setSubmitError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (formData.centrifuged && !formData.centrifugedBy) {
      setSubmitError(t('lims.specimens.centrifugedByRequired', 'Centrifuged by is required if specimen is centrifuged'))
      return
    }

    if (formData.status === 'processed' && !formData.processedBy) {
      setSubmitError(t('lims.specimens.processedByRequired', 'Processed by is required'))
      return
    }

    processMutation.mutate(formData)
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

  if (specimen.status !== 'received' && specimen.status !== 'processing') {
    return (
      <Container>
        <Alert
          color="warning"
          title={String(t('lims.specimens.invalidStatus', 'Invalid Status'))}
          message={String(t('lims.specimens.processingStatusMessage', 'Specimen must be in received or processing status to process.'))}
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
      <Panel title={String(t('lims.specimens.processing', 'Specimen Processing'))}>
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
                  <tr>
                    <td><strong>{String(t('lims.specimens.status', 'Status'))}</strong></td>
                    <td>
                      <span className={`badge badge-${specimen.status === 'completed' ? 'success' : 'warning'}`}>
                        {specimen.status || '-'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Column>
            <Column md={6}>
              <h4>{String(t('lims.specimens.processingDetails', 'Processing Details'))}</h4>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.centrifuged}
                    onChange={(e) => handleFieldChange('centrifuged', e.target.checked)}
                  />
                  {' '}
                  {String(t('lims.specimens.centrifuged', 'Specimen Centrifuged'))}
                </label>
              </div>

              {formData.centrifuged && (
                <>
                  <TextInputWithLabelFormGroup
                    name="centrifugedBy"
                    label={String(t('lims.specimens.centrifugedBy', 'Centrifuged By'))}
                    isRequired
                    value={formData.centrifugedBy}
                    onChange={(e) => handleFieldChange('centrifugedBy', e.target.value)}
                    isEditable
                  />

                  <TextInputWithLabelFormGroup
                    name="centrifugationTime"
                    label={String(t('lims.specimens.centrifugationTime', 'Centrifugation Time (minutes)'))}
                    value={formData.centrifugationTime}
                    onChange={(e) => handleFieldChange('centrifugationTime', e.target.value)}
                    isEditable
                    type="number"
                  />

                  <TextInputWithLabelFormGroup
                    name="centrifugationSpeed"
                    label={String(t('lims.specimens.centrifugationSpeed', 'Centrifugation Speed (RPM)'))}
                    value={formData.centrifugationSpeed}
                    onChange={(e) => handleFieldChange('centrifugationSpeed', e.target.value)}
                    isEditable
                    type="number"
                  />
                </>
              )}

              <h5>{String(t('lims.specimens.preAnalyticalQC', 'Pre-Analytical Quality Control'))}</h5>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.preAnalyticalQC.hemolysis}
                    onChange={(e) => handlePreAnalyticalQCChange('hemolysis', e.target.checked)}
                  />
                  {' '}
                  {String(t('lims.specimens.hemolysis', 'Hemolysis Detected'))}
                </label>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.preAnalyticalQC.lipemia}
                    onChange={(e) => handlePreAnalyticalQCChange('lipemia', e.target.checked)}
                  />
                  {' '}
                  {String(t('lims.specimens.lipemia', 'Lipemia Detected'))}
                </label>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.preAnalyticalQC.icterus}
                    onChange={(e) => handlePreAnalyticalQCChange('icterus', e.target.checked)}
                  />
                  {' '}
                  {String(t('lims.specimens.icterus', 'Icterus Detected'))}
                </label>
              </div>

              <TextFieldWithLabelFormGroup
                name="preAnalyticalQCNotes"
                label={String(t('lims.specimens.preAnalyticalQCNotes', 'Pre-Analytical QC Notes'))}
                value={formData.preAnalyticalQC.notes}
                onChange={(e) => handlePreAnalyticalQCChange('notes', e.target.value)}
                isEditable
                rows={2}
              />

              <TextInputWithLabelFormGroup
                name="processedBy"
                label={String(t('lims.specimens.processedBy', 'Processed By'))}
                value={formData.processedBy}
                onChange={(e) => handleFieldChange('processedBy', e.target.value)}
                isEditable
              />

              <div className="form-group">
                <label>{String(t('lims.specimens.processingStatus', 'Processing Status'))}</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                >
                  <option value="processing">{String(t('lims.specimens.status.processing', 'Processing'))}</option>
                  <option value="processed">{String(t('lims.specimens.status.processed', 'Processed'))}</option>
                </select>
              </div>
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
                  disabled={processMutation.isPending}
                >
                  {String(t('lims.specimens.saveProcessing', 'Save Processing'))}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Panel>
    </Container>
  )
}

export default SpecimenProcessing

