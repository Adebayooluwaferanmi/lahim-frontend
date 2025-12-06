import React, { useState, useEffect } from 'react'
import { Modal, Alert } from '@hospitalrun/components'
import { useTranslation } from 'react-i18next'
import Allergy from 'model/Allergy'
import TextInputWithLabelFormGroup from 'components/input/TextInputWithLabelFormGroup'
import { useSelector } from 'react-redux'
import { RootState, useAppDispatch } from '../../store'
import { addAllergy } from '../patient-slice'

interface NewAllergyModalProps {
  show: boolean
  onCloseButtonClick: () => void
}

const NewAllergyModal = (props: NewAllergyModalProps) => {
  const { show, onCloseButtonClick } = props
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { allergyError, patient } = useSelector((state: RootState) => state.patient)

  const [allergy, setAllergy] = useState({ name: '' })

  useEffect(() => {
    setAllergy({ name: '' })
  }, [show])

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value
    setAllergy((prevAllergy) => ({ ...prevAllergy, name }))
  }

  const onSaveButtonClick = () => {
    dispatch(addAllergy(patient.id, allergy as Allergy))
  }

  const onClose = () => {
    onCloseButtonClick()
  }

  const body = (
    <>
      {allergyError && (
        <Alert color="danger" title={String(t('states.error'))} message={String(t(allergyError?.message || ''))} />
      )}
      <form>
        <TextInputWithLabelFormGroup
          name="name"
          isRequired
          label={String(t('patient.allergies.allergyName'))}
          isEditable
          placeholder={String(t('patient.allergies.allergyName'))}
          value={allergy.name}
          onChange={onNameChange}
          feedback={String(t(allergyError?.name || ''))}
          isInvalid={!!allergyError?.name}
        />
      </form>
    </>
  )

  return (
    <Modal
      show={show}
      toggle={onClose}
      title={String(t('patient.allergies.new'))}
      body={body}
      closeButton={{
        children: String(t('actions.cancel')),
        color: 'danger',
        onClick: onClose,
      }}
      successButton={{
        children: String(t('patient.allergies.new')),
        color: 'success',
        icon: 'add',
        iconLocation: 'left',
        onClick: onSaveButtonClick,
      }}
    />
  )
}

export default NewAllergyModal
