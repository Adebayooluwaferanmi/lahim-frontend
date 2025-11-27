import React, { useState, useEffect, useCallback } from 'react'
import useTitle from '../../page-header/useTitle'
import { useTranslation } from 'react-i18next'
import format from 'date-fns/format'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import { Button } from '@hospitalrun/components'
import { useHistory } from 'react-router'

const Worklists = () => {
  const { t } = useTranslation()
  const history = useHistory()
  const setButtons = useButtonToolbarSetter()
  useTitle(t('lims.worklists.label'))

  const [worklists, setWorklists] = useState<any[]>([])

  const getButtons = useCallback(() => {
    return [
      <Button
        icon="add"
        onClick={() => history.push('/lims/worklists/generate')}
        outlined
        color="success"
        key="worklists.generate"
      >
        {t('lims.worklists.generate')}
      </Button>,
    ]
  }, [history, t])

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await fetch('/worklists')
        const data = await response.json()
        setWorklists(data.worklists || [])
      } catch (error) {
        console.error('Failed to fetch worklists:', error)
      }
    }

    setButtons(getButtons())
    fetch()

    return () => {
      setButtons([])
    }
  }, [getButtons, setButtons])

  const onTableRowClick = (worklist: any) => {
    history.push(`/lims/worklists/${worklist._id}`)
  }

  return (
    <>
      <table className="table table-hover">
        <thead className="thead-light">
          <tr>
            <th>{t('lims.worklists.date')}</th>
            <th>{t('lims.worklists.mode')}</th>
            <th>{t('lims.worklists.orderCount')}</th>
            <th>{t('lims.worklists.status')}</th>
          </tr>
        </thead>
        <tbody>
          {worklists.map((worklist) => (
            <tr onClick={() => onTableRowClick(worklist)} key={worklist._id}>
              <td>{worklist.date ? format(new Date(worklist.date), 'yyyy-MM-dd') : '-'}</td>
              <td>{worklist.mode || '-'}</td>
              <td>{worklist.orders?.length || 0}</td>
              <td>{worklist.status || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default Worklists

