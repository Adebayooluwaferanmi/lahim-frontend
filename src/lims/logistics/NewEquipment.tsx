import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, Spinner, Alert, Panel } from '@lahim/components'
import { useCreateEquipment } from '../../hooks/useEquipment'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import SelectWithLableFormGroup from '../../components/input/SelectWithLableFormGroup'
import DatePickerWithLabelFormGroup from '../../components/input/DatePickerWithLabelFormGroup'

const NewEquipment = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createMutation = useCreateEquipment()
  const setButtonToolBar = useButtonToolbarSetter()

  const [formData, setFormData] = useState({
    name: '',
    equipmentType: 'analyzer',
    manufacturer: '',
    model: '',
    serialNumber: '',
    location: '',
    status: 'active',
    purchaseDate: '',
    warrantyExpiry: '',
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  useTitle(t('lims.logistics.newEquipment', 'New Equipment'))
  useAddBreadcrumbs(
    [
      { i18nKey: 'lims.logistics.equipment', location: '/lims/logistics/equipment' },
      { i18nKey: 'lims.logistics.newEquipment', location: '/lims/logistics/equipment/new' },
    ],
    true
  )

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="backButton"
        outlined
        color="secondary"
        icon="left-arrow"
        iconLocation="left"
        onClick={() => navigate('/lims/logistics/equipment')}
      >
        {String(t('actions.back', 'Back'))}
      </Button>,
    ])
    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSubmitError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.name || !formData.equipmentType) {
      setSubmitError(t('lims.logistics.requiredFields', 'Please fill in all required fields'))
      return
    }

    try {
      const result = await createMutation.mutateAsync({
        name: formData.name,
        equipmentType: formData.equipmentType,
        manufacturer: formData.manufacturer || undefined,
        model: formData.model || undefined,
        serialNumber: formData.serialNumber || undefined,
        location: formData.location || undefined,
        status: formData.status as 'active' | 'maintenance' | 'retired' | 'decommissioned',
        purchaseDate: formData.purchaseDate || undefined,
        warrantyExpiry: formData.warrantyExpiry || undefined,
      })
      navigate(`/lims/logistics/equipment/${result.id || result._id}`)
    } catch (err: any) {
      setSubmitError(err.message || t('lims.logistics.createError', 'Failed to create equipment'))
    }
  }

  return (
    <Container>
      <Row>
        <Column md={12}>
          <Panel>
            <Panel.Header title={String(t('lims.logistics.newEquipment', 'New Equipment'))} />
            <Panel.Body>
              {submitError && (
                <Alert color="danger" title={String(t('states.error', 'Error'))} message={submitError} />
              )}

              <form onSubmit={handleSubmit}>
                <Row>
                  <Column md={6}>
                    <TextInputWithLabelFormGroup
                      label={String(t('lims.logistics.name', 'Name'))}
                      name="name"
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      isRequired
                      isEditable={true}
                    />
                  </Column>
                  <Column md={6}>
                    <SelectWithLableFormGroup
                      label={String(t('lims.logistics.equipmentType', 'Equipment Type'))}
                      name="equipmentType"
                      value={formData.equipmentType}
                      onChange={(e) => handleFieldChange('equipmentType', e.target.value)}
                      isRequired
                      isEditable={true}
                    >
                      <option value="analyzer">{String(t('lims.logistics.type.analyzer', 'Analyzer'))}</option>
                      <option value="centrifuge">{String(t('lims.logistics.type.centrifuge', 'Centrifuge'))}</option>
                      <option value="microscope">{String(t('lims.logistics.type.microscope', 'Microscope'))}</option>
                      <option value="refrigerator">{String(t('lims.logistics.type.refrigerator', 'Refrigerator'))}</option>
                      <option value="freezer">{String(t('lims.logistics.type.freezer', 'Freezer'))}</option>
                    </SelectWithLableFormGroup>
                  </Column>
                </Row>

                <Row>
                  <Column md={6}>
                    <TextInputWithLabelFormGroup
                      label={String(t('lims.logistics.manufacturer', 'Manufacturer'))}
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={(e) => handleFieldChange('manufacturer', e.target.value)}
                      isEditable={true}
                    />
                  </Column>
                  <Column md={6}>
                    <TextInputWithLabelFormGroup
                      label={String(t('lims.logistics.model', 'Model'))}
                      name="model"
                      value={formData.model}
                      onChange={(e) => handleFieldChange('model', e.target.value)}
                      isEditable={true}
                    />
                  </Column>
                </Row>

                <Row>
                  <Column md={6}>
                    <TextInputWithLabelFormGroup
                      label={String(t('lims.logistics.serialNumber', 'Serial Number'))}
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) => handleFieldChange('serialNumber', e.target.value)}
                      isEditable={true}
                    />
                  </Column>
                  <Column md={6}>
                    <TextInputWithLabelFormGroup
                      label={String(t('lims.logistics.location', 'Location'))}
                      name="location"
                      value={formData.location}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                      isEditable={true}
                    />
                  </Column>
                </Row>

                <Row>
                  <Column md={6}>
                    <SelectWithLableFormGroup
                      label={String(t('lims.logistics.status', 'Status'))}
                      name="status"
                      value={formData.status}
                      onChange={(e) => handleFieldChange('status', e.target.value)}
                      isRequired
                      isEditable={true}
                    >
                      <option value="active">{String(t('lims.logistics.status.active', 'Active'))}</option>
                      <option value="maintenance">{String(t('lims.logistics.status.maintenance', 'Maintenance'))}</option>
                      <option value="retired">{String(t('lims.logistics.status.retired', 'Retired'))}</option>
                      <option value="decommissioned">{String(t('lims.logistics.status.decommissioned', 'Decommissioned'))}</option>
                    </SelectWithLableFormGroup>
                  </Column>
                </Row>

                <Row>
                  <Column md={6}>
                    <DatePickerWithLabelFormGroup
                      label={String(t('lims.logistics.purchaseDate', 'Purchase Date'))}
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={(date) => handleFieldChange('purchaseDate', date)}
                      isEditable={true}
                    />
                  </Column>
                  <Column md={6}>
                    <DatePickerWithLabelFormGroup
                      label={String(t('lims.logistics.warrantyExpiry', 'Warranty Expiry'))}
                      name="warrantyExpiry"
                      value={formData.warrantyExpiry}
                      onChange={(date) => handleFieldChange('warrantyExpiry', date)}
                      isEditable={true}
                    />
                  </Column>
                </Row>

                <Row>
                  <Column md={12}>
                    <Button type="submit" color="primary" icon="save" iconLocation="left">
                      {String(t('actions.save', 'Save'))}
                    </Button>
                  </Column>
                </Row>
              </form>
            </Panel.Body>
          </Panel>
        </Column>
      </Row>
    </Container>
  )
}

export default NewEquipment

