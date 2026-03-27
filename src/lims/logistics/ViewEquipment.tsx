import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Container,
  Row,
  Column,
  Spinner,
  Alert,
  Panel,
  Modal,
} from '@lahim/components'
import {
  useEquipmentItem,
  useEquipmentHistory,
  useScheduleMaintenance,
  useRecordCalibration,
} from '../../hooks/useEquipment'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import TextFieldWithLabelFormGroup from '../../components/input/TextFieldWithLabelFormGroup'
import SelectWithLableFormGroup from '../../components/input/SelectWithLableFormGroup'
import DatePickerWithLabelFormGroup from '../../components/input/DatePickerWithLabelFormGroup'

const ViewEquipment = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: equipment, isLoading, error } = useEquipmentItem(id)
  const { data: history } = useEquipmentHistory(id)
  const scheduleMaintenanceMutation = useScheduleMaintenance()
  const recordCalibrationMutation = useRecordCalibration()
  const setButtonToolBar = useButtonToolbarSetter()

  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [showCalibrationModal, setShowCalibrationModal] = useState(false)
  const [maintenanceData, setMaintenanceData] = useState({
    maintenanceType: 'preventive',
    scheduledAt: new Date().toISOString().split('T')[0],
    performedBy: '',
    cost: '',
    notes: '',
  })
  const [calibrationData, setCalibrationData] = useState({
    performedAt: new Date().toISOString().split('T')[0],
    performedBy: '',
    cost: '',
    notes: '',
  })

  useTitle(t('lims.logistics.viewEquipment', 'View Equipment'))
  useAddBreadcrumbs(
    id
      ? [
          { i18nKey: 'lims.logistics.equipment', location: '/lims/logistics/equipment' },
          {
            i18nKey: 'lims.logistics.viewEquipment',
            location: `/lims/logistics/equipment/${id}`,
          },
        ]
      : [],
    true
  )

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="backButton"
        outlined
        color="secondary"
        icon="left-arrow"
        iconLocation="left"
        onClick={() => navigate('/lims/logistics/equipment')}
      >
        {String(t('actions.back', 'Back'))}
      </Button>,
      <Button
        key="maintenanceButton"
        color="info"
        icon="wrench"
        iconLocation="left"
        onClick={() => setShowMaintenanceModal(true)}
      >
        {String(t('lims.logistics.scheduleMaintenance', 'Schedule Maintenance'))}
      </Button>,
      <Button
        key="calibrationButton"
        color="success"
        icon="check"
        iconLocation="left"
        onClick={() => setShowCalibrationModal(true)}
      >
        {String(t('lims.logistics.recordCalibration', 'Record Calibration'))}
      </Button>,
    ])
    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  const handleScheduleMaintenance = async () => {
    if (!id) return

    try {
      await scheduleMaintenanceMutation.mutateAsync({
        equipmentId: id,
        maintenanceType: maintenanceData.maintenanceType,
        scheduledAt: new Date(maintenanceData.scheduledAt).toISOString(),
        performedBy: maintenanceData.performedBy || undefined,
        cost: maintenanceData.cost ? parseFloat(maintenanceData.cost) : undefined,
        notes: maintenanceData.notes || undefined,
      })
      setShowMaintenanceModal(false)
      setMaintenanceData({
        maintenanceType: 'preventive',
        scheduledAt: new Date().toISOString().split('T')[0],
        performedBy: '',
        cost: '',
        notes: '',
      })
    } catch (err) {
      // Error handled by mutation
    }
  }

  const handleRecordCalibration = async () => {
    if (!id) return

    try {
      await recordCalibrationMutation.mutateAsync({
        equipmentId: id,
        performedAt: new Date(calibrationData.performedAt).toISOString(),
        performedBy: calibrationData.performedBy || undefined,
        cost: calibrationData.cost ? parseFloat(calibrationData.cost) : undefined,
        notes: calibrationData.notes || undefined,
      })
      setShowCalibrationModal(false)
      setCalibrationData({
        performedAt: new Date().toISOString().split('T')[0],
        performedBy: '',
        cost: '',
        notes: '',
      })
    } catch (err) {
      // Error handled by mutation
    }
  }

  if (isLoading) {
    return (
      <Container>
        <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
      </Container>
    )
  }

  if (error || !equipment) {
    return (
      <Container>
        <Alert
          color="danger"
          title={String(t('states.error', 'Error'))}
          message={String(error?.message || t('lims.logistics.loadError', 'Failed to load equipment'))}
        />
      </Container>
    )
  }

  return (
    <Container>
      <Row>
        <Column md={12}>
          <Panel>
            <Panel.Header title={String(t('lims.logistics.equipmentDetails', 'Equipment Details'))} />
            <Panel.Body>
              <Row>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.name', 'Name'))}:</strong> {equipment.name || '-'}
                </Column>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.status', 'Status'))}:</strong>{' '}
                  <span className={`badge badge-${equipment.status === 'active' ? 'success' : 'warning'}`}>
                    {equipment.status || '-'}
                  </span>
                </Column>
              </Row>
              <Row>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.equipmentType', 'Equipment Type'))}:</strong>{' '}
                  {equipment.equipmentType || '-'}
                </Column>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.location', 'Location'))}:</strong>{' '}
                  {equipment.location || '-'}
                </Column>
              </Row>
              <Row>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.manufacturer', 'Manufacturer'))}:</strong>{' '}
                  {equipment.manufacturer || '-'}
                </Column>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.model', 'Model'))}:</strong> {equipment.model || '-'}
                </Column>
              </Row>
              <Row>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.serialNumber', 'Serial Number'))}:</strong>{' '}
                  {equipment.serialNumber || '-'}
                </Column>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.purchaseDate', 'Purchase Date'))}:</strong>{' '}
                  {equipment.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString() : '-'}
                </Column>
              </Row>
              <Row>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.warrantyExpiry', 'Warranty Expiry'))}:</strong>{' '}
                  {equipment.warrantyExpiry
                    ? new Date(equipment.warrantyExpiry).toLocaleDateString()
                    : '-'}
                </Column>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.lastMaintenance', 'Last Maintenance'))}:</strong>{' '}
                  {equipment.lastMaintenance
                    ? new Date(equipment.lastMaintenance).toLocaleDateString()
                    : '-'}
                </Column>
              </Row>
              <Row>
                <Column md={6}>
                  <strong>{String(t('lims.logistics.nextMaintenance', 'Next Maintenance'))}:</strong>{' '}
                  {equipment.nextMaintenance
                    ? new Date(equipment.nextMaintenance).toLocaleDateString()
                    : '-'}
                </Column>
              </Row>
            </Panel.Body>
          </Panel>
        </Column>
      </Row>

      {/* Maintenance History */}
      <Row>
        <Column md={12}>
          <Panel>
            <Panel.Header title={String(t('lims.logistics.maintenanceHistory', 'Maintenance History'))} />
            <Panel.Body>
              {history?.history && history.history.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>{String(t('lims.logistics.type', 'Type'))}</th>
                      <th>{String(t('lims.logistics.scheduledAt', 'Scheduled At'))}</th>
                      <th>{String(t('lims.logistics.performedAt', 'Performed At'))}</th>
                      <th>{String(t('lims.logistics.performedBy', 'Performed By'))}</th>
                      <th>{String(t('lims.logistics.cost', 'Cost'))}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.history.map((maintenance) => (
                      <tr key={maintenance.id || maintenance._id}>
                        <td>{maintenance.maintenanceType || '-'}</td>
                        <td>
                          {maintenance.scheduledAt
                            ? new Date(maintenance.scheduledAt).toLocaleDateString()
                            : '-'}
                        </td>
                        <td>
                          {maintenance.performedAt
                            ? new Date(maintenance.performedAt).toLocaleDateString()
                            : '-'}
                        </td>
                        <td>{maintenance.performedBy || '-'}</td>
                        <td>{maintenance.cost ? `$${maintenance.cost.toFixed(2)}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div>{String(t('lims.logistics.noMaintenanceHistory', 'No maintenance history'))}</div>
              )}
            </Panel.Body>
          </Panel>
        </Column>
      </Row>

      {/* Schedule Maintenance Modal */}
      <Modal
        show={showMaintenanceModal}
        toggle={() => setShowMaintenanceModal(false)}
        title={String(t('lims.logistics.scheduleMaintenance', 'Schedule Maintenance'))}
        closeButton={{
          children: String(t('actions.cancel', 'Cancel')),
          color: 'secondary',
          onClick: () => setShowMaintenanceModal(false),
        }}
        successButton={{
          children: String(t('actions.save', 'Save')),
          color: 'primary',
          onClick: handleScheduleMaintenance,
        }}
      >
        <Row>
          <Column md={12}>
            <SelectWithLableFormGroup
              label={String(t('lims.logistics.maintenanceType', 'Maintenance Type'))}
              name="maintenanceType"
              value={maintenanceData.maintenanceType}
              onChange={(e) => setMaintenanceData({ ...maintenanceData, maintenanceType: e.target.value })}
              isEditable={true}
            >
              <option value="preventive">{String(t('lims.logistics.type.preventive', 'Preventive'))}</option>
              <option value="corrective">{String(t('lims.logistics.type.corrective', 'Corrective'))}</option>
              <option value="repair">{String(t('lims.logistics.type.repair', 'Repair'))}</option>
            </SelectWithLableFormGroup>
          </Column>
        </Row>
        <Row>
          <Column md={12}>
            <DatePickerWithLabelFormGroup
              label={String(t('lims.logistics.scheduledAt', 'Scheduled At'))}
              name="scheduledAt"
              value={maintenanceData.scheduledAt}
              onChange={(date) => setMaintenanceData({ ...maintenanceData, scheduledAt: date })}
              isRequired
              isEditable={true}
            />
          </Column>
        </Row>
        <Row>
          <Column md={12}>
            <TextInputWithLabelFormGroup
              label={String(t('lims.logistics.performedBy', 'Performed By'))}
              name="performedBy"
              value={maintenanceData.performedBy}
              onChange={(e) => setMaintenanceData({ ...maintenanceData, performedBy: e.target.value })}
              isEditable={true}
            />
          </Column>
        </Row>
        <Row>
          <Column md={12}>
            <TextInputWithLabelFormGroup
              label={String(t('lims.logistics.cost', 'Cost'))}
              name="cost"
              type="number"
              step="0.01"
              value={maintenanceData.cost}
              onChange={(e) => setMaintenanceData({ ...maintenanceData, cost: e.target.value })}
              isEditable={true}
            />
          </Column>
        </Row>
        <Row>
          <Column md={12}>
            <TextFieldWithLabelFormGroup
              label={String(t('lims.logistics.notes', 'Notes'))}
              name="notes"
              value={maintenanceData.notes}
              onChange={(e) => setMaintenanceData({ ...maintenanceData, notes: e.target.value })}
              isEditable={true}
            />
          </Column>
        </Row>
      </Modal>

      {/* Record Calibration Modal */}
      <Modal
        show={showCalibrationModal}
        toggle={() => setShowCalibrationModal(false)}
        title={String(t('lims.logistics.recordCalibration', 'Record Calibration'))}
        closeButton={{
          children: String(t('actions.cancel', 'Cancel')),
          color: 'secondary',
          onClick: () => setShowCalibrationModal(false),
        }}
        successButton={{
          children: String(t('actions.save', 'Save')),
          color: 'primary',
          onClick: handleRecordCalibration,
        }}
      >
        <Row>
          <Column md={12}>
            <DatePickerWithLabelFormGroup
              label={String(t('lims.logistics.performedAt', 'Performed At'))}
              name="performedAt"
              value={calibrationData.performedAt}
              onChange={(date) => setCalibrationData({ ...calibrationData, performedAt: date })}
              isRequired
              isEditable={true}
            />
          </Column>
        </Row>
        <Row>
          <Column md={12}>
            <TextInputWithLabelFormGroup
              label={String(t('lims.logistics.performedBy', 'Performed By'))}
              name="performedBy"
              value={calibrationData.performedBy}
              onChange={(e) => setCalibrationData({ ...calibrationData, performedBy: e.target.value })}
              isEditable={true}
            />
          </Column>
        </Row>
        <Row>
          <Column md={12}>
            <TextInputWithLabelFormGroup
              label={String(t('lims.logistics.cost', 'Cost'))}
              name="cost"
              type="number"
              step="0.01"
              value={calibrationData.cost}
              onChange={(e) => setCalibrationData({ ...calibrationData, cost: e.target.value })}
              isEditable={true}
            />
          </Column>
        </Row>
        <Row>
          <Column md={12}>
            <TextFieldWithLabelFormGroup
              label={String(t('lims.logistics.notes', 'Notes'))}
              name="notes"
              value={calibrationData.notes}
              onChange={(e) => setCalibrationData({ ...calibrationData, notes: e.target.value })}
              isEditable={true}
            />
          </Column>
        </Row>
      </Modal>
    </Container>
  )
}

export default ViewEquipment

