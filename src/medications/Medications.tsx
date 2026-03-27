import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, TextInput, Spinner, Alert, Table } from '@lahim/components'
import { useMedications } from '../hooks/useMedications'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { Medication } from '../model/Medication'

const breadcrumbs = [{ i18nKey: 'medications.label', location: '/medications' }]

const Medications = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('medications.label', 'Medications'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [searchTerm, setSearchTerm] = useState('')

  const { data: medications = [], isLoading, error } = useMedications({
    search: searchTerm || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="newMedicationButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/medications/new')}
      >
        {String(t('medications.new', 'New Medication'))}
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
          message={String(error.message || t('medications.loadError', 'Failed to load medications'))}
        />
      </Container>
    )
  }

  return (
    <Container>
      <Row>
        <Column md={6}>
          <TextInput
            placeholder={String(t('medications.searchPlaceholder', 'Search medications...'))}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Column>
      </Row>

      <Row className="mt-3">
        <Column>
          <Table
            data={medications.map((med: Medication) => ({
              id: med.id || med._id,
              name: med.name,
              genericName: med.genericName || '-',
              form: med.form || '-',
              strength: med.strength || '-',
              actions: (
                <Button
                  color="primary"
                  onClick={() => navigate(`/medications/${med.id || med._id}`)}
                >
                  {String(t('actions.view', 'View'))}
                </Button>
              ),
            }))}
            columns={[
              { label: t('medications.name', 'Name'), key: 'name' },
              { label: t('medications.genericName', 'Generic Name'), key: 'genericName' },
              { label: t('medications.form', 'Form'), key: 'form' },
              { label: t('medications.strength', 'Strength'), key: 'strength' },
              { label: t('actions.label', 'Actions'), key: 'actions' },
            ]}
          />
        </Column>
      </Row>
    </Container>
  )
}

export default Medications

