import React, { useState, useEffect, useCallback } from 'react'
import useTitle from '../../page-header/useTitle'
import { useTranslation } from 'react-i18next'
import format from 'date-fns/format'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import { Button } from '@hospitalrun/components'
import { useHistory } from 'react-router'

const Specimens = () => {
  const { t } = useTranslation()
  const history = useHistory()
  const setButtons = useButtonToolbarSetter()
  useTitle(t('lims.specimens.label'))

  const [specimens, setSpecimens] = useState<any[]>([])

  const getButtons = useCallback(() => {
    return [
      <Button
        icon="add"
        onClick={() => history.push('/lims/specimens/new')}
        outlined
        color="success"
        key="specimens.new"
      >
        {t('lims.specimens.new')}
      </Button>,
    ]
  }, [history, t])

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await fetch('/specimens')
        const data = await response.json()
        setSpecimens(data.specimens || [])
      } catch (error) {
        console.error('Failed to fetch specimens:', error)
      }
    }

    setButtons(getButtons())
    fetch()

    return () => {
      setButtons([])
    }
  }, [getButtons, setButtons])

  const onTableRowClick = (specimen: any) => {
    history.push(`/lims/specimens/${specimen._id}`)
  }

  return (
    <>
      <table className="table table-hover">
        <thead className="thead-light">
          <tr>
            <th>{t('lims.specimens.specimenId')}</th>
            <th>{t('lims.specimens.specimenType')}</th>
            <th>{t('lims.specimens.collectedOn')}</th>
            <th>{t('lims.specimens.status')}</th>
          </tr>
        </thead>
        <tbody>
          {specimens.map((specimen) => (
            <tr onClick={() => onTableRowClick(specimen)} key={specimen._id}>
              <td>{specimen._id}</td>
              <td>{specimen.specimenType || '-'}</td>
              <td>{specimen.collectedOn ? format(new Date(specimen.collectedOn), 'yyyy-MM-dd hh:mm a') : '-'}</td>
              <td>{specimen.status || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default Specimens

