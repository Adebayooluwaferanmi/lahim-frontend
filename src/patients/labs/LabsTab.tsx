import React, { useEffect, useState } from 'react'
import { Alert } from '@lahim/components'
import { useTranslation } from 'react-i18next'
import format from 'date-fns/format'
import { useNavigate } from 'react-router-dom'
import Lab from '../../model/Lab'
import LabRepository from '../../clients/db/LabRepository'

interface Props {
  patientId: string
}

const LabsTab = (props: Props) => {
  const navigate = useNavigate()
  const { patientId } = props
  const { t } = useTranslation()

  const [labs, setLabs] = useState<Lab[]>([])

  useEffect(() => {
    const fetch = async () => {
      const fetchedLabs = await LabRepository.findAllByPatientId(patientId)
      setLabs(fetchedLabs)
    }

    fetch()
  }, [patientId])

  const onTableRowClick = (lab: Lab) => {
    navigate(`/labs/${lab.id}`)
  }

  return (
    <div>
      {(!labs || labs.length === 0) && (
        <Alert
          color="warning"
          title={String(t('patient.labs.warning.noLabs'))}
          message={String(t('patient.labs.noLabsMessage'))}
        />
      )}
      {labs && labs.length > 0 && (
        <table className="table table-hover">
          <thead className="thead-light">
            <tr>
              <th>{String(t('labs.lab.type'))}</th>
              <th>{String(t('labs.lab.requestedOn'))}</th>
              <th>{String(t('labs.lab.status'))}</th>
            </tr>
          </thead>
          <tbody>
            {labs.map((lab) => (
              <tr onClick={() => onTableRowClick(lab)} key={lab.id}>
                <td>{lab.type}</td>
                <td>{format(new Date(lab.requestedOn), 'yyyy-MM-dd hh:mm a')}</td>
                <td>{lab.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default LabsTab
