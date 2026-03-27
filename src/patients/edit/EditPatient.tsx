import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Spinner, Button, Toast } from '@lahim/components'
import GeneralInformation from '../GeneralInformation'
import useTitle from '../../page-header/useTitle'
import Patient from '../../model/Patient'
import { usePatientStore } from '../../store/patient-store'
import { getPatientFullName, getPatientName } from '../util/patient-name-util'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'

const getPatientCode = (p: Patient): string => {
  if (p) {
    return p.code
  }

  return ''
}

const EditPatient = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [patient, setPatient] = useState({} as Patient)

  const reduxPatient = usePatientStore((s) => s.patient)
  const status = usePatientStore((s) => s.status)
  const updateError = usePatientStore((s) => s.updateError)
  const fetchPatient = usePatientStore((s) => s.fetchPatient)
  const updatePatient = usePatientStore((s) => s.updatePatient)

  useTitle(
    `${String(t('patients.editPatient'))}: ${getPatientFullName(reduxPatient)} (${getPatientCode(
      reduxPatient,
    )})`,
  )

  const breadcrumbs = [
    { i18nKey: 'patients.label', location: '/patients' },
    { text: getPatientFullName(reduxPatient), location: `/patients/${reduxPatient.id}` },
    { i18nKey: 'patients.editPatient', location: `/patients/${reduxPatient.id}/edit` },
  ]
  useAddBreadcrumbs(breadcrumbs, true)

  useEffect(() => {
    setPatient(reduxPatient)
  }, [reduxPatient])

  const { id } = useParams()
  useEffect(() => {
    if (id) {
      fetchPatient(id)
    }
  }, [id, fetchPatient])

  const onCancel = () => {
    navigate(`/patients/${patient.id}`)
  }

  const onSuccessfulSave = (updatedPatient: Patient) => {
    navigate(`/patients/${updatedPatient.id}`)
    Toast(
      'success',
      t('states.success'),
      `${String(t('patients.successfullyUpdated'))} ${patient.fullName}`,
    )
  }

  const onSave = async () => {
    await updatePatient(
      {
        ...patient,
        fullName: getPatientName(patient.givenName, patient.familyName, patient.suffix),
      },
      onSuccessfulSave,
    )
  }

  const onFieldChange = (key: string, value: string | boolean) => {
    setPatient({
      ...patient,
      [key]: value,
    })
  }

  if (status === 'loading') {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  return (
    <div>
      <GeneralInformation
        isEditable
        patient={patient}
        onFieldChange={onFieldChange}
        error={updateError}
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
  )
}

export default EditPatient
