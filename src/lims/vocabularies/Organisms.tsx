import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Row, Column, TextInput, Spinner, Alert, Modal } from '@hospitalrun/components'
import {
  useOrganisms,
  useCreateOrganism,
  useUpdateOrganism,
  useDeleteOrganism,
  Organism,
} from '../../hooks/useVocabularies'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import TextFieldWithLabelFormGroup from '../../components/input/TextFieldWithLabelFormGroup'

const Organisms = () => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingOrganism, setEditingOrganism] = useState<Organism | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    display: '',
    codeSystem: 'SNOMED-CT',
    synonyms: '',
    active: true,
  })

  const { data, isLoading, error } = useOrganisms({
    search: searchTerm || undefined,
  })
  const createMutation = useCreateOrganism()
  const updateMutation = useUpdateOrganism()
  const deleteMutation = useDeleteOrganism()

  const organisms = data?.organisms || []

  const handleOpenModal = (organism?: Organism) => {
    if (organism) {
      setEditingOrganism(organism)
      setFormData({
        code: organism.code || '',
        display: organism.display || '',
        codeSystem: organism.codeSystem || 'SNOMED-CT',
        synonyms: organism.synonyms?.join(', ') || '',
        active: organism.active !== false,
      })
    } else {
      setEditingOrganism(null)
      setFormData({
        code: '',
        display: '',
        codeSystem: 'SNOMED-CT',
        synonyms: '',
        active: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingOrganism(null)
  }

  const handleSubmit = async () => {
    try {
      const organismData = {
        code: formData.code,
        display: formData.display,
        codeSystem: formData.codeSystem,
        synonyms: formData.synonyms ? formData.synonyms.split(',').map(s => s.trim()) : undefined,
        active: formData.active,
      }

      if (editingOrganism) {
        await updateMutation.mutateAsync({
          id: editingOrganism.id || editingOrganism._id || '',
          updates: organismData,
        })
      } else {
        await createMutation.mutateAsync(organismData)
      }
      handleCloseModal()
    } catch (err) {
      // Error handled by mutation
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(t('lims.vocabularies.confirmDelete', 'Are you sure you want to delete this organism?'))) {
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
        message={String(error.message || t('lims.vocabularies.loadError', 'Failed to load organisms'))}
      />
    )
  }

  return (
    <>
      <Row>
        <Column md={8}>
          <TextInput
            placeholder={String(t('lims.vocabularies.searchOrganisms', 'Search organisms...'))}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Column>
        <Column md={4}>
          <Button color="primary" icon="add" onClick={() => handleOpenModal()}>
            {String(t('lims.vocabularies.newOrganism', 'New Organism'))}
          </Button>
        </Column>
      </Row>

      <Row>
        <Column>
          {organisms.length === 0 ? (
            <div>{String(t('lims.vocabularies.noOrganisms', 'No organisms found'))}</div>
          ) : (
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
                {organisms.map((organism) => (
                  <tr key={organism.id || organism._id}>
                    <td>{organism.code || '-'}</td>
                    <td>{organism.display || '-'}</td>
                    <td>{organism.codeSystem || '-'}</td>
                    <td>
                      <span className={`badge badge-${organism.active !== false ? 'success' : 'secondary'}`}>
                        {organism.active !== false ? t('lims.vocabularies.active', 'Active') : t('lims.vocabularies.inactive', 'Inactive')}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="small"
                        color="info"
                        onClick={() => handleOpenModal(organism)}
                      >
                        {String(t('actions.edit', 'Edit'))}
                      </Button>
                      {' '}
                      <Button
                        size="small"
                        color="danger"
                        onClick={() => handleDelete(organism.id || organism._id || '')}
                      >
                        {String(t('actions.delete', 'Delete'))}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Column>
      </Row>

      <Modal
        show={showModal}
        toggle={handleCloseModal}
        title={String(editingOrganism ? t('lims.vocabularies.editOrganism', 'Edit Organism') : t('lims.vocabularies.newOrganism', 'New Organism'))}
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
              label={String(t('lims.vocabularies.code', 'Code'))}
              name="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              isRequired
              isEditable={true}
            />
          </Column>
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
        </Row>
        <Row>
          <Column md={6}>
            <TextInputWithLabelFormGroup
              label={String(t('lims.vocabularies.codeSystem', 'Code System'))}
              name="codeSystem"
              value={formData.codeSystem}
              onChange={(e) => setFormData({ ...formData, codeSystem: e.target.value })}
              isEditable={true}
            />
          </Column>
          <Column md={6}>
            <TextInputWithLabelFormGroup
              label={String(t('lims.vocabularies.synonyms', 'Synonyms (comma-separated)'))}
              name="synonyms"
              value={formData.synonyms}
              onChange={(e) => setFormData({ ...formData, synonyms: e.target.value })}
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

export default Organisms

