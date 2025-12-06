import React, { useCallback } from 'react'
import useTitle from '../../page-header/useTitle'
import { useTranslation } from 'react-i18next'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import { Button, Container, Spinner, Alert } from '@hospitalrun/components'
import { useNavigate } from 'react-router-dom'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useTestCatalog } from '../../hooks/useTestCatalog'

const breadcrumbs = [{ i18nKey: 'lims.testCatalog.label', location: '/lims/test-catalog' }]

const TestCatalog = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setButtons = useButtonToolbarSetter()
  useTitle(t('lims.testCatalog.label'))
  useAddBreadcrumbs(breadcrumbs, true)

  const { data, isLoading, error } = useTestCatalog()

  // Normalize response format
  const entries = data
    ? Array.isArray(data)
      ? data
      : (data as { entries?: any[] }).entries || []
    : []

  const getButtons = useCallback(() => {
    return [
      <Button
        icon="add"
        onClick={() => navigate('/lims/test-catalog/new')}
        outlined
        color="success"
        key="testCatalog.new"
      >
        {String(t('lims.testCatalog.new'))}
      </Button>,
    ]
  }, [navigate, t])

  React.useEffect(() => {
    setButtons(getButtons())

    return () => {
      setButtons([])
    }
  }, [setButtons, getButtons])

  const onTableRowClick = (entry: any) => {
    navigate(`/lims/test-catalog/${entry._id}`)
  }

  if (isLoading) {
    return (
      <Container>
        <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
      </Container>
    )
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : (error as any)?.message || String(error) || t('lims.testCatalog.loadError', 'Failed to load test catalog')
    return (
      <Container>
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={errorMessage} />
      </Container>
    )
  }

  return (
    <Container>
      {entries.length === 0 ? (
        <Alert color="info" title={String(t('lims.testCatalog.noEntries', 'No Test Catalog Entries'))} message={String(t('lims.testCatalog.noEntriesMessage', 'No test catalog entries found'))} />
      ) : (
        <table className="table table-hover">
        <thead className="thead-light">
          <tr>
            <th>{String(t('lims.testCatalog.code'))}</th>
            <th>{String(t('lims.testCatalog.name'))}</th>
            <th>{String(t('lims.testCatalog.department'))}</th>
            <th>{String(t('lims.testCatalog.active'))}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr onClick={() => onTableRowClick(entry)} key={entry._id}>
              <td>{entry.code}</td>
              <td>{entry.name}</td>
              <td>{entry.department || '-'}</td>
              <td>{entry.active ? String(t('common.yes')) : String(t('common.no'))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </Container>
  )
}

export default TestCatalog

