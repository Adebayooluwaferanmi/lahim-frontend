import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column, Modal } from '@lahim/components'
import { useTestPanel, useUpdateTestPanel, useDeleteTestPanel } from '../../hooks/useTestPanels'
import { useTestCatalog } from '../../hooks/useTestCatalog'
import { apiClient } from '../../lib/api-client'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import SelectWithLabelFormGroup from '../../components/input/SelectWithLableFormGroup'

const ViewTestPanel = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const setButtonToolBar = useButtonToolbarSetter()
  const { data: panel, isLoading, error, refetch } = useTestPanel(id)
  const { mutate: updatePanel } = useUpdateTestPanel()
  const { mutate: deletePanel } = useDeleteTestPanel()
  const { data: testCatalogData } = useTestCatalog()

  const [showAddParameterModal, setShowAddParameterModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [parameterForm, setParameterForm] = useState({
    parameterCode: '',
    parameterName: '',
    sequence: 1,
    unit: '',
    refRangeLow: '',
    refRangeHigh: '',
    criticalLow: '',
    criticalHigh: '',
    required: true,
  })

  const testCatalogEntries = testCatalogData
    ? Array.isArray(testCatalogData)
      ? testCatalogData
      : (testCatalogData as { entries?: any[] }).entries || []
    : []

  useTitle(panel ? `${String(t('lims.testPanels.view', 'View Test Panel'))} - ${panel.name}` : t('lims.testPanels.view', 'View Test Panel'))

  useAddBreadcrumbs(
    id
      ? [
          { i18nKey: 'lims.testPanels.label', location: '/lims/test-panels' },
          { i18nKey: 'lims.testPanels.view', location: `/lims/test-panels/${id}` },
        ]
      : [],
    true
  )

  useEffect(() => {
    setButtonToolBar([
      <Button
        key="backButton"
        outlined
        color="secondary"
        icon="left-arrow"
        iconLocation="left"
        onClick={() => navigate('/lims/test-panels')}
      >
        {String(t('actions.back', 'Back'))}
      </Button>,
      <Button
        key="addParameterButton"
        color="success"
        icon="add"
        onClick={() => setShowAddParameterModal(true)}
      >
        {String(t('lims.testPanels.addParameter', 'Add Parameter'))}
      </Button>,
      <Button
        key="deleteButton"
        color="danger"
        icon="remove"
        onClick={() => setShowDeleteModal(true)}
      >
        {String(t('actions.delete', 'Delete'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  const handleAddParameter = async () => {
    if (!id || !parameterForm.parameterCode || !parameterForm.parameterName) {
      return
    }

    try {
      await apiClient.post(`/test-panels/${id}/parameters`, {
        ...parameterForm,
        sequence: panel?.parameters?.length ? panel.parameters.length + 1 : 1,
        refRangeLow: parameterForm.refRangeLow ? parseFloat(parameterForm.refRangeLow) : undefined,
        refRangeHigh: parameterForm.refRangeHigh ? parseFloat(parameterForm.refRangeHigh) : undefined,
        criticalLow: parameterForm.criticalLow ? parseFloat(parameterForm.criticalLow) : undefined,
        criticalHigh: parameterForm.criticalHigh ? parseFloat(parameterForm.criticalHigh) : undefined,
      })
      setShowAddParameterModal(false)
      setParameterForm({
        parameterCode: '',
        parameterName: '',
        sequence: 1,
        unit: '',
        refRangeLow: '',
        refRangeHigh: '',
        criticalLow: '',
        criticalHigh: '',
        required: true,
      })
      refetch()
    } catch (err: any) {
      alert(err.message || t('lims.testPanels.addParameterError', 'Failed to add parameter'))
    }
  }

  const handleDeleteParameter = async (parameterCode: string) => {
    if (!id) return
    if (!confirm(t('lims.testPanels.confirmDeleteParameter', 'Are you sure you want to remove this parameter?'))) {
      return
    }

    try {
      await apiClient.delete(`/test-panels/${id}/parameters/${parameterCode}`)
      refetch()
    } catch (err: any) {
      alert(err.message || t('lims.testPanels.deleteParameterError', 'Failed to delete parameter'))
    }
  }

  const handleDeletePanel = () => {
    if (!id) return
    deletePanel(id, {
      onSuccess: () => {
        navigate('/lims/test-panels')
      },
    })
  }

  const handleTestCatalogSelect = (code: string) => {
    const entry = testCatalogEntries.find((e: any) => e.code === code)
    if (entry) {
      setParameterForm({
        ...parameterForm,
        parameterCode: entry.code,
        parameterName: entry.name,
      })
    }
  }

  if (isLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  if (error || !panel) {
    return (
      <Container>
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={String(error?.message || t('lims.testPanels.notFound', 'Test panel not found'))} />
      </Container>
    )
  }

  const sortedParameters = [...(panel.parameters || [])].sort((a, b) => (a.sequence || 0) - (b.sequence || 0))

  return (
    <Container>
      <Panel title={`${String(t('lims.testPanels.view', 'View Test Panel'))} - ${panel.name}`}>
        <Row>
          <Column md={6}>
            <h4>{String(t('lims.testPanels.panelInformation', 'Panel Information'))}</h4>
            <table className="table">
              <tbody>
                <tr>
                  <td><strong>{String(t('lims.testPanels.code', 'Panel Code'))}</strong></td>
                  <td>{panel.code}</td>
                </tr>
                <tr>
                  <td><strong>{String(t('lims.testPanels.name', 'Panel Name'))}</strong></td>
                  <td>{panel.name}</td>
                </tr>
                <tr>
                  <td><strong>{String(t('lims.testPanels.department', 'Department'))}</strong></td>
                  <td>{panel.department || '-'}</td>
                </tr>
                <tr>
                  <td><strong>{String(t('lims.testPanels.active', 'Active'))}</strong></td>
                  <td>
                    <span className={`badge badge-${panel.active ? 'success' : 'secondary'}`}>
                      {panel.active ? String(t('common.yes', 'Yes')) : String(t('common.no', 'No'))}
                    </span>
                  </td>
                </tr>
                {panel.description && (
                  <tr>
                    <td><strong>{String(t('lims.testPanels.description', 'Description'))}</strong></td>
                    <td>{panel.description}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Column>
        </Row>

        <Row style={{ marginTop: '30px' }}>
          <Column md={12}>
            <h4>
              {String(t('lims.testPanels.parameters', 'Parameters'))} ({sortedParameters.length})
            </h4>
            {sortedParameters.length === 0 ? (
              <Alert color="info" message={String(t('lims.testPanels.noParameters', 'No parameters added yet. Click "Add Parameter" to add tests to this panel.'))} />
            ) : (
              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>{String(t('lims.testPanels.sequence', 'Seq'))}</th>
                    <th>{String(t('lims.testPanels.parameterCode', 'Code'))}</th>
                    <th>{String(t('lims.testPanels.parameterName', 'Parameter Name'))}</th>
                    <th>{String(t('lims.testPanels.unit', 'Unit'))}</th>
                    <th>{String(t('lims.testPanels.referenceRange', 'Reference Range'))}</th>
                    <th>{String(t('lims.testPanels.criticalValues', 'Critical Values'))}</th>
                    <th>{String(t('actions.actions', 'Actions'))}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedParameters.map((param, index) => (
                    <tr key={param.parameterCode || index}>
                      <td>{param.sequence}</td>
                      <td>{param.parameterCode}</td>
                      <td>{param.parameterName}</td>
                      <td>{param.unit || '-'}</td>
                      <td>
                        {param.refRangeLow !== undefined && param.refRangeHigh !== undefined
                          ? `${param.refRangeLow} - ${param.refRangeHigh}`
                          : '-'}
                      </td>
                      <td>
                        {param.criticalLow !== undefined && param.criticalHigh !== undefined
                          ? `${param.criticalLow} - ${param.criticalHigh}`
                          : '-'}
                      </td>
                      <td>
                        <Button
                          color="danger"
                          size="small"
                          icon="remove"
                          onClick={() => handleDeleteParameter(param.parameterCode)}
                        >
                          {String(t('actions.remove', 'Remove'))}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Column>
        </Row>
      </Panel>

      {/* Add Parameter Modal */}
      <Modal
        show={showAddParameterModal}
        toggle={() => setShowAddParameterModal(false)}
        title={String(t('lims.testPanels.addParameter', 'Add Parameter'))}
        body={
          <div>
          <Row>
            <Column md={6}>
              <SelectWithLabelFormGroup
                label={String(t('lims.testPanels.selectTest', 'Select Test from Catalog'))}
                name="testCatalog"
                value={parameterForm.parameterCode}
                onChange={(e) => handleTestCatalogSelect(e.target.value)}
                options={[
                  { value: '', label: String(t('lims.testPanels.selectTest', 'Select Test...')) },
                  ...testCatalogEntries.map((entry: any) => ({
                    value: entry.code,
                    label: `${entry.code} - ${entry.name}`,
                  })),
                ]}
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('lims.testPanels.parameterName', 'Parameter Name'))}
                name="parameterName"
                type="text"
                value={parameterForm.parameterName}
                onChange={(e) => setParameterForm({ ...parameterForm, parameterName: e.target.value })}
                isRequired
              />
            </Column>
          </Row>
          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('lims.testPanels.unit', 'Unit (UCUM)'))}
                name="unit"
                type="text"
                value={parameterForm.unit}
                onChange={(e) => setParameterForm({ ...parameterForm, unit: e.target.value })}
                placeholder="e.g., U/L, mg/dL, g/dL"
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('lims.testPanels.sequence', 'Sequence'))}
                name="sequence"
                type="number"
                value={String(parameterForm.sequence)}
                onChange={(e) => setParameterForm({ ...parameterForm, sequence: parseInt(e.target.value, 10) || 1 })}
              />
            </Column>
          </Row>
          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('lims.testPanels.refRangeLow', 'Reference Range Low'))}
                name="refRangeLow"
                type="number"
                value={parameterForm.refRangeLow}
                onChange={(e) => setParameterForm({ ...parameterForm, refRangeLow: e.target.value })}
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('lims.testPanels.refRangeHigh', 'Reference Range High'))}
                name="refRangeHigh"
                type="number"
                value={parameterForm.refRangeHigh}
                onChange={(e) => setParameterForm({ ...parameterForm, refRangeHigh: e.target.value })}
              />
            </Column>
          </Row>
          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('lims.testPanels.criticalLow', 'Critical Value Low'))}
                name="criticalLow"
                type="number"
                value={parameterForm.criticalLow}
                onChange={(e) => setParameterForm({ ...parameterForm, criticalLow: e.target.value })}
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('lims.testPanels.criticalHigh', 'Critical Value High'))}
                name="criticalHigh"
                type="number"
                value={parameterForm.criticalHigh}
                onChange={(e) => setParameterForm({ ...parameterForm, criticalHigh: e.target.value })}
              />
            </Column>
          </Row>
          <Row>
            <Column md={12}>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={parameterForm.required}
                    onChange={(e) => setParameterForm({ ...parameterForm, required: e.target.checked })}
                  />{' '}
                  {String(t('lims.testPanels.required', 'Required Parameter'))}
                </label>
              </div>
            </Column>
          </Row>
          </div>
        }
        closeButton={{
          children: String(t('actions.cancel', 'Cancel')),
          color: 'secondary',
          onClick: () => setShowAddParameterModal(false),
        }}
        successButton={{
          children: String(t('actions.add', 'Add')),
          color: 'success',
          onClick: handleAddParameter,
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        toggle={() => setShowDeleteModal(false)}
        title={String(t('lims.testPanels.confirmDelete', 'Confirm Delete'))}
        body={
          <div>
            {String(t('lims.testPanels.confirmDeleteMessage', 'Are you sure you want to delete this test panel? This action cannot be undone.'))}
          </div>
        }
        closeButton={{
          children: String(t('actions.cancel', 'Cancel')),
          color: 'secondary',
          onClick: () => setShowDeleteModal(false),
        }}
        successButton={{
          children: String(t('actions.delete', 'Delete')),
          color: 'danger',
          onClick: handleDeletePanel,
        }}
      />
    </Container>
  )
}

export default ViewTestPanel

