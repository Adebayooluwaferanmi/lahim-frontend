import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column, Table } from '@lahim/components'
import { useVisit, useUpdateVisit, useDischargePatient } from '../hooks/useVisits'
import { useImaging } from '../hooks/useImaging'
import { useIncidents } from '../hooks/useIncidents'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'
import SelectWithLableFormGroup from '../components/input/SelectWithLableFormGroup'
import DatePickerWithLabelFormGroup from '../components/input/DatePickerWithLabelFormGroup'
import Visit, { VisitType, VisitStatus } from '../model/Visit'

const ViewVisit = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: visit, isLoading, error } = useVisit(id)
  const { mutate: updateVisit, isPending: isUpdating } = useUpdateVisit(id || '')
  const { mutate: dischargePatient, isPending: isDischarging } = useDischargePatient(id || '')
  const { data: imagingOrders = [] } = useImaging({ visitId: id })
  const { data: incidents = [] } = useIncidents({ visitId: id })

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Visit>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  useTitle(visit ? t('visits.view', 'View Visit') : t('visits.loading', 'Loading Visit'))
  useAddBreadcrumbs(
    [
      { i18nKey: 'visits.label', location: '/visits' },
      { i18nKey: 'visits.view', location: `/visits/${id}` },
    ],
    true
  )
  const setButtonToolBar = useButtonToolbarSetter()

  useEffect(() => {
    if (visit) {
      setFormData(visit)
    }
  }, [visit])

  useEffect(() => {
    const buttons = []
    
    if (visit) {
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
              setFormData(visit)
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

        if (visit.status === 'Admitted' || visit.status === 'InProgress') {
          buttons.push(
            <Button
              key="dischargeButton"
              color="info"
              onClick={handleDischarge}
              disabled={isDischarging}
            >
              {String(t('visits.discharge', 'Discharge'))}
            </Button>
          )
        }

        buttons.push(
          <Button
            key="addChargeButton"
            color="warning"
            onClick={() => navigate(`/billing/charges/new?patientId=${visit.patientId}&visitId=${visit.id || visit._id}`)}
          >
            {String(t('billing.charges.add', 'Add Charge'))}
          </Button>,
          <Button
            key="createInvoiceButton"
            color="success"
            onClick={() => navigate(`/billing/invoices/new?patientId=${visit.patientId}&visitId=${visit.id || visit._id}`)}
          >
            {String(t('billing.invoices.create', 'Create Invoice'))}
          </Button>,
          <Button
            key="addImagingButton"
            color="primary"
            onClick={() => navigate(`/imaging/new?patientId=${visit.patientId}&visitId=${visit.id || visit._id}`)}
          >
            {String(t('imaging.new', 'New Imaging Order'))}
          </Button>,
          <Button
            key="addIncidentButton"
            color="danger"
            onClick={() => navigate(`/incidents/new?patientId=${visit.patientId}&visitId=${visit.id || visit._id}`)}
          >
            {String(t('incidents.new', 'Report Incident'))}
          </Button>
        )
      }
    }

    buttons.push(
      <Button
        key="backButton"
        outlined
        color="secondary"
        onClick={() => navigate('/visits')}
      >
        {String(t('actions.back', 'Back'))}
      </Button>
    )

    setButtonToolBar(buttons)

    return () => {
      setButtonToolBar([])
    }
  }, [visit, isEditing, isUpdating, isDischarging, setButtonToolBar, navigate, t])

  const handleSave = async () => {
    setSubmitError(null)

    if (!formData.patientId || !formData.startDate || !formData.visitType) {
      setSubmitError(t('visits.requiredFields', 'Please fill in all required fields'))
      return
    }

    updateVisit(formData, {
      onSuccess: () => {
        setIsEditing(false)
      },
      onError: (err: any) => {
        setSubmitError(err.message || t('visits.updateError', 'Failed to update visit'))
      },
    })
  }

  const handleDischarge = () => {
    if (!id) return

    dischargePatient(
      {
        dischargeDate: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          // Visit will be refetched automatically
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('visits.dischargeError', 'Failed to discharge patient'))
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

  if (error || !visit) {
    return (
      <Container>
        <Alert
          color="danger"
          title={String(t('states.error', 'Error'))}
          message={String(error?.message || t('visits.notFound', 'Visit not found'))}
        />
      </Container>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
  }

  return (
    <Container>
      {submitError && (
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={submitError} />
      )}

      <Panel title={String(t('visits.view', 'View Visit'))}>
        <Row>
          <Column md={6}>
            <TextInputWithLabelFormGroup
              label={String(t('visits.patientId', 'Patient ID'))}
              name="patientId"
              type="text"
              value={formData.patientId || ''}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              isEditable={isEditing}
              isRequired
            />
          </Column>
          <Column md={6}>
            <DatePickerWithLabelFormGroup
              label={String(t('visits.startDate', 'Start Date'))}
              name="startDate"
              value={formData.startDate ? new Date(formData.startDate) : new Date()}
              onChange={(date) => setFormData({ ...formData, startDate: date.toISOString() })}
              isEditable={isEditing}
              isRequired
            />
          </Column>
        </Row>

        {visit.endDate && (
          <Row>
            <Column md={6}>
              <DatePickerWithLabelFormGroup
                label={String(t('visits.endDate', 'End Date'))}
                name="endDate"
                value={visit.endDate ? new Date(visit.endDate) : undefined}
                onChange={(date) => setFormData({ ...formData, endDate: date.toISOString() })}
                isEditable={isEditing}
              />
            </Column>
          </Row>
        )}

        <Row>
          <Column md={6}>
            <SelectWithLableFormGroup
              label={String(t('visits.visitType', 'Visit Type'))}
              name="visitType"
              value={formData.visitType || 'Outpatient'}
              onChange={(e) => {
                const visitType = e.target.value as VisitType
                setFormData({
                  ...formData,
                  visitType,
                  outPatient: visitType !== 'Inpatient',
                })
              }}
              options={[
                { label: t('visits.visitTypes.emergency', 'Emergency'), value: 'Emergency' },
                { label: t('visits.visitTypes.outpatient', 'Outpatient'), value: 'Outpatient' },
                { label: t('visits.visitTypes.inpatient', 'Inpatient'), value: 'Inpatient' },
                { label: t('visits.visitTypes.clinic', 'Clinic'), value: 'Clinic' },
                { label: t('visits.visitTypes.walkIn', 'Walk-in'), value: 'Walk-in' },
              ]}
              isEditable={isEditing}
            />
          </Column>
          <Column md={6}>
            <SelectWithLableFormGroup
              label={String(t('visits.status', 'Status'))}
              name="status"
              value={formData.status || 'InProgress'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as VisitStatus })}
              options={[
                { label: t('visits.statusValues.admitted', 'Admitted'), value: 'Admitted' },
                { label: t('visits.statusValues.discharged', 'Discharged'), value: 'Discharged' },
                { label: t('visits.statusValues.checkedOut', 'Checked Out'), value: 'CheckedOut' },
                { label: t('visits.statusValues.inProgress', 'In Progress'), value: 'InProgress' },
                { label: t('visits.statusValues.cancelled', 'Cancelled'), value: 'Cancelled' },
              ]}
              isEditable={isEditing}
            />
          </Column>
        </Row>

        <Row>
          <Column md={6}>
            <TextInputWithLabelFormGroup
              label={String(t('visits.location', 'Location'))}
              name="location"
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              isEditable={isEditing}
            />
          </Column>
          <Column md={6}>
            <TextInputWithLabelFormGroup
              label={String(t('visits.examiner', 'Examiner'))}
              name="examiner"
              type="text"
              value={formData.examiner || ''}
              onChange={(e) => setFormData({ ...formData, examiner: e.target.value })}
              isEditable={isEditing}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <TextInputWithLabelFormGroup
              label={String(t('visits.reasonForVisit', 'Reason for Visit'))}
              name="reasonForVisit"
              type="text"
              value={formData.reasonForVisit || ''}
              onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
              isEditable={isEditing}
            />
          </Column>
        </Row>

        {visit.dischargeInfo && (
          <Row>
            <Column>
              <Panel title={String(t('visits.dischargeInfo', 'Discharge Information'))}>
                <p>
                  <strong>{t('visits.dischargeDate', 'Discharge Date')}:</strong>{' '}
                  {formatDate(visit.dischargeInfo.dischargeDate)}
                </p>
                {visit.dischargeInfo.dischargeNotes && (
                  <p>
                    <strong>{t('visits.dischargeNotes', 'Discharge Notes')}:</strong>{' '}
                    {visit.dischargeInfo.dischargeNotes}
                  </p>
                )}
                {visit.dischargeInfo.dischargeDiagnosis && (
                  <p>
                    <strong>{t('visits.dischargeDiagnosis', 'Discharge Diagnosis')}:</strong>{' '}
                    {visit.dischargeInfo.dischargeDiagnosis}
                  </p>
                )}
              </Panel>
            </Column>
          </Row>
        )}

        {/* Imaging Orders Section */}
        <Row>
          <Column>
            <Panel title={String(t('imaging.label', 'Imaging Orders'))}>
              {imagingOrders.length > 0 ? (
                <Table
                  data={imagingOrders}
                  getID={(row) => row.id || row._id}
                  columns={[
                    {
                      label: t('imaging.imagingType', 'Imaging Type'),
                      key: 'imagingTypeName',
                    },
                    {
                      label: t('imaging.requestedDate', 'Requested Date'),
                      key: 'requestedDate',
                      formatter: (row: any) => formatDate(row.requestedDate),
                    },
                    {
                      label: t('imaging.status', 'Status'),
                      key: 'status',
                    },
                  ]}
                  actionsHeaderText={t('actions.label', 'Actions')}
                  actions={[
                    {
                      label: t('actions.view', 'View'),
                      action: (row: any) => navigate(`/imaging/${row.id || row._id}`),
                    },
                  ]}
                />
              ) : (
                <p>{t('imaging.noOrders', 'No imaging orders for this visit')}</p>
              )}
            </Panel>
          </Column>
        </Row>

        {/* Incidents Section */}
        <Row>
          <Column>
            <Panel title={String(t('incidents.label', 'Incidents'))}>
              {incidents.length > 0 ? (
                <Table
                  data={incidents}
                  getID={(row) => row.id || row._id}
                  columns={[
                    {
                      label: t('incidents.incidentNumber', 'Incident #'),
                      key: 'incidentNumber',
                    },
                    {
                      label: t('incidents.category', 'Category'),
                      key: 'category',
                    },
                    {
                      label: t('incidents.severity', 'Severity'),
                      key: 'severity',
                    },
                    {
                      label: t('incidents.reportedDate', 'Reported Date'),
                      key: 'reportedDate',
                      formatter: (row: any) => formatDate(row.reportedDate),
                    },
                    {
                      label: t('incidents.status', 'Status'),
                      key: 'status',
                    },
                  ]}
                  actionsHeaderText={t('actions.label', 'Actions')}
                  actions={[
                    {
                      label: t('actions.view', 'View'),
                      action: (row: any) => navigate(`/incidents/${row.id || row._id}`),
                    },
                  ]}
                />
              ) : (
                <p>{t('incidents.noIncidents', 'No incidents reported for this visit')}</p>
              )}
            </Panel>
          </Column>
        </Row>
      </Panel>
    </Container>
  )
}

export default ViewVisit

