import React, { useState, useEffect, useCallback } from 'react'
import useTitle from '../../page-header/useTitle'
import { useTranslation } from 'react-i18next'
import format from 'date-fns/format'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import { Button } from '@hospitalrun/components'
import { useHistory } from 'react-router'

const CriticalValues = () => {
  const { t } = useTranslation()
  const history = useHistory()
  const setButtons = useButtonToolbarSetter()
  useTitle(t('lims.criticalValues.label'))

  const [criticalValues, setCriticalValues] = useState<any[]>([])

  const getButtons = useCallback(() => {
    return []
  }, [])

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await fetch('/critical-values')
        const data = await response.json()
        setCriticalValues(data.criticalValues || [])
      } catch (error) {
        console.error('Failed to fetch critical values:', error)
      }
    }

    setButtons(getButtons())
    fetch()

    return () => {
      setButtons([])
    }
  }, [getButtons, setButtons])

  const onTableRowClick = (criticalValue: any) => {
    history.push(`/lims/critical-values/${criticalValue._id}`)
  }

  return (
    <>
      <table className="table table-hover">
        <thead className="thead-light">
          <tr>
            <th>{t('lims.criticalValues.testName')}</th>
            <th>{t('lims.criticalValues.value')}</th>
            <th>{t('lims.criticalValues.detectedOn')}</th>
            <th>{t('lims.criticalValues.status')}</th>
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
    </>
  )
}

export default CriticalValues

