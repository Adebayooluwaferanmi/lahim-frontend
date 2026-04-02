import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Button, Column, Container, Panel, Row, Spinner } from '@lahim/components'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'
import { useBillingOverrides, useRevokeBillingOverride } from '../hooks/usePatientFinance'
import usePatientFinanceRealtime from '../hooks/usePatientFinanceRealtime'

const formatCurrency = (amount: number, currency = 'NGN') =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount || 0)

const BillingOverrides = () => {
  const { t } = useTranslation()
  useTitle(t('billing.overrides.label', 'Billing Overrides'))
  useAddBreadcrumbs([{ i18nKey: 'billing.overrides.label', location: '/billing/overrides' }], true)

  const [patientIdFilter, setPatientIdFilter] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: overrides = [], isLoading, error } = useBillingOverrides({
    patientId: patientIdFilter || undefined,
    active: true,
  })
  const { mutate: revokeOverride, isPending: isRevokingOverride } = useRevokeBillingOverride()

  usePatientFinanceRealtime({
    includeOverrides: true,
    includePortfolioSummary: true,
  })

  const handleRevokeOverride = (overrideId: string) => {
    setSubmitError(null)
    revokeOverride(
      { overrideId, revokedBy: 'billing-operator' },
      {
        onError: (mutationError) => {
          setSubmitError(
            mutationError.message || t('billing.financial.revokeError', 'Failed to revoke billing privilege'),
          )
        },
      },
    )
  }

  if (isLoading) {
    return (
      <Container>
        <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Alert
          color="danger"
          title={String(t('states.error', 'Error'))}
          message={String(error.message || t('billing.overrides.loadError', 'Failed to load billing overrides'))}
        />
      </Container>
    )
  }

  return (
    <Container>
      {submitError && (
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={submitError} />
      )}

      <Panel title={String(t('billing.overrides.label', 'Billing Overrides'))}>
        <Row>
          <Column md={4}>
            <TextInputWithLabelFormGroup
              label={String(t('billing.invoices.patientId', 'Patient ID'))}
              name="overridePatientIdFilter"
              type="text"
              value={patientIdFilter}
              onChange={(event) => setPatientIdFilter(event.target.value)}
              isEditable
            />
          </Column>
        </Row>

        {overrides.length === 0 ? (
          <p>{t('billing.overrides.empty', 'No active billing overrides found.')}</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{t('billing.invoices.patientId', 'Patient ID')}</th>
                  <th>{t('billing.financial.reason', 'Reason')}</th>
                  <th>{t('billing.financial.approvedAmount', 'Approved Amount')}</th>
                  <th>{t('billing.financial.grantedBy', 'Granted By')}</th>
                  <th>{t('billing.financial.outstanding', 'Outstanding Balance')}</th>
                  <th>{t('billing.financial.expiresAt', 'Expiry Date')}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {overrides.map((override) => (
                  <tr key={override.id || override._id}>
                    <td>{override.patientId}</td>
                    <td>{override.reason}</td>
                    <td>{formatCurrency(override.approvedAmount || override.limitAmount || 0)}</td>
                    <td>{override.grantedBy}</td>
                    <td>{formatCurrency(override.outstandingBalance || 0)}</td>
                    <td>{override.expiresAt ? new Date(override.expiresAt).toLocaleDateString() : '-'}</td>
                    <td>
                      <Button
                        color="danger"
                        outlined
                        onClick={() => handleRevokeOverride(String(override.id || override._id || ''))}
                        disabled={isRevokingOverride}
                      >
                        {String(t('billing.financial.revoke', 'Revoke'))}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </Container>
  )
}

export default BillingOverrides
