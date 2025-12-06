import React, { useCallback } from 'react'
import useTitle from '../../page-header/useTitle'
import { useTranslation } from 'react-i18next'
import format from 'date-fns/format'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import { useNavigate } from 'react-router-dom'
import { Container, Spinner, Alert } from '@hospitalrun/components'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useApiQuery } from '../../lib/queries'

const breadcrumbs = [{ i18nKey: 'lims.criticalValues.label', location: '/lims/critical-values' }]

const CriticalValues = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setButtons = useButtonToolbarSetter()
  useTitle(t('lims.criticalValues.label'))
  useAddBreadcrumbs(breadcrumbs, true)

  const { data, isLoading, error } = useApiQuery<{ criticalValues?: any[] }>(
    ['critical-values'],
    '/critical-values'
  )

  // Normalize response format
  const criticalValues = data?.criticalValues || []

  const getButtons = useCallback(() => {
    return []
  }, [])

  React.useEffect(() => {
    setButtons(getButtons())

    return () => {
      setButtons([])
    }
  }, [setButtons, getButtons])

  const onTableRowClick = (criticalValue: any) => {
    navigate(`/lims/critical-values/${criticalValue._id}`)
  }

  if (isLoading) {
    return (
      <Container>
        <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
      </Container>
    )
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : (error as any)?.message || String(error) || t('lims.criticalValues.loadError', 'Failed to load critical values')
    return (
      <Container>
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={errorMessage} />
      </Container>
    )
  }

  return (
    <Container>
      {criticalValues.length === 0 ? (
        <Alert color="info" title={String(t('lims.criticalValues.noValues', 'No Critical Values'))} message={String(t('lims.criticalValues.noValuesMessage', 'No critical values found'))} />
      ) : (
        <table className="table table-hover">
        <thead className="thead-light">
          <tr>
            <th>{String(t('lims.criticalValues.testName'))}</th>
            <th>{String(t('lims.criticalValues.value'))}</th>
            <th>{String(t('lims.criticalValues.detectedOn'))}</th>
            <th>{String(t('lims.criticalValues.status'))}</th>
          </tr>
        </thead>
        <tbody>
          {criticalValues.map((cv) => (
            <tr onClick={() => onTableRowClick(cv)} key={cv._id}>
              <td>{cv.testName || '-'}</td>
              <td>{cv.value} {cv.unit || ''}</td>
              <td>{cv.detectedOn ? format(new Date(cv.detectedOn), 'yyyy-MM-dd hh:mm a') : '-'}</td>
              <td>{cv.status || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </Container>
  )
}

export default CriticalValues

