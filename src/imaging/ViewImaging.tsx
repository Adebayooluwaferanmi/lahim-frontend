import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column, Badge } from '@hospitalrun/components'
import { useImagingById, useUpdateImaging, useUploadImage, useImagingTypes } from '../hooks/useImaging'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'
import SelectWithLableFormGroup from '../components/input/SelectWithLableFormGroup'
import DatePickerWithLabelFormGroup from '../components/input/DatePickerWithLabelFormGroup'
import { Imaging } from '../model/Imaging'

const ViewImaging = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: imaging, isLoading, error } = useImagingById(id)
  const { mutate: updateImaging, isPending: isUpdating } = useUpdateImaging(id || '')
  const { mutate: uploadImage, isPending: isUploading } = useUploadImage()
  const { data: imagingTypes = [] } = useImagingTypes()
  const setButtonToolBar = useButtonToolbarSetter()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Imaging>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageDescription, setImageDescription] = useState('')

  useTitle(imaging ? t('imaging.view', 'View Imaging Order') : t('imaging.label', 'Imaging'))
  useAddBreadcrumbs(
    [
      { i18nKey: 'imaging.label', location: '/imaging' },
      { i18nKey: 'imaging.view', location: `/imaging/${id}` },
    ],
    true
  )

  React.useEffect(() => {
    if (imaging) {
      setFormData(imaging)
    }
  }, [imaging])

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="editButton"
        color={isEditing ? 'secondary' : 'primary'}
        icon={isEditing ? 'cancel' : 'edit'}
        iconLocation="left"
        onClick={() => {
          if (isEditing) {
            setFormData(imaging || {})
            setSubmitError(null)
          }
          setIsEditing(!isEditing)
        }}
      >
        {String(isEditing ? t('actions.cancel', 'Cancel') : t('actions.edit', 'Edit'))}
      </Button>,
      <Button
        key="backButton"
        outlined
        color="secondary"
        onClick={() => navigate('/imaging')}
      >
        {String(t('actions.back', 'Back'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t, isEditing, imaging])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.patientId || !formData.imagingType) {
      setSubmitError(t('imaging.requiredFields', 'Patient ID and Imaging Type are required'))
      return
    }

    updateImaging(
      {
        ...formData,
      } as Partial<Imaging>,
      {
        onSuccess: () => {
          setIsEditing(false)
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('imaging.updateError', 'Failed to update imaging order'))
        },
      }
    )
  }

  const handleFileUpload = async () => {
    if (!selectedFile || !id) return

    uploadImage(
      {
        imagingId: id,
        file: selectedFile,
        description: imageDescription,
      },
      {
        onSuccess: () => {
          setSelectedFile(null)
          setImageDescription('')
          alert(t('imaging.imageUploaded', 'Image uploaded successfully'))
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('imaging.uploadError', 'Failed to upload image'))
        },
      }
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success'
      case 'In Progress':
        return 'warning'
      case 'Requested':
        return 'info'
      case 'Cancelled':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  const getImageUrl = (imageId: string) => {
    const API_BASE_URL = import.meta.env.VITE_HOSPITALRUN_API || 'http://localhost:3000'
    return `${API_BASE_URL}/imaging/${id}/images/${imageId}`
  }

  if (isLoading) {
    return (
      <Container>
        <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
      </Container>
    )
  }

  if (error || !imaging) {
    return (
      <Container>
        <Alert
          color="danger"
          title={String(t('states.error', 'Error'))}
          message={String((error as any)?.message || t('imaging.notFound', 'Imaging order not found'))}
        />
      </Container>
    )
  }

  return (
    <Container>
      <Panel title={String(t('imaging.view', 'View Imaging Order'))}>
        {(submitError || (error as any)) && (
          <Alert
            color="danger"
            title={String(t('states.error', 'Error'))}
            message={String(submitError || (error as any)?.message)}
          />
        )}

        {!isEditing ? (
          <>
            <Row>
              <Column md={6}>
                <strong>{t('imaging.patientId', 'Patient ID')}:</strong> {imaging.patientId}
              </Column>
              <Column md={6}>
                <strong>{t('imaging.status', 'Status')}:</strong>{' '}
                <Badge color={getStatusBadgeColor(imaging.status)}>{imaging.status}</Badge>
              </Column>
            </Row>

            <Row>
              <Column md={6}>
                <strong>{t('imaging.imagingType', 'Imaging Type')}:</strong> {imaging.imagingTypeName || imaging.imagingType}
              </Column>
              <Column md={6}>
                <strong>{t('imaging.requestedDate', 'Requested Date')}:</strong> {formatDate(imaging.requestedDate)}
              </Column>
            </Row>

            {imaging.visitId && (
              <Row>
                <Column md={6}>
                  <strong>{t('imaging.visitId', 'Visit ID')}:</strong> {imaging.visitId}
                </Column>
              </Row>
            )}

            {imaging.imagingDate && (
              <Row>
                <Column md={6}>
                  <strong>{t('imaging.imagingDate', 'Imaging Date')}:</strong> {formatDate(imaging.imagingDate)}
                </Column>
              </Row>
            )}

            {imaging.radiologist && (
              <Row>
                <Column md={6}>
                  <strong>{t('imaging.radiologist', 'Radiologist')}:</strong> {imaging.radiologistName || imaging.radiologist}
                </Column>
              </Row>
            )}

            {imaging.notes && (
              <Row>
                <Column md={12}>
                  <strong>{t('imaging.notes', 'Notes')}:</strong>
                  <p>{imaging.notes}</p>
                </Column>
              </Row>
            )}

            {imaging.result && (
              <Row>
                <Column md={12}>
                  <strong>{t('imaging.result', 'Result')}:</strong>
                  <p>{imaging.result}</p>
                </Column>
              </Row>
            )}

            {/* Image Upload Section */}
            <Row>
              <Column md={12}>
                <h4>{t('imaging.uploadImage', 'Upload Image')}</h4>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  style={{ marginBottom: '10px' }}
                />
                <TextInputWithLabelFormGroup
                  id="imageDescription"
                  label={t('imaging.imageDescription', 'Image Description')}
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                />
                <Button
                  color="primary"
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                >
                  {String(t('imaging.upload', 'Upload'))}
                </Button>
              </Column>
            </Row>

            {/* Display Images */}
            {imaging.images && imaging.images.length > 0 && (
              <Row>
                <Column md={12}>
                  <h4>{t('imaging.images', 'Images')}</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {imaging.images.map((img) => (
                      <div key={img.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
                        <img
                          src={getImageUrl(img.id)}
                          alt={img.description || img.filename}
                          style={{ maxWidth: '200px', maxHeight: '200px', display: 'block' }}
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><text>Image not found</text></svg>'
                          }}
                        />
                        <p style={{ marginTop: '5px', fontSize: '12px' }}>{img.filename}</p>
                        {img.description && <p style={{ fontSize: '12px' }}>{img.description}</p>}
                      </div>
                    ))}
                  </div>
                </Column>
              </Row>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <Row>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  id="patientId"
                  label={t('imaging.patientId', 'Patient ID')}
                  value={formData.patientId || ''}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  required
                />
              </Column>
              <Column md={6}>
                <SelectWithLableFormGroup
                  id="status"
                  label={t('imaging.status', 'Status')}
                  value={formData.status || 'Requested'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  options={[
                    { value: 'Requested', label: t('imaging.status.requested', 'Requested') },
                    { value: 'In Progress', label: t('imaging.status.inProgress', 'In Progress') },
                    { value: 'Completed', label: t('imaging.status.completed', 'Completed') },
                    { value: 'Cancelled', label: t('imaging.status.cancelled', 'Cancelled') },
                  ]}
                />
              </Column>
            </Row>

            <Row>
              <Column md={6}>
                <SelectWithLableFormGroup
                  id="imagingType"
                  label={t('imaging.imagingType', 'Imaging Type')}
                  value={formData.imagingType || ''}
                  onChange={(e) => {
                    const selectedType = imagingTypes.find((t) => t.id === e.target.value)
                    setFormData({
                      ...formData,
                      imagingType: e.target.value,
                      imagingTypeName: selectedType?.name,
                    })
                  }}
                  options={imagingTypes.map((type) => ({
                    value: type.id,
                    label: type.name,
                  }))}
                  required
                />
              </Column>
              <Column md={6}>
                <DatePickerWithLabelFormGroup
                  id="imagingDate"
                  label={t('imaging.imagingDate', 'Imaging Date')}
                  value={formData.imagingDate ? new Date(formData.imagingDate) : undefined}
                  onChange={(date) => setFormData({ ...formData, imagingDate: date.toISOString() })}
                />
              </Column>
            </Row>

            <Row>
              <Column md={12}>
                <TextInputWithLabelFormGroup
                  id="radiologist"
                  label={t('imaging.radiologist', 'Radiologist')}
                  value={formData.radiologist || ''}
                  onChange={(e) => setFormData({ ...formData, radiologist: e.target.value })}
                />
              </Column>
            </Row>

            <Row>
              <Column md={12}>
                <TextInputWithLabelFormGroup
                  id="notes"
                  label={t('imaging.notes', 'Notes')}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  isTextArea
                  rows={4}
                />
              </Column>
            </Row>

            <Row>
              <Column md={12}>
                <TextInputWithLabelFormGroup
                  id="result"
                  label={t('imaging.result', 'Result')}
                  value={formData.result || ''}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  isTextArea
                  rows={6}
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
                    setFormData(imaging)
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

export default ViewImaging

