import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@hospitalrun/components'
import { useCreateInsuranceProvider, InsuranceProvider } from '../hooks/useInsurance'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'
import SelectWithLableFormGroup from '../components/input/SelectWithLableFormGroup'

const breadcrumbs = [{ i18nKey: 'insurance.providers.new', location: '/insurance/providers/new' }]

const NewInsuranceProvider = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('insurance.providers.new', 'New Insurance Provider'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()
  const { mutate: createProvider, isPending: isLoading, error } = useCreateInsuranceProvider()

  const [formData, setFormData] = useState<Partial<InsuranceProvider>>({
    name: '',
    type: 'commercial',
    payerId: '',
    address: '',
    phone: '',
    email: '',
    active: true,
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.name) {
      setSubmitError(t('insurance.providers.requiredFields', 'Please fill in all required fields'))
      return
    }

    createProvider(formData as InsuranceProvider, {
      onSuccess: (data) => {
        navigate(`/insurance/providers/${data.id || data._id}`)
      },
      onError: (err: any) => {
        setSubmitError(err.message || t('insurance.providers.createError', 'Failed to create provider'))
      },
    })
  }

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="cancelButton"
        outlined
        color="secondary"
        onClick={() => navigate('/insurance/providers')}
      >
        {String(t('actions.cancel', 'Cancel'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  return (
    <Container>
      <Panel title={String(t('insurance.providers.new', 'New Insurance Provider'))}>
        {(submitError || error) && (
          <Alert
            color="danger"
            title={String(t('states.error', 'Error'))}
            message={String(submitError || (error as any)?.message || '')}
          />
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('insurance.providers.name', 'Name'))}
                name="name"
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isRequired
                isEditable
              />
            </Column>
            <Column md={6}>
              <SelectWithLableFormGroup
                label={String(t('insurance.providers.type', 'Type'))}
                name="type"
                value={formData.type || 'commercial'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                options={[
                  { label: t('insurance.providers.types.commercial', 'Commercial'), value: 'commercial' },
                  { label: t('insurance.providers.types.medicare', 'Medicare'), value: 'medicare' },
                  { label: t('insurance.providers.types.medicaid', 'Medicaid'), value: 'medicaid' },
                  { label: t('insurance.providers.types.nhia', 'NHIA'), value: 'nhia' },
                  { label: t('insurance.providers.types.other', 'Other'), value: 'other' },
                ]}
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('insurance.providers.payerId', 'Payer ID'))}
                name="payerId"
                type="text"
                value={formData.payerId || ''}
                onChange={(e) => setFormData({ ...formData, payerId: e.target.value })}
                isEditable
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('insurance.providers.phone', 'Phone'))}
                name="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column md={12}>
              <TextInputWithLabelFormGroup
                label={String(t('insurance.providers.address', 'Address'))}
                name="address"
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('insurance.providers.email', 'Email'))}
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <Button color="success" onClick={(e) => { e.preventDefault(); handleSubmit(e as any); }} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner color="blue" loading size={[16, 16]} type="ScaleLoader" />
                    {String(t('states.saving', 'Saving...'))}
                  </>
                ) : (
                  String(t('actions.save', 'Save'))
                )}
              </Button>
              <Button
                outlined
                color="secondary"
                onClick={() => navigate('/insurance/providers')}
                className="ml-2"
              >
                {String(t('actions.cancel', 'Cancel'))}
              </Button>
            </Column>
          </Row>
        </form>
      </Panel>
    </Container>
  )
}

export default NewInsuranceProvider


