import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@lahim/components'
import { useCreateTestCatalog } from '../../hooks/useTestCatalog'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import SelectWithLabelFormGroup from '../../components/input/SelectWithLableFormGroup'
import TextFieldWithLabelFormGroup from '../../components/input/TextFieldWithLabelFormGroup'

const breadcrumbs = [{ i18nKey: 'lims.testCatalog.new', location: '/lims/test-catalog/new' }]

const NewTestCatalog = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.testCatalog.new', 'New Test Catalog Entry'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()
  const { mutate: createTest, isPending: isLoading, error } = useCreateTestCatalog()

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    department: '',
    resultType: 'numeric' as 'numeric' | 'categorical' | 'text' | 'microbiology',
    active: true,
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.code || !formData.name) {
      setSubmitError(t('lims.testCatalog.requiredFields', 'Code and name are required'))
      return
    }

    createTest(
      {
        ...formData,
        description: formData.description || undefined,
        department: formData.department || undefined,
      },
      {
        onSuccess: (data) => {
          navigate('/lims/test-catalog')
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('lims.testCatalog.createError', 'Failed to create test catalog entry'))
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
        onClick={() => navigate('/lims/test-catalog')}
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
      <Panel title={String(t('lims.testCatalog.new', 'New Test Catalog Entry'))}>
        {(submitError || error) && (
          <Alert color="danger" title={String(t('states.error', 'Error'))} message={submitError || (error as any)?.message || ''} />
        )}

        <form onSubmit={handleSubmit}>
          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('lims.testCatalog.code', 'Test Code'))}
                name="code"
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                isRequired
                placeholder="e.g., GLUC, HGB, WBC"
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('lims.testCatalog.name', 'Test Name'))}
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isRequired
                placeholder="e.g., Glucose, Hemoglobin, White Blood Count"
              />
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('lims.testCatalog.department', 'Department'))}
                name="department"
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Chemistry, Hematology, Microbiology"
              />
            </Column>
            <Column md={6}>
              <SelectWithLabelFormGroup
                label={String(t('lims.testCatalog.resultType', 'Result Type'))}
                name="resultType"
                value={formData.resultType}
                onChange={(e) => setFormData({ ...formData, resultType: e.target.value as any })}
                options={[
                  { value: 'numeric', label: String(t('lims.testCatalog.resultType.numeric', 'Numeric')) },
                  { value: 'categorical', label: String(t('lims.testCatalog.resultType.categorical', 'Categorical')) },
                  { value: 'text', label: String(t('lims.testCatalog.resultType.text', 'Text')) },
                  { value: 'microbiology', label: String(t('lims.testCatalog.resultType.microbiology', 'Microbiology')) },
                ]}
              />
            </Column>
          </Row>

          <Row>
            <Column md={12}>
              <TextFieldWithLabelFormGroup
                label={String(t('lims.testCatalog.description', 'Description'))}
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </Column>
          </Row>

          <Row>
            <Column md={12}>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />{' '}
                  {String(t('lims.testCatalog.active', 'Active'))}
                </label>
              </div>
            </Column>
          </Row>

          <Row>
            <Column md={12}>
              <Button color="success" icon="save" iconLocation="left" disabled={isLoading}>
                {isLoading ? String(t('lims.testCatalog.creating', 'Creating...')) : String(t('lims.testCatalog.create', 'Create Test'))}
              </Button>
            </Column>
          </Row>
        </form>
      </Panel>
    </Container>
  )
}

export default NewTestCatalog

