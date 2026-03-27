import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@lahim/components'
import { useCreateTestPanel } from '../../hooks/useTestPanels'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import TextFieldWithLabelFormGroup from '../../components/input/TextFieldWithLabelFormGroup'

const breadcrumbs = [{ i18nKey: 'lims.testPanels.new', location: '/lims/test-panels/new' }]

const NewTestPanel = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.testPanels.new', 'New Test Panel'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()
  const { mutate: createPanel, isPending: isLoading, error } = useCreateTestPanel()

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    department: '',
    active: true,
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.code || !formData.name) {
      setSubmitError(t('lims.testPanels.requiredFields', 'Code and name are required'))
      return
    }

    createPanel(
      {
        ...formData,
        description: formData.description || undefined,
        department: formData.department || undefined,
        parameters: [], // Parameters will be added in the view/edit page
      },
      {
        onSuccess: (data) => {
          navigate(`/lims/test-panels/${data.id || data._id}`)
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('lims.testPanels.createError', 'Failed to create test panel'))
        },
      },
    )
  }

  useEffect(() => {
    setButtonToolBar([
      <Button
        key="cancelButton"
        outlined
        color="secondary"
        onClick={() => navigate('/lims/test-panels')}
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
      <Panel title={String(t('lims.testPanels.new', 'New Test Panel'))}>
        {(submitError || error) && (
          <Alert color="danger" title={String(t('states.error', 'Error'))} message={submitError || (error as any)?.message || ''} />
        )}

        <form onSubmit={handleSubmit}>
          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('lims.testPanels.code', 'Panel Code'))}
                name="code"
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                isRequired
                placeholder="e.g., LFT, FBC, LIPID"
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('lims.testPanels.name', 'Panel Name'))}
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isRequired
                placeholder="e.g., Liver Function Test, Full Blood Count"
              />
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('lims.testPanels.department', 'Department'))}
                name="department"
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Chemistry, Hematology"
              />
            </Column>
            <Column md={6}>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />{' '}
                  {String(t('lims.testPanels.active', 'Active'))}
                </label>
              </div>
            </Column>
          </Row>

          <Row>
            <Column md={12}>
              <TextFieldWithLabelFormGroup
                label={String(t('lims.testPanels.description', 'Description'))}
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </Column>
          </Row>

          <Row>
            <Column md={12}>
              <Alert
                color="info"
                title={String(t('lims.testPanels.note', 'Note'))}
                message={String(t('lims.testPanels.noteMessage', 'After creating the panel, you can add parameters (individual tests) on the next page.'))}
              />
            </Column>
          </Row>

          <Row>
            <Column md={12}>
              <Button color="success" icon="save" iconLocation="left" disabled={isLoading}>
                {isLoading ? String(t('lims.testPanels.creating', 'Creating...')) : String(t('lims.testPanels.create', 'Create Panel'))}
              </Button>
            </Column>
          </Row>
        </form>
      </Panel>
    </Container>
  )
}

export default NewTestPanel

