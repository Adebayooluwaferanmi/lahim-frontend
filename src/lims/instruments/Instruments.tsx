import React, { useState, useEffect, useCallback } from 'react'
import useTitle from '../../page-header/useTitle'
import { useTranslation } from 'react-i18next'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import { Button } from '@hospitalrun/components'
import { useHistory } from 'react-router'

const Instruments = () => {
  const { t } = useTranslation()
  const history = useHistory()
  const setButtons = useButtonToolbarSetter()
  useTitle(t('lims.instruments.label'))

  const [instruments, setInstruments] = useState<any[]>([])

  const getButtons = useCallback(() => {
    return [
      <Button
        icon="add"
        onClick={() => history.push('/lims/instruments/new')}
        outlined
        color="success"
        key="instruments.new"
      >
        {t('lims.instruments.new')}
      </Button>,
    ]
  }, [history, t])

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await fetch('/instruments')
        const data = await response.json()
        setInstruments(data.instruments || [])
      } catch (error) {
        console.error('Failed to fetch instruments:', error)
      }
    }

    setButtons(getButtons())
    fetch()

    return () => {
      setButtons([])
    }
  }, [getButtons, setButtons])

  const onTableRowClick = (instrument: any) => {
    history.push(`/lims/instruments/${instrument._id}`)
  }

  return (
    <>
      <table className="table table-hover">
        <thead className="thead-light">
          <tr>
            <th>{t('lims.instruments.name')}</th>
            <th>{t('lims.instruments.type')}</th>
            <th>{t('lims.instruments.status')}</th>
          </tr>
        </thead>
        <tbody>
          {instruments.map((instrument) => (
            <tr onClick={() => onTableRowClick(instrument)} key={instrument._id}>
              <td>{instrument.name}</td>
              <td>{instrument.type || '-'}</td>
              <td>{instrument.status || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default Instruments

