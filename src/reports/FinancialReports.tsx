import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Button, Column, Container, Panel, Row, Spinner } from '@lahim/components'
import { apiClient } from '../lib/api-client'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import DatePickerWithLabelFormGroup from '../components/input/DatePickerWithLabelFormGroup'
import SelectWithLableFormGroup from '../components/input/SelectWithLableFormGroup'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'
import { useFinancialSummary } from '../hooks/usePatientFinance'

const formatCurrency = (amount: number, currency = 'NGN') =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount || 0)

const toReadableLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/-/g, ' ')
    .replace(/^./, (character) => character.toUpperCase())

const FinancialReports = () => {
  const { t } = useTranslation()
  useTitle(t('reports.financial', 'Financial Reports'))
  useAddBreadcrumbs([{ i18nKey: 'reports.financial', location: '/reports/financial' }], true)

  const [reportType, setReportType] = useState('summary')
  const [patientId, setPatientId] = useState('')
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  const [endDate, setEndDate] = useState(new Date())
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: financialSummary } = useFinancialSummary({
    patientId: patientId || undefined,
  })

  const handleGenerate = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/reports/financial', {
        params: {
          reportType,
          patientId: patientId || undefined,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      })
      setReportData(response)
    } catch (err: any) {
      setError(err.message || t('reports.generateError', 'Failed to generate report'))
    } finally {
      setIsLoading(false)
    }
  }

  const summaryCards = useMemo(() => {
    if (!reportData?.data?.summary) return []

    return Object.entries(reportData.data.summary as Record<string, unknown>).map(([key, value]) => ({
      key,
      label: toReadableLabel(key),
      value:
        typeof value === 'number' && key.toLowerCase().includes('count')
          ? value
          : typeof value === 'number'
          ? formatCurrency(value)
          : String(value),
    }))
  }, [reportData])

  const renderTable = (title: string, rows: Record<string, unknown>[]) => {
    if (!rows || rows.length === 0) {
      return null
    }

    const columns = Object.keys(rows[0])

    return (
      <Panel title={title} className="mt-3">
        <div className="table-responsive">
          <table className="table table-hover table-sm">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{toReadableLabel(column)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${title}-${index}`}>
                  {columns.map((column) => {
                    const value = row[column]
                    const isCurrency =
                      typeof value === 'number' &&
                      (column.toLowerCase().includes('amount') ||
                        column.toLowerCase().includes('balance') ||
                        column.toLowerCase().includes('total'))

                    return (
                      <td key={`${title}-${index}-${column}`}>
                        {isCurrency ? formatCurrency(value as number) : String(value ?? '-')}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    )
  }

  const reportSections = useMemo(() => {
    if (!reportData?.data) return []

    return Object.entries(reportData.data as Record<string, unknown>).filter(
      ([key, value]) => key !== 'summary' && Array.isArray(value) && value.length > 0,
    ) as [string, Record<string, unknown>[]][]
  }, [reportData])

  return (
    <Container>
      <Panel title={String(t('reports.financial', 'Financial Reports'))}>
        <Row>
          <Column md={3}>
            <SelectWithLableFormGroup
              name="reportType"
              label={t('reports.reportType', 'Report Type')}
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={[
                { value: 'summary', label: t('reports.types.summary', 'Finance Summary') },
                { value: 'wallet-balances', label: t('reports.types.walletBalances', 'Wallet Balances') },
                { value: 'override-exposure', label: t('reports.types.overrideExposure', 'Override Exposure') },
                { value: 'collections', label: t('reports.types.collections', 'Collections Report') },
                { value: 'revenue', label: t('reports.types.revenue', 'Revenue Report') },
                { value: 'payments', label: t('reports.types.payments', 'Payments Report') },
                {
                  value: 'outstanding-balances',
                  label: t('reports.types.outstandingBalances', 'Outstanding Balances'),
                },
                { value: 'profitability', label: t('reports.types.profitability', 'Profitability Analysis') },
              ]}
              isEditable
            />
          </Column>
          <Column md={3}>
            <TextInputWithLabelFormGroup
              name="patientId"
              label={String(t('billing.invoices.patientId', 'Patient ID'))}
              type="text"
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
              isEditable
            />
          </Column>
          <Column md={3}>
            <DatePickerWithLabelFormGroup
              name="startDate"
              label={t('reports.startDate', 'Start Date')}
              value={startDate}
              onChange={(date) => setStartDate(date)}
              isEditable
            />
          </Column>
          <Column md={3}>
            <DatePickerWithLabelFormGroup
              name="endDate"
              label={t('reports.endDate', 'End Date')}
              value={endDate}
              onChange={(date) => setEndDate(date)}
              isEditable
            />
          </Column>
        </Row>
        <Row>
          <Column>
            <Button color="primary" onClick={handleGenerate} disabled={isLoading}>
              {String(t('reports.generate', 'Generate Report'))}
            </Button>
          </Column>
        </Row>

        {financialSummary && (
          <Panel title={String(t('billing.financial.summary', 'Financial Summary'))} className="mt-3">
            <Row>
              <Column md={3}>
                <strong>{t('reports.types.revenue', 'Revenue Report')}:</strong>{' '}
                {formatCurrency(financialSummary.totals?.billed || 0)}
              </Column>
              <Column md={3}>
                <strong>{t('reports.types.collections', 'Collections Report')}:</strong>{' '}
                {formatCurrency(
                  'collected' in financialSummary.totals
                    ? (financialSummary.totals as { collected: number }).collected
                    : (financialSummary.totals as { paid: number }).paid || 0,
                )}
              </Column>
              <Column md={3}>
                <strong>{t('billing.financial.outstanding', 'Outstanding Balance')}:</strong>{' '}
                {formatCurrency(financialSummary.totals?.outstanding || 0)}
              </Column>
              <Column md={3}>
                <strong>{t('billing.financial.walletBalance', 'Wallet Balance')}:</strong>{' '}
                {formatCurrency(financialSummary.totals?.walletBalance || 0)}
              </Column>
            </Row>
          </Panel>
        )}

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
          <div className="mt-3">
            <Panel title={String(t('reports.results', 'Report Results'))}>
              <Row>
                <Column md={6}>
                  <p>
                    <strong>{t('reports.reportType', 'Report Type')}:</strong> {reportData.reportType}
                  </p>
                </Column>
                <Column md={6}>
                  <p>
                    <strong>{t('reports.generatedOn', 'Generated On')}:</strong>{' '}
                    {new Date(reportData.generatedOn).toLocaleString()}
                  </p>
                </Column>
              </Row>
            </Panel>

            {summaryCards.length > 0 && (
              <Row className="mt-3">
                {summaryCards.map((card) => (
                  <Column md={3} key={card.key}>
                    <Panel title={card.label}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{card.value}</div>
                    </Panel>
                  </Column>
                ))}
              </Row>
            )}

            {reportSections.map(([key, rows]) => renderTable(toReadableLabel(key), rows))}

            {reportData.data.note && (
              <Alert
                color="info"
                title={String(t('states.info', 'Info'))}
                message={String(reportData.data.note)}
              />
            )}
          </div>
        )}
      </Panel>
    </Container>
  )
}

export default FinancialReports
