import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../store'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Spinner, Button, Container, Row, TextInput, Column } from '@hospitalrun/components'
import { useButtonToolbarSetter } from 'page-header/ButtonBarProvider'
import format from 'date-fns/format'
import { RootState } from '../../store'
import { fetchPatients, searchPatients } from '../patients-slice'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import useDebounce from '../../hooks/debounce'

const breadcrumbs = [{ i18nKey: 'patients.label', location: '/patients' }]

const ViewPatients = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('patients.label'))
  useAddBreadcrumbs(breadcrumbs, true)
  const dispatch = useAppDispatch()
  const { patients, isLoading } = useSelector((state: RootState) => state.patients)

  const setButtonToolBar = useButtonToolbarSetter()

  const [searchText, setSearchText] = useState<string>('')

  const debouncedSearchText = useDebounce(searchText, 500)

  useEffect(() => {
    dispatch(searchPatients(debouncedSearchText))
  }, [dispatch, debouncedSearchText])

  useEffect(() => {
    dispatch(fetchPatients())

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
  }, [dispatch, setButtonToolBar, t, history])

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
