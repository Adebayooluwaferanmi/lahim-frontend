import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../store'
import { Button, Toast } from '@hospitalrun/components'
import GeneralInformation from '../GeneralInformation'
import useTitle from '../../page-header/useTitle'
import Patient from '../../model/Patient'
import { createPatient } from '../patient-slice'
import { getPatientName } from '../util/patient-name-util'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { RootState } from '../../store'

const breadcrumbs = [
  { i18nKey: 'patients.label', location: '/patients' },
  { i18nKey: 'patients.newPatient', location: '/patients/new' },
]

const NewPatient = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { createError } = useSelector((state: RootState) => state.patient)

  const [patient, setPatient] = useState({} as Patient)

  useTitle(t('patients.newPatient'))
  useAddBreadcrumbs(breadcrumbs, true)

  const onCancel = () => {
    navigate('/patients')
  }

  const onSuccessfulSave = (newPatient: Patient) => {
    navigate(`/patients/${newPatient.id}`)
    Toast(
      'success',
      t('states.success'),
      `${String(t('patients.successfullyCreated'))} ${newPatient.fullName}`,
    )
  }

  const onSave = () => {
    dispatch(
      createPatient(
        {
          ...patient,
          fullName: getPatientName(patient.givenName, patient.familyName, patient.suffix),
        },
        onSuccessfulSave,
      ),
    )
  }

  const onFieldChange = (key: string, value: string | boolean) => {
    setPatient({
      ...patient,
      [key]: value,
    })
  }

  return (
    <div>
      <GeneralInformation
        isEditable
        patient={patient}
        onFieldChange={onFieldChange}
        error={createError}
      />
      <div className="row float-right">
        <div className="btn-group btn-group-lg mt-3">
          <Button className="mr-2" color="success" onClick={onSave}>
            {String(t('actions.save'))}
          </Button>
          <Button color="danger" onClick={onCancel}>
            {String(t('actions.cancel'))}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NewPatient
