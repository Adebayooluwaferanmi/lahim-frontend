import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, Spinner, Alert, Table } from '@lahim/components'
import { useInsuranceProviders, InsuranceProvider } from '../hooks/useInsurance'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'

const breadcrumbs = [{ i18nKey: 'insurance.providers.label', location: '/insurance/providers' }]

const InsuranceProviders = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('insurance.providers.label', 'Insurance Providers'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined)

  const { data: providers = [], isLoading, error } = useInsuranceProviders({
    active: activeFilter,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="newProviderButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/insurance/providers/new')}
      >
        {String(t('insurance.providers.new', 'New Provider'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  if (isLoading) {
    return (
      <Container>
        <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Alert
          color="danger"
          title={String(t('states.error', 'Error'))}
          message={String(error.message || t('insurance.providers.loadError', 'Failed to load providers'))}
        />
      </Container>
    )
  }

  return (
    <Container>
      <Row>
        <Column md={4}>
          <select
            className="form-control"
            value={activeFilter === undefined ? '' : activeFilter ? 'true' : 'false'}
            onChange={(e) => {
              const value = e.target.value
              setActiveFilter(value === '' ? undefined : value === 'true')
            }}
          >
            <option value="">{String(t('insurance.providers.allStatus', 'All Status'))}</option>
            <option value="true">{String(t('insurance.providers.active', 'Active'))}</option>
            <option value="false">{String(t('insurance.providers.inactive', 'Inactive'))}</option>
          </select>
        </Column>
      </Row>

      <Row className="mt-3">
        <Column>
          <Table
            data={providers.map((provider: InsuranceProvider) => ({
              id: provider.id || provider._id,
              name: provider.name,
              type: provider.type || '-',
              payerId: provider.payerId || '-',
              phone: provider.phone || '-',
              active: provider.active ? t('insurance.providers.active', 'Active') : t('insurance.providers.inactive', 'Inactive'),
            }))}
            columns={[
              { label: t('insurance.providers.name', 'Name'), key: 'name' },
              { label: t('insurance.providers.type', 'Type'), key: 'type' },
              { label: t('insurance.providers.payerId', 'Payer ID'), key: 'payerId' },
              { label: t('insurance.providers.phone', 'Phone'), key: 'phone' },
              { label: t('insurance.providers.status', 'Status'), key: 'active' },
            ]}
            getID={(row: any) => row.id}
            actions={[
              {
                label: String(t('actions.view', 'View')),
                action: (row: any) => navigate(`/insurance/providers/${row.id}`),
                buttonColor: 'primary',
              },
            ]}
          />
        </Column>
      </Row>
    </Container>
  )
}

export default InsuranceProviders
