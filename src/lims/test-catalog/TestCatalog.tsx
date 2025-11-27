import React, { useState, useEffect, useCallback } from 'react'
import useTitle from '../../page-header/useTitle'
import { useTranslation } from 'react-i18next'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import { Button } from '@hospitalrun/components'
import { useNavigate } from 'react-router-dom'

const TestCatalog = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setButtons = useButtonToolbarSetter()
  useTitle(t('lims.testCatalog.label'))

  const [entries, setEntries] = useState<any[]>([])

  const getButtons = useCallback(() => {
    return [
      <Button
        icon="add"
        onClick={() => navigate('/lims/test-catalog/new')}
        outlined
        color="success"
        key="testCatalog.new"
      >
        {t('lims.testCatalog.new')}
      </Button>,
    ]
  }, [navigate, t])

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await fetch('/test-catalog')
        const data = await response.json()
        setEntries(data.entries || [])
      } catch (error) {
        console.error('Failed to fetch test catalog:', error)
      }
    }

    setButtons(getButtons())
    fetch()

    return () => {
      setButtons([])
    }
  }, [getButtons, setButtons])

  const onTableRowClick = (entry: any) => {
    history.push(`/lims/test-catalog/${entry._id}`)
  }

  return (
    <>
      <table className="table table-hover">
        <thead className="thead-light">
          <tr>
            <th>{t('lims.testCatalog.code')}</th>
            <th>{t('lims.testCatalog.name')}</th>
            <th>{t('lims.testCatalog.department')}</th>
            <th>{t('lims.testCatalog.active')}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr onClick={() => onTableRowClick(entry)} key={entry._id}>
              <td>{entry.code}</td>
              <td>{entry.name}</td>
              <td>{entry.department || '-'}</td>
              <td>{entry.active ? t('common.yes') : t('common.no')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default TestCatalog

