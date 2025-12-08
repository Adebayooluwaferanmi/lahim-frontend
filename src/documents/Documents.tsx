import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, TextInput, Spinner, Alert, Table, Badge } from '@hospitalrun/components'
import { useDocuments } from '../hooks/useDocuments'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { Document, DocumentType } from '../model/Document'

const breadcrumbs = [{ i18nKey: 'documents.label', location: '/documents' }]

const Documents = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('documents.label', 'Documents'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [patientIdFilter, setPatientIdFilter] = useState('')

  const { data: documents = [], isLoading, error } = useDocuments({
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    patientId: patientIdFilter || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="uploadDocumentButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/documents/upload')}
      >
        {String(t('documents.upload', 'Upload Document'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

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
        <Alert
          color="danger"
          title={String(t('states.error', 'Error'))}
          message={String(error.message || t('documents.loadError', 'Failed to load documents'))}
        />
      </Container>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Final':
        return 'success'
      case 'Draft':
        return 'warning'
      case 'Archived':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  return (
    <Container>
      <Row>
        <Column>
          <h2>{t('documents.label', 'Documents')}</h2>
        </Column>
      </Row>

      <Row>
        <Column md={4}>
          <TextInput
            id="patientIdFilter"
            label={t('documents.searchPatientId', 'Search by Patient ID')}
            value={patientIdFilter}
            onChange={(e) => setPatientIdFilter(e.target.value)}
          />
        </Column>
        <Column md={4}>
          <select
            id="statusFilter"
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t('documents.allStatus', 'All Status')}</option>
            <option value="Draft">{t('documents.status.draft', 'Draft')}</option>
            <option value="Final">{t('documents.status.final', 'Final')}</option>
            <option value="Archived">{t('documents.status.archived', 'Archived')}</option>
          </select>
        </Column>
        <Column md={4}>
          <select
            id="typeFilter"
            className="form-control"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">{t('documents.allTypes', 'All Types')}</option>
            <option value="Patient Document">{t('documents.type.patientDocument', 'Patient Document')}</option>
            <option value="Visit Document">{t('documents.type.visitDocument', 'Visit Document')}</option>
            <option value="Lab Result">{t('documents.type.labResult', 'Lab Result')}</option>
            <option value="Imaging Report">{t('documents.type.imagingReport', 'Imaging Report')}</option>
            <option value="Prescription">{t('documents.type.prescription', 'Prescription')}</option>
            <option value="Invoice">{t('documents.type.invoice', 'Invoice')}</option>
            <option value="Incident Report">{t('documents.type.incidentReport', 'Incident Report')}</option>
            <option value="General">{t('documents.type.general', 'General')}</option>
          </select>
        </Column>
      </Row>

      <Row>
        <Column>
          <Table
            data={documents}
            getID={(row) => row.id || row._id}
            columns={[
              {
                label: t('documents.documentNumber', 'Document #'),
                key: 'documentNumber',
              },
              {
                label: t('documents.title', 'Title'),
                key: 'title',
              },
              {
                label: t('documents.filename', 'Filename'),
                key: 'originalFilename',
              },
              {
                label: t('documents.type', 'Type'),
                key: 'type',
              },
              {
                label: t('documents.size', 'Size'),
                key: 'size',
                formatter: (row: Document) => formatFileSize(row.size),
              },
              {
                label: t('documents.uploadedDate', 'Uploaded'),
                key: 'uploadedDate',
                formatter: (row: Document) => formatDate(row.uploadedDate),
              },
              {
                label: t('documents.status', 'Status'),
                key: 'status',
                formatter: (row: Document) => (
                  <Badge color={getStatusBadgeColor(row.status)}>{row.status}</Badge>
                ),
              },
            ]}
            actionsHeaderText={t('actions.label', 'Actions')}
            actions={[
              {
                label: t('actions.view', 'View'),
                action: (row: Document) => navigate(`/documents/${row.id || row._id}`),
              },
            ]}
          />
        </Column>
      </Row>
    </Container>
  )
}

export default Documents

