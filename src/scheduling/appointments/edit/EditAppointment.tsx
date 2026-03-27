import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Spinner, Button } from '@lahim/components'
import { isBefore } from 'date-fns'

import AppointmentDetailForm from '../AppointmentDetailForm'
import useTitle from '../../../page-header/useTitle'
import Appointment from '../../../model/Appointment'
import { useAppointmentStore } from '../../../store/appointment-store'
import { getAppointmentLabel } from '../util/scheduling-appointment.util'
import useAddBreadcrumbs from '../../../breadcrumbs/useAddBreadcrumbs'

const EditAppointment = () => {
  const { t } = useTranslation()
  useTitle(t('scheduling.appointments.editAppointment'))
  const navigate = useNavigate()
  const { appointment: storeAppointment, patient, isLoading, fetchAppointment, updateAppointment } =
    useAppointmentStore()

  const [appointment, setAppointment] = useState({} as Appointment)
  const [errorMessage, setErrorMessage] = useState('')
  const breadcrumbs = [
    { i18nKey: 'scheduling.appointments.label', location: '/appointments' },
    {
      text: getAppointmentLabel(storeAppointment),
      location: `/appointments/${storeAppointment.id}`,
    },
    {
      i18nKey: 'scheduling.appointments.editAppointment',
      location: `/appointments/edit/${storeAppointment.id}`,
    },
  ]
  useAddBreadcrumbs(breadcrumbs, true)

  useEffect(() => {
    setAppointment(storeAppointment)
  }, [storeAppointment])

  const { id } = useParams()
  useEffect(() => {
    if (id) {
      fetchAppointment(id)
    }
  }, [fetchAppointment, id])

  const onCancel = () => {
    navigate(`/appointments/${appointment.id}`)
  }

  const onSaveSuccess = () => {
    navigate(`/appointments/${appointment.id}`)
  }

  const onSave = () => {
    let newErrorMessage = ''
    if (isBefore(new Date(appointment.endDateTime), new Date(appointment.startDateTime))) {
      newErrorMessage += ` ${String(t('scheduling.appointment.errors.startDateMustBeBeforeEndDate'))}`
    }

    if (newErrorMessage) {
      setErrorMessage(newErrorMessage.trim())
      return
    }

    updateAppointment(appointment as Appointment, onSaveSuccess)
  }

  const onFieldChange = (key: string, value: string | boolean) => {
    setAppointment({
      ...appointment,
      [key]: value,
    })
  }

  if (isLoading || !appointment.id || !patient.id) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  return (
    <div className="appointment-detail-container">
      <div className="form-container">
        <AppointmentDetailForm
          isEditable
          appointment={appointment}
        patient={patient}
        onFieldChange={onFieldChange}
        errorMessage={errorMessage}
      />
        <div className="row float-right">
          <div className="btn-group btn-group-lg">
            <Button className="mr-2" color="success" onClick={onSave}>
              {String(t('actions.save'))}
            </Button>
            <Button color="danger" onClick={onCancel}>
              {String(t('actions.cancel'))}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditAppointment
