import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Panel, Container, Row, Column, Button, TabsHeader, Tab, Alert, Spinner } from '@hospitalrun/components'
import { useSettings, useUpdateSettings } from '../hooks/useSettings'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'
import Departments from './Departments'
import Locations from './Locations'

const breadcrumbs = [{ i18nKey: 'settings.label', location: '/settings' }]

const Settings = () => {
  const { t } = useTranslation()
  useTitle(t('settings.label', 'Settings'))
  useAddBreadcrumbs(breadcrumbs, true)

  const { data, isLoading } = useSettings()
  const { mutate: updateSettings, isPending: isSaving } = useUpdateSettings()
  const [activeTab, setActiveTab] = useState('system')
  const [formData, setFormData] = useState({
    hospitalName: '',
    hospitalCode: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    language: 'en',
  })

  React.useEffect(() => {
    if (data?.settings && data.settings.length > 0) {
      setFormData(data.settings[0] as any)
    }
  }, [data])

  const handleSave = () => {
    updateSettings(formData, {
      onSuccess: () => {
        // Success handled by mutation
      },
    })
  }

  if (isLoading) {
    return (
      <Container>
        <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
      </Container>
    )
  }

  return (
    <Container>
      <TabsHeader>
        <Tab
          active={activeTab === 'system'}
          label={String(t('settings.system', 'System Settings'))}
          onClick={() => setActiveTab('system')}
        />
        <Tab
          active={activeTab === 'departments'}
          label={String(t('settings.departments', 'Departments'))}
          onClick={() => setActiveTab('departments')}
        />
        <Tab
          active={activeTab === 'locations'}
          label={String(t('settings.locations', 'Locations'))}
          onClick={() => setActiveTab('locations')}
        />
      </TabsHeader>

      <Panel>
        {activeTab === 'system' && (
          <div>
            <Row>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={String(t('settings.hospitalName', 'Hospital Name'))}
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                  isEditable
                />
              </Column>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={String(t('settings.hospitalCode', 'Hospital Code'))}
                  name="hospitalCode"
                  value={formData.hospitalCode}
                  onChange={(e) => setFormData({ ...formData, hospitalCode: e.target.value })}
                  isEditable
                />
              </Column>
            </Row>
            <Row>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={String(t('settings.timezone', 'Timezone'))}
                  name="timezone"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  isEditable
                />
              </Column>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={String(t('settings.dateFormat', 'Date Format'))}
                  name="dateFormat"
                  value={formData.dateFormat}
                  onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                  isEditable
                />
              </Column>
            </Row>
            <Row>
              <Column>
                <Button color="success" onClick={handleSave} disabled={isSaving}>
                  {String(t('actions.save', 'Save'))}
                </Button>
              </Column>
            </Row>
          </div>
        )}

        {activeTab === 'departments' && <Departments />}
        {activeTab === 'locations' && <Locations />}
      </Panel>
    </Container>
  )
}

export default Settings

