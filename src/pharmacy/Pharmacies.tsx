import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, Spinner, Alert, Table } from '@hospitalrun/components'
import { usePharmacies, Pharmacy } from '../hooks/usePharmacy'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'

const breadcrumbs = [{ i18nKey: 'pharmacy.label', location: '/pharmacy' }]

const Pharmacies = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('pharmacy.label', 'Pharmacies'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined)

  const { data: pharmacies = [], isLoading, error } = usePharmacies({
    active: activeFilter,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="newPharmacyButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/pharmacy/new')}
      >
        {String(t('pharmacy.new', 'New Pharmacy'))}
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
          message={String(error.message || t('pharmacy.loadError', 'Failed to load pharmacies'))}
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
            <option value="">{String(t('pharmacy.allStatus', 'All Status'))}</option>
            <option value="true">{String(t('pharmacy.active', 'Active'))}</option>
            <option value="false">{String(t('pharmacy.inactive', 'Inactive'))}</option>
          </select>
        </Column>
      </Row>

      <Row className="mt-3">
        <Column>
          <Table
            data={pharmacies.map((pharmacy: Pharmacy) => ({
              id: pharmacy.id || pharmacy._id,
              name: pharmacy.name,
              address: pharmacy.address || '-',
              phone: pharmacy.phone || '-',
              email: pharmacy.email || '-',
              active: pharmacy.active ? t('pharmacy.active', 'Active') : t('pharmacy.inactive', 'Inactive'),
            }))}
            columns={[
              { label: t('pharmacy.name', 'Name'), key: 'name' },
              { label: t('pharmacy.address', 'Address'), key: 'address' },
              { label: t('pharmacy.phone', 'Phone'), key: 'phone' },
              { label: t('pharmacy.email', 'Email'), key: 'email' },
              { label: t('pharmacy.status', 'Status'), key: 'active' },
            ]}
            getID={(row: any) => row.id}
            actions={[
              {
                label: String(t('actions.view', 'View')),
                action: (row: any) => navigate(`/pharmacy/${row.id}`),
                buttonColor: 'primary',
              },
            ]}
          />
        </Column>
      </Row>
    </Container>
  )
}

export default Pharmacies


