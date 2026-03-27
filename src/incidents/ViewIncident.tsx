import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column, Badge } from '@lahim/components'
import { 
  useIncidentById, 
  useUpdateIncident, 
  useStartInvestigation, 
  useResolveIncident 
} from '../hooks/useIncidents'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'
import SelectWithLableFormGroup from '../components/input/SelectWithLableFormGroup'
import DatePickerWithLabelFormGroup from '../components/input/DatePickerWithLabelFormGroup'
import { Incident, IncidentStatus, IncidentSeverity, IncidentCategory } from '../model/Incident'

const ViewIncident = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: incident, isLoading, error } = useIncidentById(id)
  const { mutate: updateIncident, isPending: isUpdating } = useUpdateIncident(id || '')
  const { mutate: startInvestigation, isPending: isStartingInvestigation } = useStartInvestigation(id || '')
  const { mutate: resolveIncident, isPending: isResolving } = useResolveIncident(id || '')
  const setButtonToolBar = useButtonToolbarSetter()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Incident>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showInvestigationForm, setShowInvestigationForm] = useState(false)
  const [showResolutionForm, setShowResolutionForm] = useState(false)
  const [investigationData, setInvestigationData] = useState({ investigatedBy: '', investigationNotes: '' })
  const [resolutionData, setResolutionData] = useState({ 
    resolvedBy: '', 
    resolution: '', 
    correctiveActions: '', 
    preventiveActions: '' 
  })

  useTitle(incident ? t('incidents.view', 'View Incident') : t('incidents.label', 'Incidents'))
  useAddBreadcrumbs(
    [
      { i18nKey: 'incidents.label', location: '/incidents' },
      { i18nKey: 'incidents.view', location: `/incidents/${id}` },
    ],
    true
  )

  React.useEffect(() => {
    if (incident) {
      setFormData(incident)
    }
  }, [incident])

  React.useEffect(() => {
    const buttons: React.ReactNode[] = [
      <Button
        key="editButton"
        color={isEditing ? 'secondary' : 'primary'}
        icon={isEditing ? 'cancel' : 'edit'}
        iconLocation="left"
        onClick={() => {
          if (isEditing) {
            setFormData(incident || {})
            setSubmitError(null)
          }
          setIsEditing(!isEditing)
        }}
      >
        {String(isEditing ? t('actions.cancel', 'Cancel') : t('actions.edit', 'Edit'))}
      </Button>,
    ]

    if (incident && incident.status === 'Reported') {
      buttons.push(
        <Button
          key="startInvestigationButton"
          color="warning"
          onClick={() => setShowInvestigationForm(true)}
        >
          {String(t('incidents.startInvestigation', 'Start Investigation'))}
        </Button>
      )
    }

    if (incident && (incident.status === 'Reported' || incident.status === 'Under Investigation')) {
      buttons.push(
        <Button
          key="resolveButton"
          color="success"
          onClick={() => setShowResolutionForm(true)}
        >
          {String(t('incidents.resolve', 'Resolve'))}
        </Button>
      )
    }

    buttons.push(
      <Button
        key="backButton"
        outlined
        color="secondary"
        onClick={() => navigate('/incidents')}
      >
        {String(t('actions.back', 'Back'))}
      </Button>
    )

    setButtonToolBar(buttons)

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t, isEditing, incident])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.description || !formData.severity || !formData.category) {
      setSubmitError(t('incidents.requiredFields', 'Description, severity, and category are required'))
      return
    }

    updateIncident(
      {
        ...formData,
      } as Partial<Incident>,
      {
        onSuccess: () => {
          setIsEditing(false)
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('incidents.updateError', 'Failed to update incident'))
        },
      }
    )
  }

  const handleStartInvestigation = () => {
    startInvestigation(
      investigationData,
      {
        onSuccess: () => {
          setShowInvestigationForm(false)
          setInvestigationData({ investigatedBy: '', investigationNotes: '' })
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('incidents.investigationError', 'Failed to start investigation'))
        },
      }
    )
  }

  const handleResolve = () => {
    resolveIncident(
      {
        ...resolutionData,
        correctiveActions: resolutionData.correctiveActions ? resolutionData.correctiveActions.split('\n').filter(a => a.trim()) : [],
        preventiveActions: resolutionData.preventiveActions ? resolutionData.preventiveActions.split('\n').filter(a => a.trim()) : [],
      },
      {
        onSuccess: () => {
          setShowResolutionForm(false)
          setResolutionData({ resolvedBy: '', resolution: '', correctiveActions: '', preventiveActions: '' })
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('incidents.resolveError', 'Failed to resolve incident'))
        },
      }
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadgeColor = (status: IncidentStatus) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return 'success'
      case 'Under Investigation':
        return 'warning'
      case 'Reported':
        return 'info'
      case 'Cancelled':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  const getSeverityBadgeColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'danger'
      case 'High':
        return 'warning'
      case 'Medium':
        return 'info'
      case 'Low':
        return 'success'
      default:
        return 'secondary'
    }
  }

  if (isLoading) {
    return (
      <Container>
        <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
      </Container>
    )
  }

  if (error || !incident) {
    return (
      <Container>
        <Alert
          color="danger"
          title={String(t('states.error', 'Error'))}
          message={String((error as any)?.message || t('incidents.notFound', 'Incident not found'))}
        />
      </Container>
    )
  }

  return (
    <Container>
      <Panel title={String(t('incidents.view', 'View Incident'))}>
        {(submitError || (error as any)) && (
          <Alert
            color="danger"
            title={String(t('states.error', 'Error'))}
            message={String(submitError || (error as any)?.message)}
          />
        )}

        {/* Investigation Form Modal */}
        {showInvestigationForm && (
          <Panel title={String(t('incidents.startInvestigation', 'Start Investigation'))}>
            <TextInputWithLabelFormGroup
              id="investigatedBy"
              label={t('incidents.investigatedBy', 'Investigated By')}
              value={investigationData.investigatedBy}
              onChange={(e) => setInvestigationData({ ...investigationData, investigatedBy: e.target.value })}
            />
            <TextInputWithLabelFormGroup
              id="investigationNotes"
              label={t('incidents.investigationNotes', 'Investigation Notes')}
              value={investigationData.investigationNotes}
              onChange={(e) => setInvestigationData({ ...investigationData, investigationNotes: e.target.value })}
              isTextArea
              rows={4}
            />
            <Row>
              <Column>
                <Button color="primary" onClick={handleStartInvestigation} disabled={isStartingInvestigation}>
                  {String(t('actions.save', 'Save'))}
                </Button>
                <Button
                  outlined
                  color="secondary"
                  onClick={() => setShowInvestigationForm(false)}
                  style={{ marginLeft: '10px' }}
                >
                  {String(t('actions.cancel', 'Cancel'))}
                </Button>
              </Column>
            </Row>
          </Panel>
        )}

        {/* Resolution Form Modal */}
        {showResolutionForm && (
          <Panel title={String(t('incidents.resolve', 'Resolve Incident'))}>
            <TextInputWithLabelFormGroup
              id="resolvedBy"
              label={t('incidents.resolvedBy', 'Resolved By')}
              value={resolutionData.resolvedBy}
              onChange={(e) => setResolutionData({ ...resolutionData, resolvedBy: e.target.value })}
            />
            <TextInputWithLabelFormGroup
              id="resolution"
              label={t('incidents.resolution', 'Resolution')}
              value={resolutionData.resolution}
              onChange={(e) => setResolutionData({ ...resolutionData, resolution: e.target.value })}
              isTextArea
              rows={4}
            />
            <TextInputWithLabelFormGroup
              id="correctiveActions"
              label={t('incidents.correctiveActions', 'Corrective Actions (one per line)')}
              value={resolutionData.correctiveActions}
              onChange={(e) => setResolutionData({ ...resolutionData, correctiveActions: e.target.value })}
              isTextArea
              rows={3}
            />
            <TextInputWithLabelFormGroup
              id="preventiveActions"
              label={t('incidents.preventiveActions', 'Preventive Actions (one per line)')}
              value={resolutionData.preventiveActions}
              onChange={(e) => setResolutionData({ ...resolutionData, preventiveActions: e.target.value })}
              isTextArea
              rows={3}
            />
            <Row>
              <Column>
                <Button color="success" onClick={handleResolve} disabled={isResolving}>
                  {String(t('actions.save', 'Save'))}
                </Button>
                <Button
                  outlined
                  color="secondary"
                  onClick={() => setShowResolutionForm(false)}
                  style={{ marginLeft: '10px' }}
                >
                  {String(t('actions.cancel', 'Cancel'))}
                </Button>
              </Column>
            </Row>
          </Panel>
        )}

        {!isEditing ? (
          <>
            <Row>
              <Column md={6}>
                <strong>{t('incidents.incidentNumber', 'Incident Number')}:</strong> {incident.incidentNumber || '-'}
              </Column>
              <Column md={6}>
                <strong>{t('incidents.status', 'Status')}:</strong>{' '}
                <Badge color={getStatusBadgeColor(incident.status)}>{incident.status}</Badge>
              </Column>
            </Row>

            <Row>
              <Column md={6}>
                <strong>{t('incidents.category', 'Category')}:</strong> {incident.category}
              </Column>
              <Column md={6}>
                <strong>{t('incidents.severity', 'Severity')}:</strong>{' '}
                <Badge color={getSeverityBadgeColor(incident.severity)}>{incident.severity}</Badge>
              </Column>
            </Row>

            <Row>
              <Column md={6}>
                <strong>{t('incidents.reportedDate', 'Reported Date')}:</strong> {formatDate(incident.reportedDate)}
              </Column>
              <Column md={6}>
                <strong>{t('incidents.reportedBy', 'Reported By')}:</strong> {incident.reportedByName || incident.reportedBy}
              </Column>
            </Row>

            {incident.patientId && (
              <Row>
                <Column md={6}>
                  <strong>{t('incidents.patientId', 'Patient ID')}:</strong> {incident.patientId}
                </Column>
              </Row>
            )}

            {incident.visitId && (
              <Row>
                <Column md={6}>
                  <strong>{t('incidents.visitId', 'Visit ID')}:</strong> {incident.visitId}
                </Column>
              </Row>
            )}

            {incident.location && (
              <Row>
                <Column md={6}>
                  <strong>{t('incidents.location', 'Location')}:</strong> {incident.location}
                </Column>
              </Row>
            )}

            {incident.department && (
              <Row>
                <Column md={6}>
                  <strong>{t('incidents.department', 'Department')}:</strong> {incident.department}
                </Column>
              </Row>
            )}

            <Row>
              <Column md={12}>
                <strong>{t('incidents.description', 'Description')}:</strong>
                <p>{incident.description}</p>
              </Column>
            </Row>

            {incident.investigationStartedDate && (
              <Row>
                <Column>
                  <Panel title={String(t('incidents.investigation', 'Investigation'))}>
                    <p>
                      <strong>{t('incidents.investigationStartedDate', 'Investigation Started')}:</strong>{' '}
                      {formatDate(incident.investigationStartedDate)}
                    </p>
                    {incident.investigatedBy && (
                      <p>
                        <strong>{t('incidents.investigatedBy', 'Investigated By')}:</strong>{' '}
                        {incident.investigatedByName || incident.investigatedBy}
                      </p>
                    )}
                    {incident.investigationNotes && (
                      <p>
                        <strong>{t('incidents.investigationNotes', 'Investigation Notes')}:</strong>
                        <p>{incident.investigationNotes}</p>
                      </p>
                    )}
                    {incident.rootCause && (
                      <p>
                        <strong>{t('incidents.rootCause', 'Root Cause')}:</strong>
                        <p>{incident.rootCause}</p>
                      </p>
                    )}
                  </Panel>
                </Column>
              </Row>
            )}

            {incident.resolvedDate && (
              <Row>
                <Column>
                  <Panel title={String(t('incidents.resolution', 'Resolution'))}>
                    <p>
                      <strong>{t('incidents.resolvedDate', 'Resolved Date')}:</strong>{' '}
                      {formatDate(incident.resolvedDate)}
                    </p>
                    {incident.resolvedBy && (
                      <p>
                        <strong>{t('incidents.resolvedBy', 'Resolved By')}:</strong>{' '}
                        {incident.resolvedByName || incident.resolvedBy}
                      </p>
                    )}
                    {incident.resolution && (
                      <p>
                        <strong>{t('incidents.resolution', 'Resolution')}:</strong>
                        <p>{incident.resolution}</p>
                      </p>
                    )}
                    {incident.correctiveActions && incident.correctiveActions.length > 0 && (
                      <div>
                        <strong>{t('incidents.correctiveActions', 'Corrective Actions')}:</strong>
                        <ul>
                          {incident.correctiveActions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {incident.preventiveActions && incident.preventiveActions.length > 0 && (
                      <div>
                        <strong>{t('incidents.preventiveActions', 'Preventive Actions')}:</strong>
                        <ul>
                          {incident.preventiveActions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Panel>
                </Column>
              </Row>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <Row>
              <Column md={6}>
                <SelectWithLableFormGroup
                  id="category"
                  label={t('incidents.category', 'Category')}
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as IncidentCategory })}
                  options={[
                    { value: 'Patient Safety', label: t('incidents.category.patientSafety', 'Patient Safety') },
                    { value: 'Medication Error', label: t('incidents.category.medicationError', 'Medication Error') },
                    { value: 'Equipment Failure', label: t('incidents.category.equipmentFailure', 'Equipment Failure') },
                    { value: 'Infection Control', label: t('incidents.category.infectionControl', 'Infection Control') },
                    { value: 'Staff Safety', label: t('incidents.category.staffSafety', 'Staff Safety') },
                    { value: 'Environmental', label: t('incidents.category.environmental', 'Environmental') },
                    { value: 'Documentation Error', label: t('incidents.category.documentationError', 'Documentation Error') },
                    { value: 'Other', label: t('incidents.category.other', 'Other') },
                  ]}
                  required
                />
              </Column>
              <Column md={6}>
                <SelectWithLableFormGroup
                  id="severity"
                  label={t('incidents.severity', 'Severity')}
                  value={formData.severity || 'Medium'}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as IncidentSeverity })}
                  options={[
                    { value: 'Low', label: t('incidents.severity.low', 'Low') },
                    { value: 'Medium', label: t('incidents.severity.medium', 'Medium') },
                    { value: 'High', label: t('incidents.severity.high', 'High') },
                    { value: 'Critical', label: t('incidents.severity.critical', 'Critical') },
                  ]}
                  required
                />
              </Column>
            </Row>

            <Row>
              <Column md={6}>
                <SelectWithLableFormGroup
                  id="status"
                  label={t('incidents.status', 'Status')}
                  value={formData.status || 'Reported'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as IncidentStatus })}
                  options={[
                    { value: 'Reported', label: t('incidents.status.reported', 'Reported') },
                    { value: 'Under Investigation', label: t('incidents.status.underInvestigation', 'Under Investigation') },
                    { value: 'Resolved', label: t('incidents.status.resolved', 'Resolved') },
                    { value: 'Closed', label: t('incidents.status.closed', 'Closed') },
                    { value: 'Cancelled', label: t('incidents.status.cancelled', 'Cancelled') },
                  ]}
                />
              </Column>
            </Row>

            <Row>
              <Column md={12}>
                <TextInputWithLabelFormGroup
                  id="description"
                  label={t('incidents.description', 'Description')}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  isTextArea
                  rows={6}
                  required
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
                    setFormData(incident)
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

export default ViewIncident

