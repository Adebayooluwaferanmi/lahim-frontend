import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Container, Row, Column, Spinner, Alert } from '@lahim/components'
import { useApiQuery } from '../../lib/queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api-client'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import TextFieldWithLabelFormGroup from '../../components/input/TextFieldWithLabelFormGroup'
import SelectWithLableFormGroup from '../../components/input/SelectWithLableFormGroup'

interface TestCatalogEntry {
  id?: string
  _id?: string
  code: string
  name: string
  resultType: 'numeric' | 'coded' | 'microbiology' | 'text' | 'image'
  analyticalPhases?: {
    analytical?: {
      resultTemplate?: {
        fields?: Array<{
          name: string
          type: 'number' | 'text' | 'select' | 'date' | 'boolean'
          label: string
          required?: boolean
          unit?: string
          options?: Array<{ value: string; label: string }>
          min?: number
          max?: number
          referenceRange?: { low?: number; high?: number }
        }>
      }
      validationRules?: {
        minValue?: number
        maxValue?: number
        withinReferenceRange?: boolean
      }
      referenceRange?: {
        low?: number
        high?: number
      }
    }
  }
}

const TemplateBasedResultEntry = () => {
  const { t } = useTranslation()
  const { orderId, worklistId } = useParams<{ orderId?: string; worklistId?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setButtonToolBar = useButtonToolbarSetter()
  const queryClient = useQueryClient()

  const testCode = searchParams.get('testCode')
  const patientId = searchParams.get('patientId')
  const specimenId = searchParams.get('specimenId')

  const [formData, setFormData] = useState<Record<string, any>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Fetch test catalog entry
  const { data: testCatalog, isLoading: isLoadingCatalog, error: catalogError } = useApiQuery<TestCatalogEntry>(
    ['test-catalog', testCode],
    `/test-catalog?code=${testCode}`,
    {
      enabled: !!testCode,
    }
  )

  // Get the actual entry from the response
  const catalogEntry = testCatalog
    ? (Array.isArray((testCatalog as any).entries) ? (testCatalog as any).entries[0] : testCatalog)
    : null

  const resultTemplate = catalogEntry?.analyticalPhases?.analytical?.resultTemplate
  const fields = resultTemplate?.fields || []
  const referenceRange = catalogEntry?.analyticalPhases?.analytical?.referenceRange

  useTitle(t('lims.results.enterResult', 'Enter Lab Result'))

  useAddBreadcrumbs(
    [
      { i18nKey: 'lims.labOrders.label', location: '/lims/lab-orders' },
      { i18nKey: 'lims.results.enterResult', location: '/lims/results/enter' },
    ],
    true
  )

  const createResultMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post('/lab-results', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-results'] })
      queryClient.invalidateQueries({ queryKey: ['worklists', worklistId] })
      queryClient.invalidateQueries({ queryKey: ['lab-orders', orderId] })
      
      if (worklistId) {
        navigate(`/lims/worklists/${worklistId}`)
      } else if (orderId) {
        navigate(`/lims/lab-orders/${orderId}`)
      } else {
        navigate('/lims/lab-orders')
      }
    },
    onError: (err: Error) => {
      setSubmitError(err.message || t('lims.results.createError', 'Failed to create lab result'))
    },
  })

  useEffect(() => {
    setButtonToolBar([
      <Button
        key="backButton"
        outlined
        color="secondary"
        icon="left-arrow"
        iconLocation="left"
        onClick={() => {
          if (worklistId) {
            navigate(`/lims/worklists/${worklistId}`)
          } else if (orderId) {
            navigate(`/lims/lab-orders/${orderId}`)
          } else {
            navigate('/lims/lab-orders')
          }
        }}
      >
        {String(t('actions.back', 'Back'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t, worklistId, orderId])

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
    
    // Clear validation error for this field
    if (validationErrors[fieldName]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
    setSubmitError(null)
  }

  const validateField = (field: any, value: any): string | null => {
    if (field.required && (value === undefined || value === null || value === '')) {
      return t('lims.results.fieldRequired', `${field.label} is required`)
    }

    if (field.type === 'number' && value !== undefined && value !== null && value !== '') {
      const numValue = parseFloat(value)
      if (isNaN(numValue)) {
        return t('lims.results.invalidNumber', `${field.label} must be a valid number`)
      }
      if (field.min !== undefined && numValue < field.min) {
        return t('lims.results.valueTooLow', `${field.label} must be at least ${field.min}`)
      }
      if (field.max !== undefined && numValue > field.max) {
        return t('lims.results.valueTooHigh', `${field.label} must be at most ${field.max}`)
      }
      if (field.referenceRange) {
        if (field.referenceRange.low !== undefined && numValue < field.referenceRange.low) {
          return t('lims.results.belowReferenceRange', `Value is below reference range (${field.referenceRange.low}-${field.referenceRange.high})`)
        }
        if (field.referenceRange.high !== undefined && numValue > field.referenceRange.high) {
          return t('lims.results.aboveReferenceRange', `Value is above reference range (${field.referenceRange.low}-${field.referenceRange.high})`)
        }
      }
    }

    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setValidationErrors({})

    // Validate all fields
    const errors: Record<string, string> = {}
    fields.forEach((field) => {
      const value = formData[field.name]
      const error = validateField(field, value)
      if (error) {
        errors[field.name] = error
      }
    })

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    // Build result object based on result type
    let resultData: any = {
      patientId: patientId || '',
      testCode: {
        coding: [
          {
            system: 'LOINC',
            code: testCode || catalogEntry?.code,
            display: catalogEntry?.name,
          },
        ],
      },
      resultType: catalogEntry?.resultType || 'numeric',
      status: 'final',
    }

    // Add specimen ID if provided
    if (specimenId) {
      resultData.specimenId = specimenId
    }

    // Add order ID if provided
    if (orderId) {
      resultData.orderId = orderId
    }

    // Process fields based on result type
    if (catalogEntry?.resultType === 'numeric') {
      // Find the main numeric field (usually the first number field)
      const numericField = fields.find((f) => f.type === 'number')
      if (numericField) {
        resultData.numericValue = parseFloat(formData[numericField.name] || '0')
        resultData.unit = numericField.unit || ''
      }
      
      // Add reference range if available
      if (referenceRange) {
        resultData.referenceRange = referenceRange
      }
    } else if (catalogEntry?.resultType === 'coded') {
      // Find the coded value field
      const codedField = fields.find((f) => f.type === 'select')
      if (codedField) {
        resultData.codedValue = {
          code: formData[codedField.name],
          system: codedField.options?.find((opt) => opt.value === formData[codedField.name])?.value || '',
          display: codedField.options?.find((opt) => opt.value === formData[codedField.name])?.label || '',
        }
      }
    } else if (catalogEntry?.resultType === 'text') {
      const textField = fields.find((f) => f.type === 'text')
      if (textField) {
        resultData.textValue = formData[textField.name]
      }
    } else if (catalogEntry?.resultType === 'microbiology') {
      // Microbiology results are more complex - would need organism and susceptibility data
      resultData.microbiologyResults = formData
    }

    createResultMutation.mutate(resultData)
  }

  if (isLoadingCatalog) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  if (catalogError || !catalogEntry) {
    return (
      <Container>
        <Alert
          color="danger"
          title={String(t('states.error', 'Error'))}
          message={String(catalogError?.message || t('lims.results.testCatalogNotFound', 'Test catalog entry not found'))}
        />
      </Container>
    )
  }

  if (fields.length === 0) {
    return (
      <Container>
        <Alert
          color="warning"
          title={String(t('lims.results.noTemplate', 'No Template Available'))}
          message={String(t('lims.results.noTemplateMessage', 'This test does not have a result template defined. Please use manual entry.'))}
        />
      </Container>
    )
  }

  return (
    <Container>
      <Panel title={`${String(t('lims.results.enterResult', 'Enter Lab Result'))} - ${catalogEntry.name}`}>
        <form onSubmit={handleSubmit}>
          {submitError && (
            <Alert
              color="danger"
              title={String(t('states.error', 'Error'))}
              message={String(submitError)}
            />
          )}

          <Row>
            <Column md={12}>
              <h4>{String(t('lims.results.testInformation', 'Test Information'))}</h4>
              <table className="table">
                <tbody>
                  <tr>
                    <td><strong>{String(t('lims.results.testCode', 'Test Code'))}</strong></td>
                    <td>{catalogEntry.code}</td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.results.testName', 'Test Name'))}</strong></td>
                    <td>{catalogEntry.name}</td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.results.resultType', 'Result Type'))}</strong></td>
                    <td>{catalogEntry.resultType}</td>
                  </tr>
                  {referenceRange && (
                    <tr>
                      <td><strong>{String(t('lims.results.referenceRange', 'Reference Range'))}</strong></td>
                      <td>
                        {referenceRange.low !== undefined && referenceRange.high !== undefined
                          ? `${referenceRange.low} - ${referenceRange.high}`
                          : referenceRange.low !== undefined
                          ? `≥ ${referenceRange.low}`
                          : referenceRange.high !== undefined
                          ? `≤ ${referenceRange.high}`
                          : '-'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Column>
          </Row>

          <Row>
            <Column md={12}>
              <h4>{String(t('lims.results.resultValues', 'Result Values'))}</h4>
              {fields.map((field) => {
                const fieldValue = formData[field.name]
                const fieldError = validationErrors[field.name]

                if (field.type === 'number') {
                  return (
                    <TextInputWithLabelFormGroup
                      key={field.name}
                      name={field.name}
                      label={field.label}
                      isRequired={field.required}
                      value={fieldValue || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      isEditable
                      type="number"
                      min={field.min}
                      max={field.max}
                      isInvalid={!!fieldError}
                      feedback={fieldError}
                      addonAfter={field.unit}
                    />
                  )
                } else if (field.type === 'select') {
                  return (
                    <SelectWithLableFormGroup
                      key={field.name}
                      name={field.name}
                      label={field.label}
                      isRequired={field.required}
                      value={fieldValue || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      isEditable
                      isInvalid={!!fieldError}
                      feedback={fieldError}
                      options={field.options || []}
                    />
                  )
                } else if (field.type === 'text') {
                  return (
                    <TextFieldWithLabelFormGroup
                      key={field.name}
                      name={field.name}
                      label={field.label}
                      isRequired={field.required}
                      value={fieldValue || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      isEditable
                      isInvalid={!!fieldError}
                      feedback={fieldError}
                      rows={field.name.includes('notes') || field.name.includes('comment') ? 3 : 1}
                    />
                  )
                } else if (field.type === 'boolean') {
                  return (
                    <div key={field.name} className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={fieldValue || false}
                          onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                        />
                        {' '}
                        {field.label}
                        {field.required && <span className="text-danger">*</span>}
                      </label>
                      {fieldError && <div className="invalid-feedback d-block">{fieldError}</div>}
                    </div>
                  )
                }
                return null
              })}
            </Column>
          </Row>

          <div className="row">
            <div className="col-md-12">
              <div className="btn-group float-right">
                <Button
                  outlined
                  color="secondary"
                  onClick={() => {
                    if (worklistId) {
                      navigate(`/lims/worklists/${worklistId}`)
                    } else if (orderId) {
                      navigate(`/lims/lab-orders/${orderId}`)
                    } else {
                      navigate('/lims/lab-orders')
                    }
                  }}
                >
                  {String(t('actions.cancel', 'Cancel'))}
                </Button>
                <Button
                  color="success"
                  icon="save"
                  iconLocation="left"
                  type="submit"
                  disabled={createResultMutation.isPending}
                >
                  {String(t('lims.results.saveResult', 'Save Result'))}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Panel>
    </Container>
  )
}

export default TemplateBasedResultEntry

