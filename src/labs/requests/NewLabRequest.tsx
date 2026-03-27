import React, { useState } from 'react'
import useTitle from 'page-header/useTitle'
import { useTranslation } from 'react-i18next'
import { Typeahead, Label, Button, Alert } from '@lahim/components'
import PatientRepository from 'clients/db/PatientRepository'
import Patient from 'model/Patient'
import TextInputWithLabelFormGroup from 'components/input/TextInputWithLabelFormGroup'
import { useNavigate } from 'react-router-dom'
import Lab from 'model/Lab'
import TextFieldWithLabelFormGroup from 'components/input/TextFieldWithLabelFormGroup'
import useAddBreadcrumbs from 'breadcrumbs/useAddBreadcrumbs'
import { useLabStore } from 'store/lab-store'

const NewLabRequest = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('labs.requests.new'))
  const { status, error, requestLab } = useLabStore()

  const [newLabRequest, setNewLabRequest] = useState({
    patientId: '',
    type: '',
    notes: '',
    status: 'requested',
  })

  const breadcrumbs = [
    {
      i18nKey: 'labs.requests.new',
      location: `/labs/new`,
    },
  ]
  useAddBreadcrumbs(breadcrumbs)

  const onPatientChange = (patient: Patient) => {
    setNewLabRequest((previousNewLabRequest) => ({
      ...previousNewLabRequest,
      patientId: patient.id,
    }))
  }

  const onLabTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const type = event.currentTarget.value
    setNewLabRequest((previousNewLabRequest) => ({
      ...previousNewLabRequest,
      type,
    }))
  }

  const onNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const notes = event.currentTarget.value
    setNewLabRequest((previousNewLabRequest) => ({
      ...previousNewLabRequest,
      notes,
    }))
  }

  const onSave = async () => {
    const newLab = newLabRequest as Lab
    const onSuccess = (createdLab: Lab) => {
      navigate(`/labs/${createdLab.id}`)
    }

    requestLab(newLab, onSuccess)
  }

  const onCancel = () => {
    navigate('/labs')
  }

  return (
    <>
      {status === 'error' && (
        <Alert color="danger" title={String(t('states.error'))} message={String(t(error.message || ''))} />
      )}
      <form>
        <div className="form-group patient-typeahead">
          <Label htmlFor="patientTypeahead" isRequired text={String(t('labs.lab.patient'))} />
          <Typeahead
            id="patientTypeahead"
            placeholder={String(t('labs.lab.patient'))}
            onChange={(p: Patient[]) => onPatientChange(p[0])}
            onSearch={async (query: string) => PatientRepository.search(query)}
            searchAccessor="fullName"
            renderMenuItemChildren={(p: Patient) => <div>{`${p.fullName} (${p.code})`}</div>}
            isInvalid={!!error.patient}
          />
        </div>
        <TextInputWithLabelFormGroup
          name="labType"
          label={String(t('labs.lab.type'))}
          isRequired
          isEditable
          isInvalid={!!error.type}
          feedback={t(error.type as string)}
          value={newLabRequest.type}
          onChange={onLabTypeChange}
        />
        <div className="form-group">
          <TextFieldWithLabelFormGroup
            name="labNotes"
            label={String(t('labs.lab.notes'))}
            isEditable
            value={newLabRequest.notes}
            onChange={onNoteChange}
          />
        </div>
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
      </form>
    </>
  )
}

export default NewLabRequest
