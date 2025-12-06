import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@hospitalrun/components'
import { useGenerateReport } from '../../hooks/useReports'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import SelectWithLabelFormGroup from '../../components/input/SelectWithLableFormGroup'

const breadcrumbs = [{ i18nKey: 'lims.reports.generate', location: '/lims/reports/generate' }]

const GenerateReport = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.reports.generate', 'Generate Report'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()
  const { mutate: generateReport, isPending: generating, error } = useGenerateReport()

  const [formData, setFormData] = useState({
    patientId: '',
    format: 'pdf',
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.patientId) {
      setSubmitError(t('lims.reports.patientRequired', 'Patient ID is required'))
      return
    }

    generateReport(
      {
        patientId: formData.patientId,
        format: formData.format,
      },
      {
        onSuccess: (report) => {
          navigate(`/lims/reports/${report.id || report._id}`)
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('lims.reports.generateError', 'Failed to generate report'))
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
        onClick={() => navigate('/lims/reports')}
      >
        {String(t('actions.cancel', 'Cancel'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  if (generating) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  return (
    <Container>
      <Panel title={String(t('lims.reports.generate', 'Generate Report'))}>
        {(submitError || error) && (
          <Alert color="danger" title={String(t('states.error', 'Error'))} message={String(submitError || (error as any)?.message || '')} />
        )}

        <form onSubmit={handleSubmit}>
          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('lims.reports.patientId', 'Patient ID'))}
                name="patientId"
                type="text"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                isRequired
              />
            </Column>
            <Column md={6}>
              <SelectWithLabelFormGroup
                label={String(t('lims.reports.format', 'Format'))}
                name="format"
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                options={[
                  { value: 'pdf', label: 'PDF' },
                  { value: 'json', label: 'JSON' },
                  { value: 'hl7', label: 'HL7' },
                ]}
              />
            </Column>
          </Row>

          <Row>
            <Column md={12}>
              <Button color="success" icon="save" iconLocation="left" disabled={generating}>
                {generating ? String(t('lims.reports.generating', 'Generating...')) : String(t('lims.reports.generate', 'Generate Report'))}
              </Button>
            </Column>
          </Row>
        </form>
      </Panel>
    </Container>
  )
}

export default GenerateReport

