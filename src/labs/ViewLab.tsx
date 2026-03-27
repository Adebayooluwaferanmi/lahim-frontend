import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import format from 'date-fns/format'
import Lab from 'model/Lab'
import Patient from 'model/Patient'
import useTitle from 'page-header/useTitle'
import { useTranslation } from 'react-i18next'
import { Row, Column, Badge, Button, Alert } from '@lahim/components'
import TextFieldWithLabelFormGroup from 'components/input/TextFieldWithLabelFormGroup'
import useAddBreadcrumbs from 'breadcrumbs/useAddBreadcrumbs'
import Permissions from 'model/Permissions'
import { useLabStore } from '../store/lab-store'
import { useUserStore } from '../store/user-store'

const getTitle = (patient: Patient | undefined, lab: Lab | undefined) =>
  patient && lab ? `${lab.type} for ${patient.fullName}(${lab.code})` : ''

const ViewLab = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const permissions = useUserStore((s) => s.permissions)
  const { lab, patient, status, error, fetchLab, updateLab, completeLab, cancelLab } = useLabStore()

  const [labToView, setLabToView] = useState<Lab>()
  const [isEditable, setIsEditable] = useState<boolean>(true)

  useTitle(getTitle(patient, labToView))

  const breadcrumbs = [
    {
      i18nKey: 'labs.requests.view',
      location: `/labs/${labToView?.id}`,
    },
  ]
  useAddBreadcrumbs(breadcrumbs)

  useEffect(() => {
    if (id) {
      fetchLab(id)
    }
  }, [id, fetchLab])

  useEffect(() => {
    if (lab) {
      setLabToView({ ...lab })
      setIsEditable(lab.status === 'requested')
    }
  }, [lab])

  const onResultChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const result = event.currentTarget.value
    const newLab = labToView as Lab
    setLabToView({ ...newLab, result })
  }

  const onNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const notes = event.currentTarget.value
    const newLab = labToView as Lab
    setLabToView({ ...newLab, notes })
  }

  const onUpdate = async () => {
    const onSuccess = () => {
      navigate('/labs')
    }
    if (labToView) {
      updateLab(labToView, onSuccess)
    }
  }

  const onComplete = async () => {
    const onSuccess = () => {
      navigate('/labs')
    }

    if (labToView) {
      completeLab(labToView, onSuccess)
    }
  }

  const onCancel = async () => {
    const onSuccess = () => {
      navigate('/labs')
    }

    if (labToView) {
      cancelLab(labToView, onSuccess)
    }
  }

  const getButtons = () => {
    const buttons: React.ReactNode[] = []
    if (labToView?.status === 'completed' || labToView?.status === 'canceled') {
      return buttons
    }

    buttons.push(
      <Button className="mr-2" color="success" onClick={onUpdate} key="actions.update">
        {String(t('actions.update'))}
      </Button>,
    )

    if (permissions.includes(Permissions.CompleteLab)) {
      buttons.push(
        <Button className="mr-2" onClick={onComplete} color="primary" key="labs.requests.complete">
          {String(t('labs.requests.complete'))}
        </Button>,
      )
    }

    if (permissions.includes(Permissions.CancelLab)) {
      buttons.push(
        <Button onClick={onCancel} color="danger" key="labs.requests.cancel">
          {String(t('labs.requests.cancel'))}
        </Button>,
      )
    }

    return buttons
  }

  if (labToView && patient) {
    const getBadgeColor = () => {
      if (labToView.status === 'completed') {
        return 'primary'
      }
      if (labToView.status === 'canceled') {
        return 'danger'
      }
      return 'warning'
    }

    const getCanceledOnOrCompletedOnDate = () => {
      if (labToView.status === 'completed' && labToView.completedOn) {
        return (
          <Column>
            <div className="form-group completed-on">
              <h4>{String(t('labs.lab.completedOn'))}</h4>
              <h5>{format(new Date(labToView.completedOn), 'yyyy-MM-dd hh:mm a')}</h5>
            </div>
          </Column>
        )
      }
      if (labToView.status === 'canceled' && labToView.canceledOn) {
        return (
          <Column>
            <div className="form-group canceled-on">
              <h4>{String(t('labs.lab.canceledOn'))}</h4>
              <h5>{format(new Date(labToView.canceledOn), 'yyyy-MM-dd hh:mm a')}</h5>
            </div>
          </Column>
        )
      }
      return <></>
    }

    return (
      <>
        {status === 'error' && (
          <Alert color="danger" title={String(t('states.error'))} message={String(t(error.message || ''))} />
        )}
        <Row>
          <Column>
            <div className="form-group lab-status">
              <h4>{String(t('labs.lab.status'))}</h4>
              <Badge color={getBadgeColor()}>
                <h5>{labToView.status}</h5>
              </Badge>
            </div>
          </Column>
          <Column>
            <div className="form-group for-patient">
              <h4>{String(t('labs.lab.for'))}</h4>
              <h5>{patient.fullName}</h5>
            </div>
          </Column>
          <Column>
            <div className="form-group lab-type">
              <h4>{String(t('labs.lab.type'))}</h4>
              <h5>{labToView.type}</h5>
            </div>
          </Column>
          <Column>
            <div className="form-group requested-on">
              <h4>{String(t('labs.lab.requestedOn'))}</h4>
              <h5>{format(new Date(labToView.requestedOn), 'yyyy-MM-dd hh:mm a')}</h5>
            </div>
          </Column>
          {getCanceledOnOrCompletedOnDate()}
        </Row>
        <div className="border-bottom" />
        <form>
          <TextFieldWithLabelFormGroup
            name="result"
            label={String(t('labs.lab.result'))}
            value={labToView.result}
            isEditable={isEditable}
            isInvalid={!!error.result}
            feedback={t(error.result as string)}
            onChange={onResultChange}
          />
          <TextFieldWithLabelFormGroup
            name="notes"
            label={String(t('labs.lab.notes'))}
            value={labToView.notes}
            isEditable={isEditable}
            onChange={onNotesChange}
          />
          {isEditable && (
            <div className="row float-right">
              <div className="btn-group btn-group-lg mt-3">{getButtons()}</div>
            </div>
          )}
        </form>
      </>
    )
  }
  return <h1>Loading...</h1>
}

export default ViewLab
