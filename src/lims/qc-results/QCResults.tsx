import React, { useState, useEffect, useCallback } from 'react'
import useTitle from '../../page-header/useTitle'
import { useTranslation } from 'react-i18next'
import format from 'date-fns/format'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import { Button } from '@hospitalrun/components'
import { useHistory } from 'react-router'

const QCResults = () => {
  const { t } = useTranslation()
  const history = useHistory()
  const setButtons = useButtonToolbarSetter()
  useTitle(t('lims.qcResults.label'))

  const [results, setResults] = useState<any[]>([])

  const getButtons = useCallback(() => {
    return [
      <Button
        icon="add"
        onClick={() => history.push('/lims/qc-results/new')}
        outlined
        color="success"
        key="qcResults.new"
      >
        {t('lims.qcResults.new')}
      </Button>,
    ]
  }, [history, t])

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await fetch('/qc-results')
        const data = await response.json()
        setResults(data.results || [])
      } catch (error) {
        console.error('Failed to fetch QC results:', error)
      }
    }

    setButtons(getButtons())
    fetch()

    return () => {
      setButtons([])
    }
  }, [getButtons, setButtons])

  const onTableRowClick = (result: any) => {
    history.push(`/lims/qc-results/${result._id}`)
  }

  return (
    <>
      <table className="table table-hover">
        <thead className="thead-light">
          <tr>
            <th>{t('lims.qcResults.testCode')}</th>
            <th>{t('lims.qcResults.materialId')}</th>
            <th>{t('lims.qcResults.runDate')}</th>
            <th>{t('lims.qcResults.result')}</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr onClick={() => onTableRowClick(result)} key={result._id}>
              <td>{result.testCode?.coding?.[0]?.code || result.testCode || '-'}</td>
              <td>{result.materialId || '-'}</td>
              <td>{result.runDate ? format(new Date(result.runDate), 'yyyy-MM-dd hh:mm a') : '-'}</td>
              <td>{result.result || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default QCResults

