import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@lahim/components'
import { useDocumentById, useUpdateDocument, useDeleteDocument, getDocumentDownloadUrl, getDocumentViewUrl } from '../hooks/useDocuments'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'
import TextFieldWithLabelFormGroup from '../components/input/TextFieldWithLabelFormGroup'
import SelectWithLableFormGroup from '../components/input/SelectWithLableFormGroup'
import { Document, DocumentType, DocumentStatus } from '../model/Document'
import { apiClient } from '../lib/api-client'

const ViewDocument = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: document, isLoading, error } = useDocumentById(id)
  const { mutate: updateDocument, isPending: isUpdating } = useUpdateDocument(id || '')
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument()
  const setButtonToolBar = useButtonToolbarSetter()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Document>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [viewUrl, setViewUrl] = useState<string | null>(null)

  useTitle(document ? t('documents.view', 'View Document') : t('documents.label', 'Documents'))
  useAddBreadcrumbs(
    [
      { i18nKey: 'documents.label', location: '/documents' },
      { i18nKey: 'documents.view', location: `/documents/${id}` },
    ],
    true
  )

  React.useEffect(() => {
    if (document) {
      setFormData(document)
      // Generate view URL for images/PDFs
      if (document.contentType?.startsWith('image/') || document.contentType === 'application/pdf') {
        const baseUrl = apiClient.defaults.baseURL || 'http://localhost:3000'
        setViewUrl(`${baseUrl}${getDocumentViewUrl(document.id || document._id || '')}`)
      }
    }
  }, [document])

  React.useEffect(() => {
    const buttons: React.ReactNode[] = []

    if (document) {
      if (isEditing) {
        buttons.push(
          <Button
            key="saveButton"
            color="success"
            onClick={handleSave}
            disabled={isUpdating}
          >
            {String(t('actions.save', 'Save'))}
          </Button>,
          <Button
            key="cancelButton"
            outlined
            color="secondary"
            onClick={() => {
              setIsEditing(false)
              setFormData(document)
            }}
          >
            {String(t('actions.cancel', 'Cancel'))}
          </Button>
        )
      } else {
        buttons.push(
          <Button
            key="editButton"
            color="primary"
            onClick={() => setIsEditing(true)}
          >
            {String(t('actions.edit', 'Edit'))}
          </Button>
        )
        if (viewUrl) {
          buttons.push(
            <Button
              key="viewButton"
              color="info"
              onClick={() => window.open(viewUrl, '_blank')}
            >
              {String(t('documents.view', 'View'))}
            </Button>
          )
        }
        buttons.push(
          <Button
            key="downloadButton"
            color="secondary"
            onClick={() => {
              const baseUrl = apiClient.defaults.baseURL || 'http://localhost:3000'
              window.open(`${baseUrl}${getDocumentDownloadUrl(document.id || document._id || '')}`, '_blank')
            }}
          >
            {String(t('documents.download', 'Download'))}
          </Button>
        )
        buttons.push(
          <Button
            key="deleteButton"
            color="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {String(t('actions.delete', 'Delete'))}
          </Button>
        )
      }
    }

    buttons.push(
      <Button
        key="backButton"
        outlined
        color="secondary"
        onClick={() => navigate('/documents')}
      >
        {String(t('actions.back', 'Back'))}
      </Button>
    )

    setButtonToolBar(buttons)

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t, isEditing, document, isUpdating, isDeleting, viewUrl])

  const handleSave = async () => {
    setSubmitError(null)
    if (!id) return

    updateDocument(
      {
        ...formData,
      } as Partial<Document>,
      {
        onSuccess: () => {
          setIsEditing(false)
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('documents.updateError', 'Failed to update document'))
        },
      }
    )
  }

  const handleDelete = () => {
    if (!id || !document) return

    if (window.confirm(t('documents.confirmDelete', 'Are you sure you want to delete this document?'))) {
      deleteDocument(
        { id },
        {
          onSuccess: () => {
            navigate('/documents')
          },
          onError: (err: any) => {
            setSubmitError(err.message || t('documents.deleteError', 'Failed to delete document'))
          },
        }
      )
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  if (isLoading) {
    return (
      <Container>
        <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
      </Container>
    )
  }

  if (error || !document) {
    return (
      <Container>
        <Alert
          color="danger"
          title={String(t('states.error', 'Error'))}
          message={String((error as any)?.message || t('documents.notFound', 'Document not found'))}
        />
      </Container>
    )
  }

  const isImage = document.contentType?.startsWith('image/')
  const isPDF = document.contentType === 'application/pdf'

  return (
    <Container>
      {submitError && (
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={submitError} />
      )}

      <Panel title={String(t('documents.view', 'View Document'))}>
        {!isEditing ? (
          <>
            <Row>
              <Column md={6}>
                <strong>{t('documents.documentNumber', 'Document Number')}:</strong> {document.documentNumber || '-'}
              </Column>
              <Column md={6}>
                <strong>{t('documents.status', 'Status')}:</strong> {document.status}
              </Column>
            </Row>

            <Row>
              <Column md={6}>
                <strong>{t('documents.title', 'Title')}:</strong> {document.title}
              </Column>
              <Column md={6}>
                <strong>{t('documents.type', 'Type')}:</strong> {document.type}
              </Column>
            </Row>

            <Row>
              <Column md={6}>
                <strong>{t('documents.filename', 'Filename')}:</strong> {document.originalFilename || document.filename}
              </Column>
              <Column md={6}>
                <strong>{t('documents.size', 'Size')}:</strong> {formatFileSize(document.size)}
              </Column>
            </Row>

            {document.description && (
              <Row>
                <Column md={12}>
                  <strong>{t('documents.description', 'Description')}:</strong>
                  <p>{document.description}</p>
                </Column>
              </Row>
            )}

            <Row>
              <Column md={6}>
                <strong>{t('documents.uploadedDate', 'Uploaded Date')}:</strong> {formatDate(document.uploadedDate)}
              </Column>
              <Column md={6}>
                <strong>{t('documents.uploadedBy', 'Uploaded By')}:</strong> {document.uploadedByName || document.uploadedBy}
              </Column>
            </Row>

            {document.patientId && (
              <Row>
                <Column md={6}>
                  <strong>{t('documents.patientId', 'Patient ID')}:</strong> {document.patientId}
                </Column>
              </Row>
            )}

            {document.visitId && (
              <Row>
                <Column md={6}>
                  <strong>{t('documents.visitId', 'Visit ID')}:</strong> {document.visitId}
                </Column>
              </Row>
            )}

            {/* Display image or PDF preview */}
            {(isImage || isPDF) && viewUrl && (
              <Row>
                <Column>
                  <Panel title={String(t('documents.preview', 'Preview'))}>
                    {isImage ? (
                      <img
                        src={viewUrl}
                        alt={document.title}
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    ) : (
                      <iframe
                        src={viewUrl}
                        style={{ width: '100%', height: '600px', border: '1px solid #ddd' }}
                        title={document.title}
                      />
                    )}
                  </Panel>
                </Column>
              </Row>
            )}
          </>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <Row>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  name="title"
                  label={t('documents.title', 'Title')}
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  isRequired
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
                />
              </Column>
            </Row>

            <Row>
              <Column md={6}>
                <SelectWithLableFormGroup
                  name="status"
                  label={t('documents.status', 'Status')}
                  value={formData.status || 'Final'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as DocumentStatus })}
                  options={[
                    { value: 'Draft', label: t('documents.status.draft', 'Draft') },
                    { value: 'Final', label: t('documents.status.final', 'Final') },
                    { value: 'Archived', label: t('documents.status.archived', 'Archived') },
                  ]}
                />
              </Column>
            </Row>

            <Row>
              <Column md={12}>
                <TextFieldWithLabelFormGroup
                  name="description"
                  label={t('documents.description', 'Description')}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </Column>
            </Row>

            <Row>
              <Column>
                <Button type="submit" color="success" disabled={isUpdating}>
                  {String(t('actions.save', 'Save'))}
                </Button>
                <Button
                  type="button"
                  outlined
                  color="secondary"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData(document)
                    setSubmitError(null)
                  }}
                  style={{ marginLeft: '10px' }}
                >
                  {String(t('actions.cancel', 'Cancel'))}
                </Button>
              </Column>
            </Row>
          </form>
        )}
      </Panel>
    </Container>
  )
}

export default ViewDocument

