import React, { useEffect, useState } from 'react'
import useTitle from 'page-header/useTitle'
import { useParams, useNavigate } from 'react-router-dom'
import { Spinner, Button, Modal, Toast } from '@lahim/components'
import { useTranslation } from 'react-i18next'
import { useButtonToolbarSetter } from 'page-header/ButtonBarProvider'
import Permissions from 'model/Permissions'
import { useAppointmentStore } from 'store/appointment-store'
import { useUserStore } from 'store/user-store'
import AppointmentDetailForm from '../AppointmentDetailForm'
import { getAppointmentLabel } from '../util/scheduling-appointment.util'
import useAddBreadcrumbs from '../../../breadcrumbs/useAddBreadcrumbs'

const ViewAppointment = () => {
  const { t } = useTranslation()
  useTitle(t('scheduling.appointments.viewAppointment'))
  const { id } = useParams()
  const navigate = useNavigate()
  const { appointment, patient, isLoading, fetchAppointment, deleteAppointment } = useAppointmentStore()
  const permissions = useUserStore((s) => s.permissions)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false)
  const setButtonToolBar = useButtonToolbarSetter()

  const breadcrumbs = [
    { i18nKey: 'scheduling.appointments.label', location: '/appointments' },
    { text: getAppointmentLabel(appointment), location: `/patients/${appointment.id}` },
  ]
  useAddBreadcrumbs(breadcrumbs, true)

  const onAppointmentDeleteButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setShowDeleteConfirmation(true)
  }

  const onDeleteSuccess = () => {
    navigate('/appointments')
    Toast('success', t('states.success'), t('scheduling.appointment.successfullyDeleted'))
  }

  const onDeleteConfirmationButtonClick = () => {
    deleteAppointment(appointment, onDeleteSuccess)
    setShowDeleteConfirmation(false)
  }

  useEffect(() => {
    const buttons = []
    if (permissions.includes(Permissions.WriteAppointments)) {
      buttons.push(
        <Button
          key="editAppointmentButton"
          color="success"
          icon="edit"
          outlined
          onClick={() => {
            navigate(`/appointments/edit/${appointment.id}`)
          }}
        >
          {String(t('actions.edit'))}
        </Button>,
      )
    }

    if (permissions.includes(Permissions.DeleteAppointment)) {
      buttons.push(
        <Button
          key="deleteAppointmentButton"
          color="danger"
          icon="appointment-remove"
          onClick={onAppointmentDeleteButtonClick}
        >
          {String(t('scheduling.appointments.deleteAppointment'))}
        </Button>,
      )
    }

    setButtonToolBar(buttons)
  }, [appointment.id, navigate, permissions, setButtonToolBar, t])

  useEffect(() => {
    if (id) {
      fetchAppointment(id)
    }

    return () => {
      setButtonToolBar([])
    }
  }, [fetchAppointment, id, setButtonToolBar])

  if (!appointment.id || isLoading) {
    return <Spinner type="BarLoader" loading />
  }

  return (
    <div className="appointment-detail-container">
      <div className="form-container">
        <AppointmentDetailForm appointment={appointment} isEditable={false} patient={patient} />
      </div>
      <Modal
        body={String(t('scheduling.appointment.deleteConfirmationMessage'))}
        buttonsAlignment="right"
        show={showDeleteConfirmation}
        closeButton={{
          children: String(t('actions.delete')),
          color: 'danger',
          onClick: onDeleteConfirmationButtonClick,
        }}
        title={String(t('actions.confirmDelete'))}
        toggle={() => setShowDeleteConfirmation(false)}
      />
    </div>
  )
}

export default ViewAppointment
