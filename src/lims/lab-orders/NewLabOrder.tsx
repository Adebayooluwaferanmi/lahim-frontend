import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@lahim/components'
import { useCreateLabOrder } from '../../hooks/useCreateLabOrder'
import { useTestPanels } from '../../hooks/useTestPanels'
import { useTestCatalog } from '../../hooks/useTestCatalog'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import SelectWithLabelFormGroup from '../../components/input/SelectWithLableFormGroup'

const breadcrumbs = [{ i18nKey: 'lims.labOrders.new', location: '/lims/lab-orders/new' }]

const NewLabOrder = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.labOrders.new', 'New Lab Order'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()
  const { mutate: createOrder, isPending: isLoading, error } = useCreateLabOrder()
  const { data: panelsData } = useTestPanels({ active: true })
  const { data: testCatalogData } = useTestCatalog({ active: true })

  const panels = panelsData
    ? Array.isArray(panelsData)
      ? panelsData
      : (panelsData as { panels?: any[] }).panels || []
    : []

  const testEntries = testCatalogData
    ? Array.isArray(testCatalogData)
      ? testCatalogData
      : (testCatalogData as { entries?: any[] }).entries || []
    : []

  const [orderType, setOrderType] = useState<'panel' | 'individual'>('panel')
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    priority: 'routine' as 'routine' | 'urgent' | 'stat',
    panelId: '',
    testCodeLoinc: '',
    notes: '',
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.patientId) {
      setSubmitError(t('lims.labOrders.patientRequired', 'Patient ID is required'))
      return
    }

    if (orderType === 'panel' && !formData.panelId) {
      setSubmitError(t('lims.labOrders.panelRequired', 'Please select a test panel'))
      return
    }

    if (orderType === 'individual' && !formData.testCodeLoinc) {
      setSubmitError(t('lims.labOrders.testRequired', 'Please select a test'))
      return
    }

    createOrder(
      {
        ...formData,
        isPanel: orderType === 'panel',
        // For panels, panelId is set; for individual tests, testCodeLoinc is set
        ...(orderType === 'panel'
          ? { panelId: formData.panelId, testCodeLoinc: undefined }
          : { testCodeLoinc: formData.testCodeLoinc, panelId: undefined }),
        tests: orderType === 'panel' ? [] : [{ testCode: formData.testCodeLoinc, testName: testEntries.find((t: any) => t.code === formData.testCodeLoinc)?.name || '' }],
      },
      {
        onSuccess: (data) => {
          navigate(`/lims/lab-orders/${data.id || data._id}`)
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('lims.labOrders.createError', 'Failed to create lab order'))
        },
      }
    )
  }

  useEffect(() => {
    setButtonToolBar([
      <Button
        key="cancelButton"
        outlined
        color="secondary"
        onClick={() => navigate('/lims/lab-orders')}
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
      <Panel title={String(t('lims.labOrders.new', 'New Lab Order'))}>
        {(submitError || error) && (
          <Alert color="danger" title={String(t('states.error', 'Error'))} message={String(submitError || (error as any)?.message || '')} />
        )}

        <form onSubmit={handleSubmit}>
          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('lims.labOrders.patientId', 'Patient ID'))}
                name="patientId"
                type="text"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                isRequired
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('lims.labOrders.patientName', 'Patient Name'))}
                name="patientName"
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              />
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <div className="form-group">
                <label>{String(t('lims.labOrders.priority', 'Priority'))}</label>
                <select
                  className="form-control"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                >
                  <option value="routine">{String(t('lims.labOrders.priorityValues.routine', 'Routine'))}</option>
                  <option value="urgent">{String(t('lims.labOrders.priorityValues.urgent', 'Urgent'))}</option>
                  <option value="stat">{String(t('lims.labOrders.priorityValues.stat', 'Stat'))}</option>
                </select>
              </div>
            </Column>
          </Row>

          <Row>
            <Column md={12}>
              <div className="form-group">
                <label>{String(t('lims.labOrders.orderType', 'Order Type'))}</label>
                <select
                  className="form-control"
                  value={orderType}
                  onChange={(e) => {
                    setOrderType(e.target.value as 'panel' | 'individual')
                    setFormData({ ...formData, panelId: '', testCodeLoinc: '' })
                  }}
                >
                  <option value="panel">{String(t('lims.labOrders.orderType.panel', 'Test Panel'))}</option>
                  <option value="individual">{String(t('lims.labOrders.orderType.individual', 'Individual Test'))}</option>
                </select>
              </div>
            </Column>
          </Row>

          {orderType === 'panel' ? (
            <Row>
              <Column md={12}>
                <SelectWithLabelFormGroup
                  label={String(t('lims.labOrders.selectPanel', 'Select Test Panel'))}
                  name="panelId"
                  value={formData.panelId}
                  onChange={(e) => setFormData({ ...formData, panelId: e.target.value })}
                  isRequired
                  options={[
                    { value: '', label: String(t('lims.labOrders.selectPanel', 'Select Panel...')) },
                    ...panels.map((panel: any) => ({
                      value: panel.id || panel._id,
                      label: `${panel.code} - ${panel.name} (${panel.parameters?.length || 0} parameters)`,
                    })),
                  ]}
                />
              </Column>
            </Row>
          ) : (
            <Row>
              <Column md={12}>
                <SelectWithLabelFormGroup
                  label={String(t('lims.labOrders.selectTest', 'Select Test'))}
                  name="testCodeLoinc"
                  value={formData.testCodeLoinc}
                  onChange={(e) => setFormData({ ...formData, testCodeLoinc: e.target.value })}
                  isRequired
                  options={[
                    { value: '', label: String(t('lims.labOrders.selectTest', 'Select Test...')) },
                    ...testEntries.map((entry: any) => ({
                      value: entry.code,
                      label: `${entry.code} - ${entry.name}`,
                    })),
                  ]}
                />
              </Column>
            </Row>
          )}

          <Row>
            <Column md={12}>
              <Button color="success" icon="save" iconLocation="left" disabled={isLoading}>
                {isLoading ? String(t('lims.labOrders.creating', 'Creating...')) : String(t('lims.labOrders.create', 'Create Lab Order'))}
              </Button>
            </Column>
          </Row>
        </form>
      </Panel>
    </Container>
  )
}

export default NewLabOrder

