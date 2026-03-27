/* eslint-disable react/no-danger */
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, List, ListItem, Alert } from '@lahim/components'
import NewNoteModal from 'patients/notes/NewNoteModal'
import Note from 'model/Note'
import Patient from 'model/Patient'
import { useUserStore } from '../../store/user-store'
import Permissions from '../../model/Permissions'

interface Props {
  patient: Patient
}

const NoteTab = (props: Props) => {
  const { patient } = props
  const { t } = useTranslation()
  const permissions = useUserStore((state) => state.permissions)
  const [showNewNoteModal, setShowNoteModal] = useState<boolean>(false)

  const onNewNoteClick = () => {
    setShowNoteModal(true)
  }

  const closeNewNoteModal = () => {
    setShowNoteModal(false)
  }

  return (
    <div>
      <div className="row">
        <div className="col-md-12 d-flex justify-content-end">
          {permissions.includes(Permissions.WritePatients) && (
            <Button
              outlined
              color="success"
              icon="add"
              iconLocation="left"
              onClick={onNewNoteClick}
            >
              {String(t('patient.notes.new'))}
            </Button>
          )}
        </div>
      </div>
      <br />
      {(!patient.notes || patient.notes.length === 0) && (
        <Alert
          color="warning"
          title={String(t('patient.notes.warning.noNotes'))}
          message={String(t('patient.notes.addNoteAbove'))}
        />
      )}
      <List>
        {patient.notes?.map((note: Note) => (
          <ListItem key={note.date}>
            {new Date(note.date).toLocaleString()}
            <p>{note.text}</p>
          </ListItem>
        ))}
      </List>
      <NewNoteModal
        show={showNewNoteModal}
        toggle={closeNewNoteModal}
        onCloseButtonClick={closeNewNoteModal}
      />
    </div>
  )
}

export default NoteTab
