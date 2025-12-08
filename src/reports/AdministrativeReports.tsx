import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, Panel, Spinner, Alert, Table } from '@hospitalrun/components'
import { apiClient } from '../lib/api-client'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import DatePickerWithLabelFormGroup from '../components/input/DatePickerWithLabelFormGroup'
import SelectWithLableFormGroup from '../components/input/SelectWithLableFormGroup'

const AdministrativeReports = () => {
  const { t } = useTranslation()
  useTitle(t('reports.administrative', 'Administrative Reports'))
  useAddBreadcrumbs([{ i18nKey: 'reports.administrative', location: '/reports/administrative' }], true)

  const [reportType, setReportType] = useState('patient-demographics')
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  const [endDate, setEndDate] = useState(new Date())
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/reports/administrative', {
        params: {
          reportType,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      })
      setReportData(response.data)
    } catch (err: any) {
      setError(err.message || t('reports.generateError', 'Failed to generate report'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <Panel title={String(t('reports.administrative', 'Administrative Reports'))}>
        <Row>
          <Column md={4}>
            <SelectWithLableFormGroup
              name="reportType"
              label={t('reports.reportType', 'Report Type')}
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={[
                { value: 'patient-demographics', label: t('reports.types.patientDemographics', 'Patient Demographics') },
                { value: 'appointment-statistics', label: t('reports.types.appointmentStatistics', 'Appointment Statistics') },
                { value: 'resource-utilization', label: t('reports.types.resourceUtilization', 'Resource Utilization') },
              ]}
              isEditable
            />
          </Column>
          <Column md={4}>
            <DatePickerWithLabelFormGroup
              name="startDate"
              label={t('reports.startDate', 'Start Date')}
              value={startDate}
              onChange={(date) => setStartDate(date)}
              isEditable
            />
          </Column>
          <Column md={4}>
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

export default AdministrativeReports

