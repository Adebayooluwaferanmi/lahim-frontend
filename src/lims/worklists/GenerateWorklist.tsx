import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@lahim/components'
import { useGenerateWorklist } from '../../hooks/useGenerateWorklist'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import SelectWithLabelFormGroup from '../../components/input/SelectWithLableFormGroup'

const breadcrumbs = [{ i18nKey: 'lims.worklists.generate', location: '/lims/worklists/generate' }]

const GenerateWorklist = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.worklists.generate', 'Generate Worklist'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()
  const { mutate: generateWorklist, isPending: generating, error } = useGenerateWorklist()

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mode: 'auto',
    instrumentId: '',
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    generateWorklist(
      {
        date: formData.date,
        mode: formData.mode,
        instrumentId: formData.instrumentId || undefined,
      },
      {
        onSuccess: (worklist) => {
          navigate(`/lims/worklists/${worklist.id || worklist._id}`)
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('lims.worklists.generateError', 'Failed to generate worklist'))
        },
      }
    )
  }

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="backButton"
        color="secondary"
        icon="arrow-left"
        iconLocation="left"
        onClick={() => navigate('/lims/worklists')}
      >
        {String(t('actions.back', 'Back'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  return (
    <Container>
      <Row>
        <Column md={8}>
          <Panel>
            <form onSubmit={handleSubmit}>
              <TextInputWithLabelFormGroup
                name="date"
                label={String(t('lims.worklists.date', 'Date'))}
                value={formData.date}
                isEditable
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                type="date"
              />

              <SelectWithLabelFormGroup
                name="mode"
                label={String(t('lims.worklists.mode', 'Mode'))}
                value={formData.mode}
                isEditable
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                options={[
                  { label: t('lims.worklists.mode.auto', 'Auto'), value: 'auto' },
                  { label: t('lims.worklists.mode.manual', 'Manual'), value: 'manual' },
                ]}
              />

              <TextInputWithLabelFormGroup
                name="instrumentId"
                label={String(t('lims.worklists.instrumentId', 'Instrument ID (Optional)'))}
                value={formData.instrumentId}
                isEditable
                onChange={(e) => setFormData({ ...formData, instrumentId: e.target.value })}
              />

              {submitError && (
                <Alert color="danger" title={String(t('states.error', 'Error'))} message={submitError} />
              )}

              {error && (
                <Alert
                  color="danger"
                  title={String(t('states.error', 'Error'))}
                  message={String((error as Error).message || t('lims.worklists.generateError', 'Failed to generate worklist'))}
                />
              )}

              <div className="form-group">
                <Button type="submit" color="success" disabled={generating}>
                  {generating ? (
                    <>
                      <Spinner color="white" loading size={[10, 10]} type="ClipLoader" />
                      <span className="ml-2">{String(t('lims.worklists.generating', 'Generating...'))}</span>
                    </>
                  ) : (
                    String(t('lims.worklists.generate', 'Generate Worklist'))
                  )}
                </Button>
              </div>
            </form>
          </Panel>
        </Column>
      </Row>
    </Container>
  )
}

export default GenerateWorklist






