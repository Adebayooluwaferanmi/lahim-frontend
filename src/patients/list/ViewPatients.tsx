import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Spinner, Button, Container, Row, TextInput, Column } from '@lahim/components'
import { useButtonToolbarSetter } from 'page-header/ButtonBarProvider'
import format from 'date-fns/format'
import { usePatientsStore } from '../../store/patients-store'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import useDebounce from '../../hooks/debounce'

const breadcrumbs = [{ i18nKey: 'patients.label', location: '/patients' }]

const ViewPatients = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('patients.label'))
  useAddBreadcrumbs(breadcrumbs, true)
  const patients = usePatientsStore((s) => s.patients)
  const isLoading = usePatientsStore((s) => s.isLoading)
  const fetchPatients = usePatientsStore((s) => s.fetchPatients)
  const searchPatients = usePatientsStore((s) => s.searchPatients)

  const setButtonToolBar = useButtonToolbarSetter()

  const [searchText, setSearchText] = useState<string>('')

  const debouncedSearchText = useDebounce(searchText, 500)

  useEffect(() => {
    searchPatients(debouncedSearchText)
  }, [searchPatients, debouncedSearchText])

  useEffect(() => {
    fetchPatients()

    setButtonToolBar([
      <Button
        key="newPatientButton"
        outlined
        color="success"
        icon="patient-add"
        onClick={() => navigate('/patients/new')}
      >
        {String(t('patients.newPatient'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [fetchPatients, setButtonToolBar, t])

  const loadingIndicator = <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  const table = (
    <table className="table table-hover">
      <thead className="thead-light ">
        <tr>
          <th>{String(t('patient.code'))}</th>
          <th>{String(t('patient.givenName'))}</th>
          <th>{String(t('patient.familyName'))}</th>
          <th>{String(t('patient.sex'))}</th>
          <th>{String(t('patient.dateOfBirth'))}</th>
        </tr>
      </thead>
      <tbody>
        {patients.map((p) => (
          <tr key={p.id} onClick={() => navigate(`/patients/${p.id}`)}>
            <td>{p.code}</td>
            <td>{p.givenName}</td>
            <td>{p.familyName}</td>
            <td>{p.sex}</td>
            <td>{p.dateOfBirth ? format(new Date(p.dateOfBirth), 'yyyy-MM-dd') : ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  const onSearchBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
  }

  return (
    <Container>
      <Row>
        <Column md={12}>
          <TextInput
            size="lg"
            type="text"
            onChange={onSearchBoxChange}
            value={searchText}
            placeholder={String(t('actions.search'))}
          />
        </Column>
      </Row>

      <Row> {isLoading ? loadingIndicator : table}</Row>
    </Container>
  )
}

export default ViewPatients
