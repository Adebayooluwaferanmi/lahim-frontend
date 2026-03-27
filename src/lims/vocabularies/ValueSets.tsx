import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Row, Column, TextInput, Spinner, Alert, Modal } from '@lahim/components'
import {
  useValueSets,
  useValueSet,
  useCreateValueSet,
  useUpdateValueSet,
  useDeleteValueSet,
  ValueSet,
} from '../../hooks/useVocabularies'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'

const ValueSets = () => {
  const { t } = useTranslation()
  const [listIdFilter, setListIdFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingValueSet, setEditingValueSet] = useState<ValueSet | null>(null)
  const [formData, setFormData] = useState({
    listId: '',
    code: '',
    display: '',
    codeSystem: '',
    active: true,
  })

  const { data, isLoading, error } = useValueSets({
    listId: listIdFilter || undefined,
  })
  const createMutation = useCreateValueSet()
  const updateMutation = useUpdateValueSet()
  const deleteMutation = useDeleteValueSet()

  const valueSets = data?.valueSets || []

  // Group by listId
  const groupedValueSets = valueSets.reduce((acc: Record<string, typeof valueSets>, vs: any) => {
    const id = vs.listId || 'unknown'
    if (!acc[id]) acc[id] = []
    acc[id].push(vs)
    return acc
  }, {})

  const handleOpenModal = (valueSet?: any) => {
    if (valueSet) {
      setEditingValueSet(valueSet)
      setFormData({
        listId: valueSet.listId || '',
        code: valueSet.code || '',
        display: valueSet.display || '',
        codeSystem: valueSet.codeSystem || '',
        active: valueSet.active !== false,
      })
    } else {
      setEditingValueSet(null)
      setFormData({
        listId: '',
        code: '',
        display: '',
        codeSystem: '',
        active: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingValueSet(null)
  }

  const handleSubmit = async () => {
    try {
      const valueSetData = {
        listId: formData.listId,
        code: formData.code,
        display: formData.display,
        codeSystem: formData.codeSystem || undefined,
        active: formData.active,
      }

      if (editingValueSet) {
        await updateMutation.mutateAsync({
          id: editingValueSet.id || editingValueSet._id || '',
          updates: valueSetData,
        })
      } else {
        await createMutation.mutateAsync(valueSetData)
      }
      handleCloseModal()
    } catch (err) {
      // Error handled by mutation
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(t('lims.vocabularies.confirmDelete', 'Are you sure you want to delete this value set item?'))) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (err) {
        // Error handled by mutation
      }
    }
  }

  if (isLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  if (error) {
    return (
      <Alert
        color="danger"
        title={String(t('states.error', 'Error'))}
        message={String(error.message || t('lims.vocabularies.loadError', 'Failed to load value sets'))}
      />
    )
  }

  return (
    <>
      <Row>
        <Column md={8}>
          <TextInput
            placeholder={String(t('lims.vocabularies.filterByListId', 'Filter by List ID...'))}
            value={listIdFilter}
            onChange={(e) => setListIdFilter(e.target.value)}
          />
        </Column>
        <Column md={4}>
          <Button color="primary" icon="add" onClick={() => handleOpenModal()}>
            {String(t('lims.vocabularies.newValueSet', 'New Value Set Item'))}
          </Button>
        </Column>
      </Row>

      <Row>
        <Column>
          {Object.keys(groupedValueSets).length === 0 ? (
            <div>{String(t('lims.vocabularies.noValueSets', 'No value sets found'))}</div>
          ) : (
            Object.entries(groupedValueSets).map(([listId, items]) => (
              <div key={listId} style={{ marginBottom: '2rem' }}>
                <h4>{listId}</h4>
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>{String(t('lims.vocabularies.code', 'Code'))}</th>
                      <th>{String(t('lims.vocabularies.display', 'Display'))}</th>
                      <th>{String(t('lims.vocabularies.codeSystem', 'Code System'))}</th>
                      <th>{String(t('lims.vocabularies.status', 'Status'))}</th>
                      <th>{String(t('actions.actions', 'Actions'))}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(items as any[]).map((item) => (
                      <tr key={item.id || item._id}>
                        <td>{item.code || '-'}</td>
                        <td>{item.display || '-'}</td>
                        <td>{item.codeSystem || '-'}</td>
                        <td>
                          <span className={`badge badge-${item.active !== false ? 'success' : 'secondary'}`}>
                            {item.active !== false ? t('lims.vocabularies.active', 'Active') : t('lims.vocabularies.inactive', 'Inactive')}
                          </span>
                        </td>
                        <td>
                          <Button
                            size="small"
                            color="info"
                            onClick={() => handleOpenModal(item)}
                          >
                            {String(t('actions.edit', 'Edit'))}
                          </Button>
                          {' '}
                          <Button
                            size="small"
                            color="danger"
                            onClick={() => handleDelete(item.id || item._id || '')}
                          >
                            {String(t('actions.delete', 'Delete'))}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </Column>
      </Row>

      <Modal
        show={showModal}
        toggle={handleCloseModal}
        title={String(editingValueSet ? t('lims.vocabularies.editValueSet', 'Edit Value Set Item') : t('lims.vocabularies.newValueSet', 'New Value Set Item'))}
        closeButton={{
          children: String(t('actions.cancel', 'Cancel')),
          color: 'secondary',
          onClick: handleCloseModal,
        }}
        successButton={{
          children: String(t('actions.save', 'Save')),
          color: 'primary',
          onClick: handleSubmit,
        }}
      >
        <Row>
          <Column md={6}>
            <TextInputWithLabelFormGroup
              label={String(t('lims.vocabularies.listId', 'List ID'))}
              name="listId"
              value={formData.listId}
              onChange={(e) => setFormData({ ...formData, listId: e.target.value })}
              isRequired
              isEditable={true}
            />
          </Column>
          <Column md={6}>
            <TextInputWithLabelFormGroup
              label={String(t('lims.vocabularies.code', 'Code'))}
              name="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              isRequired
              isEditable={true}
            />
          </Column>
        </Row>
        <Row>
          <Column md={6}>
            <TextInputWithLabelFormGroup
              label={String(t('lims.vocabularies.display', 'Display'))}
              name="display"
              value={formData.display}
              onChange={(e) => setFormData({ ...formData, display: e.target.value })}
              isRequired
              isEditable={true}
            />
          </Column>
          <Column md={6}>
            <TextInputWithLabelFormGroup
              label={String(t('lims.vocabularies.codeSystem', 'Code System'))}
              name="codeSystem"
              value={formData.codeSystem}
              onChange={(e) => setFormData({ ...formData, codeSystem: e.target.value })}
              isEditable={true}
            />
          </Column>
        </Row>
        <Row>
          <Column md={12}>
            <label>
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              {' '}
              {String(t('lims.vocabularies.active', 'Active'))}
            </label>
          </Column>
        </Row>
      </Modal>
    </>
  )
}

export default ValueSets

