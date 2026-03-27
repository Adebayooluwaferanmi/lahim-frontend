import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Table, Alert, Spinner, Panel, Row, Column } from '@lahim/components'
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  Department,
} from '../hooks/useSettings'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'

const Departments = () => {
  const { t } = useTranslation()
  const { data, isLoading } = useDepartments()
  const { mutate: createDept } = useCreateDepartment()
  const { mutate: deleteDept } = useDeleteDepartment()

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Department>>({ name: '', description: '' })

  const handleCreate = () => {
    createDept(formData, {
      onSuccess: () => {
        setShowForm(false)
        setFormData({ name: '', description: '' })
      },
    })
  }

  const handleDelete = (id: string) => {
    if (window.confirm(t('settings.confirmDelete', 'Are you sure you want to delete this item?'))) {
      deleteDept(
        {},
        {
          onSuccess: () => {},
        }
      )
    }
  }

  if (isLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  const departments = data?.departments || []

  return (
    <div>
      <div className="mb-3">
        <Button color="success" icon="add" onClick={() => setShowForm(!showForm)}>
          {String(t('settings.addDepartment', 'Add Department'))}
        </Button>
      </div>

      {showForm && (
        <Panel title={String(t('settings.newDepartment', 'New Department'))}>
          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('settings.name', 'Name'))}
                name="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isRequired
                isEditable
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('settings.description', 'Description'))}
                name="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                isEditable
              />
            </Column>
          </Row>
          <Row>
            <Column>
              <Button color="success" onClick={handleCreate}>
                {String(t('actions.save', 'Save'))}
              </Button>
              <Button outlined color="secondary" onClick={() => setShowForm(false)} className="ml-2">
                {String(t('actions.cancel', 'Cancel'))}
              </Button>
            </Column>
          </Row>
        </Panel>
      )}

      <Table
        data={departments.map((dept) => ({
          id: dept.id || dept._id,
          name: dept.name,
          description: dept.description || '-',
          actions: (
            <Button color="danger" onClick={() => handleDelete(dept.id || dept._id || '')}>
              {String(t('actions.delete', 'Delete'))}
            </Button>
          ),
        }))}
        columns={[
          { label: t('settings.name', 'Name'), key: 'name' },
          { label: t('settings.description', 'Description'), key: 'description' },
          { label: t('actions.label', 'Actions'), key: 'actions' },
        ]}
      />
    </div>
  )
}

export default Departments

