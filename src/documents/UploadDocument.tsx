import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@lahim/components'
import { useUploadDocument } from '../hooks/useDocuments'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'
import TextFieldWithLabelFormGroup from '../components/input/TextFieldWithLabelFormGroup'
import SelectWithLableFormGroup from '../components/input/SelectWithLableFormGroup'
import { Document, DocumentType } from '../model/Document'

const breadcrumbs = [{ i18nKey: 'documents.upload', location: '/documents/upload' }]

const UploadDocument = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('documents.upload', 'Upload Document'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()
  const { mutate: uploadDocument, isPending: isLoading, error } = useUploadDocument()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get patientId and visitId from URL query params if present
  const searchParams = new URLSearchParams(window.location.search)
  const patientIdFromUrl = searchParams.get('patientId') || ''
  const visitIdFromUrl = searchParams.get('visitId') || ''

  const [formData, setFormData] = useState<Partial<Document>>({
    type: 'General',
    status: 'Final',
    patientId: patientIdFromUrl || undefined,
    visitId: visitIdFromUrl || undefined,
    uploadedBy: 'system', // TODO: Get from auth context
    isPublic: false,
    accessLevel: 'Restricted',
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Auto-fill title if not set
      if (!formData.title) {
        setFormData({ ...formData, title: file.name })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!selectedFile) {
      setSubmitError(t('documents.fileRequired', 'Please select a file to upload'))
      return
    }

    if (!formData.title) {
      setSubmitError(t('documents.titleRequired', 'Title is required'))
      return
    }

    // Read file as base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64data = reader.result as string
      const base64Content = base64data.split(',')[1] // Remove data:type;base64, prefix

      uploadDocument(
        {
          ...formData,
          filename: selectedFile.name,
          originalFilename: selectedFile.name,
          contentType: selectedFile.type || 'application/octet-stream',
          size: selectedFile.size,
          data: base64Content,
        } as Document,
        {
          onSuccess: (data) => {
            navigate(`/documents/${data.id || data._id}`)
          },
          onError: (err: any) => {
            setSubmitError(err.message || t('documents.uploadError', 'Failed to upload document'))
          },
        }
      )
    }
    reader.onerror = () => {
      setSubmitError(t('documents.readError', 'Failed to read file'))
    }
    reader.readAsDataURL(selectedFile)
  }

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="cancelButton"
        outlined
        color="secondary"
        onClick={() => navigate('/documents')}
      >
        {String(t('actions.cancel', 'Cancel'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  if (isLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  return (
    <Container>
      <Panel title={String(t('documents.upload', 'Upload Document'))}>
        {(submitError || error) && (
          <Alert
            color="danger"
            title={String(t('states.error', 'Error'))}
            message={String(submitError || (error as any)?.message || t('documents.uploadError', 'Failed to upload document'))}
          />
        )}

        <form onSubmit={handleSubmit}>
          <Row>
            <Column md={6}>
              <div className="form-group">
                <label>{t('documents.selectFile', 'Select File')}</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                  required
                />
                {selectedFile && (
                  <small className="form-text text-muted">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </small>
                )}
              </div>
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                id="title"
                label={t('documents.title', 'Title')}
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                isEditable
              />
            </Column>
            <Column md={6}>
              <SelectWithLableFormGroup
                name="type"
                label={t('documents.type', 'Type')}
                value={formData.type || 'General'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as DocumentType })}
                options={[
                  { value: 'Patient Document', label: t('documents.type.patientDocument', 'Patient Document') },
                  { value: 'Visit Document', label: t('documents.type.visitDocument', 'Visit Document') },
                  { value: 'Lab Result', label: t('documents.type.labResult', 'Lab Result') },
                  { value: 'Imaging Report', label: t('documents.type.imagingReport', 'Imaging Report') },
                  { value: 'Prescription', label: t('documents.type.prescription', 'Prescription') },
                  { value: 'Invoice', label: t('documents.type.invoice', 'Invoice') },
                  { value: 'Incident Report', label: t('documents.type.incidentReport', 'Incident Report') },
                  { value: 'General', label: t('documents.type.general', 'General') },
                ]}
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                name="patientId"
                label={t('documents.patientId', 'Patient ID (Optional)')}
                value={formData.patientId || ''}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value || undefined })}
                isEditable
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                name="visitId"
                label={t('documents.visitId', 'Visit ID (Optional)')}
                value={formData.visitId || ''}
                onChange={(e) => setFormData({ ...formData, visitId: e.target.value || undefined })}
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column md={12}>
              <TextFieldWithLabelFormGroup
                name="description"
                label={t('documents.description', 'Description (Optional)')}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <Button type="submit" color="success" disabled={isLoading || !selectedFile}>
                {String(t('documents.upload', 'Upload'))}
              </Button>
              <Button
                type="button"
                outlined
                color="secondary"
                onClick={() => navigate('/documents')}
                style={{ marginLeft: '10px' }}
              >
                {String(t('actions.cancel', 'Cancel'))}
              </Button>
            </Column>
          </Row>
        </form>
      </Panel>
    </Container>
  )
}

export default UploadDocument

