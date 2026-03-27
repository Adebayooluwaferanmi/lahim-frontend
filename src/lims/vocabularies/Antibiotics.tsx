import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Row, Column, TextInput, Spinner, Alert, Modal } from '@lahim/components'
import {
  useAntibiotics,
  useCreateAntibiotic,
  useUpdateAntibiotic,
  useDeleteAntibiotic,
  Antibiotic,
} from '../../hooks/useVocabularies'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import TextFieldWithLabelFormGroup from '../../components/input/TextFieldWithLabelFormGroup'

const Antibiotics = () => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingAntibiotic, setEditingAntibiotic] = useState<Antibiotic | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    display: '',
    codeSystem: 'RxNorm',
    class: '',
    spectrum: '',
    active: true,
  })

  const { data, isLoading, error } = useAntibiotics({
    search: searchTerm || undefined,
  })
  const createMutation = useCreateAntibiotic()
  const updateMutation = useUpdateAntibiotic()
  const deleteMutation = useDeleteAntibiotic()

  const antibiotics = data?.antibiotics || []

  const handleOpenModal = (antibiotic?: Antibiotic) => {
    if (antibiotic) {
      setEditingAntibiotic(antibiotic)
      setFormData({
        code: antibiotic.code || '',
        display: antibiotic.display || '',
        codeSystem: antibiotic.codeSystem || 'RxNorm',
        class: antibiotic.class || '',
        spectrum: antibiotic.spectrum?.join(', ') || '',
        active: antibiotic.active !== false,
      })
    } else {
      setEditingAntibiotic(null)
      setFormData({
        code: '',
        display: '',
        codeSystem: 'RxNorm',
        class: '',
        spectrum: '',
        active: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingAntibiotic(null)
  }

  const handleSubmit = async () => {
    try {
      const antibioticData = {
        code: formData.code,
        display: formData.display,
        codeSystem: formData.codeSystem,
        class: formData.class || undefined,
        spectrum: formData.spectrum ? formData.spectrum.split(',').map(s => s.trim()) : undefined,
        active: formData.active,
      }

      if (editingAntibiotic) {
        await updateMutation.mutateAsync({
          id: editingAntibiotic.id || editingAntibiotic._id || '',
          updates: antibioticData,
        })
      } else {
        await createMutation.mutateAsync(antibioticData)
      }
      handleCloseModal()
    } catch (err) {
      // Error handled by mutation
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(t('lims.vocabularies.confirmDelete', 'Are you sure you want to delete this antibiotic?'))) {
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
        message={String(error.message || t('lims.vocabularies.loadError', 'Failed to load antibiotics'))}
      />
    )
  }

  return (
    <>
      <Row>
        <Column md={8}>
          <TextInput
            placeholder={String(t('lims.vocabularies.searchAntibiotics', 'Search antibiotics...'))}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Column>
        <Column md={4}>
          <Button color="primary" icon="add" onClick={() => handleOpenModal()}>
            {String(t('lims.vocabularies.newAntibiotic', 'New Antibiotic'))}
          </Button>
        </Column>
      </Row>

      <Row>
        <Column>
          {antibiotics.length === 0 ? (
            <div>{String(t('lims.vocabularies.noAntibiotics', 'No antibiotics found'))}</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{String(t('lims.vocabularies.code', 'Code'))}</th>
                  <th>{String(t('lims.vocabularies.display', 'Display'))}</th>
                  <th>{String(t('lims.vocabularies.class', 'Class'))}</th>
                  <th>{String(t('lims.vocabularies.codeSystem', 'Code System'))}</th>
                  <th>{String(t('lims.vocabularies.status', 'Status'))}</th>
                  <th>{String(t('actions.actions', 'Actions'))}</th>
                </tr>
              </thead>
              <tbody>
                {antibiotics.map((antibiotic) => (
                  <tr key={antibiotic.id || antibiotic._id}>
                    <td>{antibiotic.code || '-'}</td>
                    <td>{antibiotic.display || '-'}</td>
                    <td>{antibiotic.class || '-'}</td>
                    <td>{antibiotic.codeSystem || '-'}</td>
                    <td>
                      <span className={`badge badge-${antibiotic.active !== false ? 'success' : 'secondary'}`}>
                        {antibiotic.active !== false ? t('lims.vocabularies.active', 'Active') : t('lims.vocabularies.inactive', 'Inactive')}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="small"
                        color="info"
                        onClick={() => handleOpenModal(antibiotic)}
                      >
                        {String(t('actions.edit', 'Edit'))}
                      </Button>
                      {' '}
                      <Button
                        size="small"
                        color="danger"
                        onClick={() => handleDelete(antibiotic.id || antibiotic._id || '')}
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
        title={String(editingAntibiotic ? t('lims.vocabularies.editAntibiotic', 'Edit Antibiotic') : t('lims.vocabularies.newAntibiotic', 'New Antibiotic'))}
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
              label={String(t('lims.vocabularies.class', 'Class'))}
              name="class"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              isEditable={true}
            />
          </Column>
        </Row>
        <Row>
          <Column md={12}>
            <TextInputWithLabelFormGroup
              label={String(t('lims.vocabularies.spectrum', 'Spectrum (comma-separated)'))}
              name="spectrum"
              value={formData.spectrum}
              onChange={(e) => setFormData({ ...formData, spectrum: e.target.value })}
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

export default Antibiotics

