import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, Panel, Spinner, Alert, Checkbox } from '@hospitalrun/components'
import { apiClient } from '../lib/api-client'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'
import SelectWithLableFormGroup from '../components/input/SelectWithLableFormGroup'

const CustomReportBuilder = () => {
  const { t } = useTranslation()
  useTitle(t('reports.customBuilder', 'Custom Report Builder'))
  useAddBreadcrumbs([{ i18nKey: 'reports.customBuilder', location: '/reports/custom' }], true)

  const [title, setTitle] = useState('')
  const [format, setFormat] = useState('JSON')
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableFields = [
    { category: 'patient', fields: ['patient.id', 'patient.name', 'patient.dob', 'patient.gender', 'patient.address'] },
    { category: 'visit', fields: ['visit.id', 'visit.type', 'visit.startDate', 'visit.status', 'visit.location'] },
    { category: 'billing', fields: ['billing.invoiceId', 'billing.amount', 'billing.status', 'billing.date'] },
    { category: 'medication', fields: ['medication.name', 'medication.dosage', 'medication.frequency'] },
  ]

  const handleFieldToggle = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    )
  }

  const handleGenerate = async () => {
    if (selectedFields.length === 0) {
      setError(t('reports.selectFieldsMessage', 'Please select at least one field'))
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.post('/reports/custom', {
        title: title || 'Custom Report',
        format,
        fields: selectedFields,
        filters: {}, // Can be extended with filter UI
      })
      setReportData(response)
    } catch (err: any) {
      // Extract error message from different possible error formats
      let errorMessage = t('reports.generateError', 'Failed to generate report')
      
      // Priority 1: Check for details.message first (server sends actual error in message field)
      if (err?.details?.message) {
        errorMessage = err.details.message
      }
      // Priority 2: Check for details.error if message wasn't found
      else if (err?.details?.error) {
        errorMessage = typeof err.details.error === 'string' ? err.details.error : String(err.details.error)
      }
      // Priority 3: Check the error object's message (but skip if it's the generic one)
      else if (err?.message && err.message !== 'Failed to generate custom report') {
        errorMessage = err.message
      }
      // Priority 4: Check response data if available
      else if (err?.response?.data) {
        const responseData = err.response.data
        if (responseData.message) {
          errorMessage = responseData.message
        } else if (responseData.error) {
          errorMessage = typeof responseData.error === 'string' ? responseData.error : String(responseData.error)
        }
      }
      // Priority 5: Fallback to error instance message
      else if (err instanceof Error) {
        errorMessage = err.message
      }
      // Priority 6: String error
      else if (typeof err === 'string') {
        errorMessage = err
      }
      
      // Add more context if available
      if (err?.status) {
        errorMessage = `${errorMessage} (Status: ${err.status})`
      }
      
      setError(errorMessage)
      
      // Enhanced logging to help debug
      console.error('Custom report generation error:', {
        error: err,
        errorType: err?.constructor?.name,
        message: err?.message,
        status: err?.status,
        details: err?.details,
        detailsMessage: err?.details?.message,
        detailsError: err?.details?.error,
        detailsKeys: err?.details ? Object.keys(err.details) : [],
        response: err?.response?.data,
        finalErrorMessage: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <Panel title={String(t('reports.customBuilder', 'Custom Report Builder'))}>
        <Row>
          <Column md={6}>
            <TextInputWithLabelFormGroup
              name="title"
              label={t('reports.reportTitle', 'Report Title')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              isEditable
            />
          </Column>
          <Column md={6}>
            <SelectWithLableFormGroup
              name="format"
              label={t('reports.format', 'Format')}
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              options={[
                { value: 'JSON', label: 'JSON' },
                { value: 'CSV', label: 'CSV' },
                { value: 'PDF', label: 'PDF' },
              ]}
              isEditable
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <Panel title={String(t('reports.selectFields', 'Select Fields'))}>
              {availableFields.map((category) => (
                <div key={category.category} style={{ marginBottom: '20px' }}>
                  <h5>{t(`reports.categories.${category.category}`, category.category)}</h5>
                  {category.fields.map((field) => (
                    <div key={field} style={{ marginLeft: '20px', marginBottom: '5px' }}>
                      <Checkbox
                        id={`field-${field}`}
                        name={`field-${field}`}
                        label={field}
                        checked={selectedFields.includes(field)}
                        onChange={() => handleFieldToggle(field)}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </Panel>
          </Column>
        </Row>

        <Row>
          <Column>
            <Button color="primary" onClick={handleGenerate} disabled={isLoading || selectedFields.length === 0}>
              {String(t('reports.generate', 'Generate Report'))}
            </Button>
          </Column>
        </Row>

        {error && (
          <Row>
            <Column>
              <Alert color="danger" title={String(t('states.error', 'Error'))} message={error} />
            </Column>
          </Row>
        )}

        {isLoading && (
          <Row>
            <Column>
              <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
            </Column>
          </Row>
        )}

        {reportData && (
          <Row>
            <Column>
              <Panel title={String(t('reports.results', 'Report Results'))}>
                <pre style={{ whiteSpace: 'pre-wrap', maxHeight: '500px', overflow: 'auto' }}>
                  {JSON.stringify(reportData, null, 2)}
                </pre>
              </Panel>
            </Column>
          </Row>
        )}
      </Panel>
    </Container>
  )
}

export default CustomReportBuilder

