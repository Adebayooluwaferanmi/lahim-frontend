import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@hospitalrun/components'
import { useCreatePharmacy, Pharmacy } from '../hooks/usePharmacy'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'

const breadcrumbs = [{ i18nKey: 'pharmacy.new', location: '/pharmacy/new' }]

const NewPharmacy = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('pharmacy.new', 'New Pharmacy'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()
  const { mutate: createPharmacy, isPending: isLoading, error } = useCreatePharmacy()

  const [formData, setFormData] = useState<Partial<Pharmacy>>({
    name: '',
    address: '',
    phone: '',
    email: '',
    contactPerson: '',
    active: true,
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.name) {
      setSubmitError(t('pharmacy.requiredFields', 'Please fill in all required fields'))
      return
    }

    createPharmacy(formData as Pharmacy, {
      onSuccess: (data) => {
        navigate(`/pharmacy/${data.id || data._id}`)
      },
      onError: (err: any) => {
        setSubmitError(err.message || t('pharmacy.createError', 'Failed to create pharmacy'))
      },
    })
  }

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="cancelButton"
        outlined
        color="secondary"
        onClick={() => navigate('/pharmacy')}
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
      <Panel title={String(t('pharmacy.new', 'New Pharmacy'))}>
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
                label={String(t('pharmacy.name', 'Name'))}
                name="name"
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isRequired
                isEditable
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('pharmacy.contactPerson', 'Contact Person'))}
                name="contactPerson"
                type="text"
                value={formData.contactPerson || ''}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column md={12}>
              <TextInputWithLabelFormGroup
                label={String(t('pharmacy.address', 'Address'))}
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
                label={String(t('pharmacy.phone', 'Phone'))}
                name="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                isEditable
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('pharmacy.email', 'Email'))}
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
                onClick={() => navigate('/pharmacy')}
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

export default NewPharmacy


