import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, Spinner, Alert } from '@lahim/components'
import { useInstruments } from '../../hooks/useInstruments'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'

const breadcrumbs = [{ i18nKey: 'lims.instruments.label', location: '/lims/instruments' }]

const Instruments = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.instruments.label', 'Instruments'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const { data: instruments = [], isLoading, error } = useInstruments()

  React.useEffect(() => {
    setButtonToolBar([])
    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar])

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
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={String(error.message || t('lims.instruments.loadError', 'Failed to load instruments'))} />
      </Container>
    )
  }

  return (
    <Container>
      <Row>
        <Column>
          {instruments.length === 0 ? (
            <div>{String(t('lims.instruments.noInstruments', 'No instruments found'))}</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{String(t('lims.instruments.name', 'Name'))}</th>
                  <th>{String(t('lims.instruments.manufacturer', 'Manufacturer'))}</th>
                  <th>{String(t('lims.instruments.model', 'Model'))}</th>
                  <th>{String(t('lims.instruments.section', 'Section'))}</th>
                  <th>{String(t('lims.instruments.status', 'Status'))}</th>
                  <th>{String(t('actions.view', 'View'))}</th>
                </tr>
              </thead>
              <tbody>
                {instruments.map((instrument) => (
                  <tr key={instrument.id || instrument._id}>
                    <td>{instrument.name || '-'}</td>
                    <td>{instrument.manufacturer || '-'}</td>
                    <td>{instrument.model || '-'}</td>
                    <td>{instrument.section || '-'}</td>
                    <td>
                      <span className={`badge badge-${instrument.status === 'active' ? 'success' : 'warning'}`}>
                        {instrument.status || '-'}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/lims/instruments/${instrument.id || instrument._id}`)}
                      >
                        {String(t('actions.view', 'View'))}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Column>
      </Row>
    </Container>
  )
}

export default Instruments

