import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Container, Row, Column, Spinner, Alert, Modal } from '@hospitalrun/components'
import { useInstrument } from '../../hooks/useInstruments'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api-client'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import TextFieldWithLabelFormGroup from '../../components/input/TextFieldWithLabelFormGroup'

const ViewInstrument = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: instrument, isLoading, error } = useInstrument(id)
  const setButtonToolBar = useButtonToolbarSetter()
  const queryClient = useQueryClient()

  const [showImportModal, setShowImportModal] = useState(false)
  const [importData, setImportData] = useState('')
  const [importFormat, setImportFormat] = useState<'hl7' | 'astm' | 'json'>('json')
  const [importError, setImportError] = useState<string | null>(null)

  useTitle(instrument ? `${String(t('lims.instruments.view', 'View Instrument'))} - ${instrument.name || id}` : t('lims.instruments.view', 'View Instrument'))

  useAddBreadcrumbs(
    id
      ? [
          { i18nKey: 'lims.instruments.label', location: '/lims/instruments' },
          { i18nKey: 'lims.instruments.view', location: `/lims/instruments/${id}` },
        ]
      : [],
    true
  )

  const importMutation = useMutation({
    mutationFn: async (data: { results: any[]; format?: string }) => {
      return apiClient.post(`/instruments/${id}/import-results`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instruments', id] })
      setShowImportModal(false)
      setImportData('')
      setImportError(null)
    },
    onError: (err: Error) => {
      setImportError(err.message || t('lims.instruments.importError', 'Failed to import results'))
    },
  })

  const handleImport = () => {
    setImportError(null)
    try {
      let parsedResults: any[] = []
      
      if (importFormat === 'json') {
        parsedResults = JSON.parse(importData)
        if (!Array.isArray(parsedResults)) {
          parsedResults = [parsedResults]
        }
      } else {
        // For HL7/ASTM, we'd need a parser, but for now just send as-is
        setImportError(t('lims.instruments.formatNotSupported', 'HL7 and ASTM formats require parsing. Please use JSON format for now.'))
        return
      }

      importMutation.mutate({ results: parsedResults, format: importFormat })
    } catch (err) {
      setImportError(t('lims.instruments.invalidJson', 'Invalid JSON format'))
    }
  }

  useEffect(() => {
    const buttons = [
      <Button
        key="backButton"
        outlined
        color="secondary"
        icon="left-arrow"
        iconLocation="left"
        onClick={() => navigate('/lims/instruments')}
      >
        {String(t('actions.back', 'Back'))}
      </Button>,
    ]

    if (instrument && instrument.status === 'online') {
      buttons.push(
        <Button
          key="importButton"
          color="primary"
          icon="upload"
          iconLocation="left"
          onClick={() => setShowImportModal(true)}
        >
          {String(t('lims.instruments.importResults', 'Import Results'))}
        </Button>
      )
    }

    setButtonToolBar(buttons)

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t, instrument])

  if (isLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  if (error || !instrument) {
    return (
      <Container>
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={String(error?.message || t('lims.instruments.notFound', 'Instrument not found'))} />
      </Container>
    )
  }

  return (
    <Container>
      <Panel title={`${String(t('lims.instruments.view', 'View Instrument'))} - ${instrument.name || id}`}>
        <Row>
          <Column md={6}>
            <h4>{String(t('lims.instruments.instrumentInformation', 'Instrument Information'))}</h4>
            <table className="table">
              <tbody>
                <tr>
                  <td><strong>{String(t('lims.instruments.name', 'Name'))}</strong></td>
                  <td>{instrument.name || '-'}</td>
                </tr>
                <tr>
                  <td><strong>{String(t('lims.instruments.manufacturer', 'Manufacturer'))}</strong></td>
                  <td>{instrument.manufacturer || '-'}</td>
                </tr>
                <tr>
                  <td><strong>{String(t('lims.instruments.model', 'Model'))}</strong></td>
                  <td>{instrument.model || '-'}</td>
                </tr>
                <tr>
                  <td><strong>{String(t('lims.instruments.serialNumber', 'Serial Number'))}</strong></td>
                  <td>{instrument.serialNumber || '-'}</td>
                </tr>
                <tr>
                  <td><strong>{String(t('lims.instruments.section', 'Section'))}</strong></td>
                  <td>{instrument.section || '-'}</td>
                </tr>
                <tr>
                  <td><strong>{String(t('lims.instruments.status', 'Status'))}</strong></td>
                  <td>
                    <span className={`badge badge-${instrument.status === 'active' ? 'success' : 'warning'}`}>
                      {instrument.status || '-'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td><strong>{String(t('lims.instruments.location', 'Location'))}</strong></td>
                  <td>{instrument.location || '-'}</td>
                </tr>
                <tr>
                  <td><strong>{String(t('lims.instruments.lastCalibration', 'Last Calibration'))}</strong></td>
                  <td>{instrument.lastCalibration ? new Date(instrument.lastCalibration).toLocaleDateString() : '-'}</td>
                </tr>
                <tr>
                  <td><strong>{String(t('lims.instruments.nextCalibration', 'Next Calibration'))}</strong></td>
                  <td>{instrument.nextCalibration ? new Date(instrument.nextCalibration).toLocaleDateString() : '-'}</td>
                </tr>
              </tbody>
            </table>
          </Column>
        </Row>
      </Panel>

      <Modal
        show={showImportModal}
        toggle={() => {
          setShowImportModal(false)
          setImportData('')
          setImportError(null)
        }}
        title={String(t('lims.instruments.importResults', 'Import Results'))}
        body={
          <div>
            {importError && (
              <Alert
                color="danger"
                title={String(t('states.error', 'Error'))}
                message={String(importError)}
              />
            )}
            <div className="form-group">
              <label>{String(t('lims.instruments.importFormat', 'Import Format'))}</label>
              <select
                className="form-control"
                value={importFormat}
                onChange={(e) => setImportFormat(e.target.value as 'hl7' | 'astm' | 'json')}
              >
                <option value="json">JSON</option>
                <option value="hl7">HL7</option>
                <option value="astm">ASTM</option>
              </select>
            </div>
            <TextFieldWithLabelFormGroup
              name="importData"
              label={String(t('lims.instruments.importData', 'Import Data'))}
              value={importData}
              onChange={(e) => {
                setImportData(e.target.value)
                setImportError(null)
              }}
              isEditable
              rows={10}
              placeholder={String(t('lims.instruments.importDataPlaceholder', 'Paste instrument results data here (JSON format)'))}
            />
            <p className="text-muted">
              {String(t('lims.instruments.importInstructions', 'For JSON format, provide an array of result objects. Each object should contain testCode, value, unit, etc.'))}
            </p>
          </div>
        }
        closeButton={{
          children: String(t('actions.cancel', 'Cancel')),
          color: 'danger',
          onClick: () => {
            setShowImportModal(false)
            setImportData('')
            setImportError(null)
          },
        }}
        successButton={{
          children: String(t('lims.instruments.import', 'Import')),
          color: 'success',
          icon: 'upload',
          iconLocation: 'left',
          onClick: handleImport,
          disabled: !importData.trim() || importMutation.isPending,
        }}
      />
    </Container>
  )
}

export default ViewInstrument

