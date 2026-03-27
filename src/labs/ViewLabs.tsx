import React, { useState, useEffect, useCallback } from 'react'
import useTitle from 'page-header/useTitle'
import { useTranslation } from 'react-i18next'
import format from 'date-fns/format'
import { useButtonToolbarSetter } from 'page-header/ButtonBarProvider'
import { Button } from '@lahim/components'
import { useNavigate } from 'react-router-dom'
import LabRepository from 'clients/db/LabRepository'
import SortRequest from 'clients/db/SortRequest'
import Lab from 'model/Lab'
import { useUserStore } from '../store/user-store'
import Permissions from 'model/Permissions'

const ViewLabs = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setButtons = useButtonToolbarSetter()
  useTitle(t('labs.label'))

  const permissions = useUserStore((state) => state.permissions)
  const [labs, setLabs] = useState<Lab[]>([])

  const getButtons = useCallback(() => {
    const buttons: React.ReactNode[] = []

    if (permissions.includes(Permissions.RequestLab)) {
      buttons.push(
        <Button
          icon="add"
          onClick={() => navigate('/labs/new')}
          outlined
          color="success"
          key="lab.requests.new"
        >
          {String(t('labs.requests.new'))}
        </Button>,
      )
    }

    return buttons
  }, [permissions, navigate, t])

  useEffect(() => {
    const fetch = async () => {
      const sortRequest: SortRequest = {
        sorts: [
          {
            field: 'requestedOn',
            direction: 'desc',
          },
        ],
      }
      const fetchedLabs = await LabRepository.findAll(sortRequest)
      setLabs(fetchedLabs)
    }

    setButtons(getButtons())
    fetch()

    return () => {
      setButtons([])
    }
  }, [getButtons, setButtons])

  const onTableRowClick = (lab: Lab) => {
    navigate(`/labs/${lab.id}`)
  }

  return (
    <>
      <table className="table table-hover">
        <thead className="thead-light">
          <tr>
            <th>{String(t('labs.lab.code'))}</th>
            <th>{String(t('labs.lab.type'))}</th>
            <th>{String(t('labs.lab.requestedOn'))}</th>
            <th>{String(t('labs.lab.status'))}</th>
          </tr>
        </thead>
        <tbody>
          {labs.map((lab) => (
            <tr onClick={() => onTableRowClick(lab)} key={lab.id}>
              <td>{lab.code}</td>
              <td>{lab.type}</td>
              <td>{format(new Date(lab.requestedOn), 'yyyy-MM-dd hh:mm a')}</td>
              <td>{lab.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default ViewLabs
