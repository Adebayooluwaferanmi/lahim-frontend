import React, { useState } from 'react'
import { Modal, Alert } from '@lahim/components'
import { useTranslation } from 'react-i18next'
import TextFieldWithLabelFormGroup from 'components/input/TextFieldWithLabelFormGroup'
import Note from '../../model/Note'
import { usePatientStore } from '../../store/patient-store'

interface Props {
  show: boolean
  toggle: () => void
  onCloseButtonClick: () => void
}

const NewNoteModal = (props: Props) => {
  const { show, toggle, onCloseButtonClick } = props
  const patient = usePatientStore((s) => s.patient)
  const noteError = usePatientStore((s) => s.noteError)
  const addNote = usePatientStore((s) => s.addNote)
  const { t } = useTranslation()
  const [note, setNote] = useState({
    text: '',
  })

  const onFieldChange = (key: string, value: string | any) => {
    setNote({
      ...note,
      [key]: value,
    })
  }

  const onNoteTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.currentTarget.value
    onFieldChange('text', text)
  }

  const onSaveButtonClick = () => {
    addNote(patient.id, note as Note)
  }

  const body = (
    <form>
      {noteError?.message && (
        <Alert color="danger" title={String(t('states.error'))} message={String(t(noteError?.message || ''))} />
      )}
      <div className="row">
        <div className="col-md-12">
          <div className="form-group">
            <TextFieldWithLabelFormGroup
              isEditable
              isRequired
              name="noteTextField"
              label={String(t('patient.note'))}
              value={note.text}
              isInvalid={!!noteError?.note}
              feedback={String(t(noteError?.note || ''))}
              onChange={onNoteTextChange}
            />
          </div>
        </div>
      </div>
    </form>
  )

  return (
    <Modal
      show={show}
      toggle={toggle}
      title={String(t('patient.notes.new'))}
      body={body}
      closeButton={{
        children: String(t('actions.cancel')),
        color: 'danger',
        onClick: onCloseButtonClick,
      }}
      successButton={{
        children: String(t('patient.notes.new')),
        color: 'success',
        icon: 'add',
        iconLocation: 'left',
        onClick: onSaveButtonClick,
      }}
    />
  )
}

export default NewNoteModal
