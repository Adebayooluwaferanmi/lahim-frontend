import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Button, Column, Panel, Row, Spinner } from '@lahim/components'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import SelectWithLableFormGroup from '../../components/input/SelectWithLableFormGroup'
import DatePickerWithLabelFormGroup from '../../components/input/DatePickerWithLabelFormGroup'
import Permissions from '../../model/Permissions'
import { useUserStore } from '../../store/user-store'
import { invalidateQueries } from '../../lib/query-client'
import {
  useCreateBillingOverride,
  useCreateFinancialAccount,
  useFundWallet,
  usePatientFinancialSummary,
  useRevokeBillingOverride,
} from '../../hooks/usePatientFinance'
import usePatientFinanceRealtime from '../../hooks/usePatientFinanceRealtime'

interface Props {
  patientId: string
}

const formatCurrency = (amount: number, currency = 'NGN') =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount || 0)

const getStatusTone = (status: string) => {
  switch (status) {
    case 'cleared':
      return 'success'
    case 'wallet-available':
      return 'info'
    case 'override':
      return 'warning'
    default:
      return 'danger'
  }
}

const PatientFinancial = ({ patientId }: Props) => {
  const { t } = useTranslation()
  const permissions = useUserStore((state) => state.permissions)
  const canReadFinancial = permissions.includes(Permissions.ReadFinancial)
  const canWriteFinancial = permissions.includes(Permissions.WriteFinancial)
  const canApproveOverride = permissions.includes(Permissions.ApproveBillingOverride)

  const { data: summary, isLoading, error } = usePatientFinancialSummary(patientId)
  const { mutate: createAccount, isPending: isCreatingAccount } = useCreateFinancialAccount()
  const { mutate: fundWallet, isPending: isFundingWallet } = useFundWallet(patientId)
  const { mutate: createOverride, isPending: isCreatingOverride } = useCreateBillingOverride()
  const { mutate: revokeOverride, isPending: isRevokingOverride } = useRevokeBillingOverride(patientId)

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showFundingForm, setShowFundingForm] = useState(false)
  const [showOverrideForm, setShowOverrideForm] = useState(false)
  const [fundingData, setFundingData] = useState({
    amount: '',
    paymentMethod: 'cash',
    referenceNumber: '',
    receivedBy: '',
    notes: '',
  })
  const [overrideData, setOverrideData] = useState({
    reason: '',
    grantedBy: '',
    approvedAmount: '',
    expiresAt: '',
    notes: '',
  })

  usePatientFinanceRealtime({
    patientId,
    includeOverrides: true,
    includePortfolioSummary: true,
  })

  const wallet = summary?.wallet
  const account = summary?.account
  const activeOverrides = summary?.activeOverrides || []
  const transactions = summary?.recentTransactions || []

  const summaryRows = useMemo(
    () =>
      summary
        ? [
            {
              label: t('billing.financial.outstanding', 'Outstanding Balance'),
              value: formatCurrency(summary.totals.outstanding, wallet?.currency),
            },
            {
              label: t('billing.financial.pendingCharges', 'Pending Charges'),
              value: formatCurrency(summary.totals.pendingCharges, wallet?.currency),
            },
            {
              label: t('billing.financial.availableCoverage', 'Available Coverage'),
              value: formatCurrency(summary.totals.availableCoverage, wallet?.currency),
            },
            {
              label: t('billing.financial.walletBalance', 'Wallet Balance'),
              value: formatCurrency(summary.totals.walletBalance, wallet?.currency),
            },
          ]
        : [],
    [summary, t, wallet?.currency],
  )

  const handleInitializeAccount = () => {
    setSubmitError(null)
    createAccount(
      { patientId },
      {
        onSuccess: () => {
          invalidateQueries(['patient-financial-summary', patientId])
          invalidateQueries(['patient-wallet', patientId])
        },
        onError: (mutationError) => {
          setSubmitError(
            mutationError.message || t('billing.financial.createAccountError', 'Failed to initialize financial account'),
          )
        },
      },
    )
  }

  const handleFundWallet = () => {
    setSubmitError(null)
    if (!fundingData.amount || Number(fundingData.amount) <= 0) {
      setSubmitError(t('billing.financial.fundingAmountRequired', 'Enter a valid funding amount'))
      return
    }

    fundWallet(
      {
        amount: Number(fundingData.amount),
        paymentMethod: fundingData.paymentMethod,
        channel: fundingData.paymentMethod,
        referenceNumber: fundingData.referenceNumber || undefined,
        receivedBy: fundingData.receivedBy || undefined,
        notes: fundingData.notes || undefined,
      },
      {
        onSuccess: () => {
          setShowFundingForm(false)
          setFundingData({
            amount: '',
            paymentMethod: 'cash',
            referenceNumber: '',
            receivedBy: '',
            notes: '',
          })
        },
        onError: (mutationError) => {
          setSubmitError(
            mutationError.message || t('billing.financial.fundWalletError', 'Failed to fund patient wallet'),
          )
        },
      },
    )
  }

  const handleCreateOverride = () => {
    setSubmitError(null)
    if (!overrideData.reason || !overrideData.grantedBy || !overrideData.approvedAmount) {
      setSubmitError(t('billing.financial.overrideRequired', 'Reason, approver, and amount are required'))
      return
    }

    createOverride(
      {
        patientId,
        reason: overrideData.reason,
        grantedBy: overrideData.grantedBy,
        approvedAmount: Number(overrideData.approvedAmount),
        limitAmount: Number(overrideData.approvedAmount),
        expiresAt: overrideData.expiresAt ? new Date(overrideData.expiresAt).toISOString() : undefined,
        notes: overrideData.notes || undefined,
      },
      {
        onSuccess: () => {
          setShowOverrideForm(false)
          setOverrideData({
            reason: '',
            grantedBy: '',
            approvedAmount: '',
            expiresAt: '',
            notes: '',
          })
          invalidateQueries(['patient-financial-summary', patientId])
        },
        onError: (mutationError) => {
          setSubmitError(
            mutationError.message || t('billing.financial.overrideError', 'Failed to create billing privilege'),
          )
        },
      },
    )
  }

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

  if (!canReadFinancial) {
    return (
      <Alert
        color="warning"
        title={String(t('states.warning', 'Warning'))}
        message={String(t('billing.financial.notAuthorized', 'You are not authorized to view patient finance.'))}
      />
    )
  }

  if (isLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  if (error || !summary) {
    return (
      <Alert
        color="danger"
        title={String(t('states.error', 'Error'))}
        message={String(error?.message || t('billing.financial.loadError', 'Failed to load patient finance'))}
      />
    )
  }

  return (
    <div>
      {submitError && (
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={submitError} />
      )}

      <Panel title={String(t('billing.financial.summary', 'Financial Summary'))}>
        <Row>
          <Column md={8}>
            <Alert
              color={getStatusTone(summary.serviceClearance.status)}
              title={String(t('billing.financial.serviceClearance', 'Service Clearance'))}
              message={`${summary.serviceClearance.reason} (${formatCurrency(
                summary.serviceClearance.requiredAmount,
                wallet?.currency,
              )})`}
            />
          </Column>
          <Column md={4}>
            <p>
              <strong>{t('billing.financial.accountStatus', 'Account Status')}:</strong>{' '}
              {account?.status || t('billing.financial.notInitialized', 'Not initialized')}
            </p>
            <p>
              <strong>{t('billing.financial.walletBalance', 'Wallet Balance')}:</strong>{' '}
              {formatCurrency(wallet?.balance || 0, wallet?.currency)}
            </p>
          </Column>
        </Row>

        {!account && canWriteFinancial && (
          <Row>
            <Column>
              <Button color="primary" onClick={handleInitializeAccount} disabled={isCreatingAccount}>
                {String(t('billing.financial.initializeAccount', 'Initialize Account & Wallet'))}
              </Button>
            </Column>
          </Row>
        )}

        <Row className="mt-3">
          {summaryRows.map((row) => (
            <Column md={3} key={row.label}>
              <Panel title={row.label}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{row.value}</div>
              </Panel>
            </Column>
          ))}
        </Row>

        {(canWriteFinancial || canApproveOverride) && (
          <Row className="mt-3">
            {canWriteFinancial && (
              <Column md={6}>
                <Button color="success" onClick={() => setShowFundingForm((current) => !current)}>
                  {String(t('billing.financial.fundWallet', 'Fund Wallet'))}
                </Button>
              </Column>
            )}
            {canApproveOverride && (
              <Column md={6}>
                <Button color="warning" onClick={() => setShowOverrideForm((current) => !current)}>
                  {String(t('billing.financial.grantOverride', 'Grant Billing Privilege'))}
                </Button>
              </Column>
            )}
          </Row>
        )}
      </Panel>

      {showFundingForm && canWriteFinancial && (
        <Panel title={String(t('billing.financial.fundWallet', 'Fund Wallet'))}>
          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('billing.payments.amount', 'Amount'))}
                name="walletFundingAmount"
                type="number"
                value={fundingData.amount}
                onChange={(event) => setFundingData({ ...fundingData, amount: event.target.value })}
                isEditable
                isRequired
              />
            </Column>
            <Column md={6}>
              <SelectWithLableFormGroup
                label={String(t('billing.payments.paymentMethod', 'Payment Method'))}
                name="walletFundingMethod"
                value={fundingData.paymentMethod}
                onChange={(event) => setFundingData({ ...fundingData, paymentMethod: event.target.value })}
                options={[
                  { value: 'cash', label: String(t('billing.payments.cash', 'Cash')) },
                  { value: 'card', label: String(t('billing.payments.card', 'Card')) },
                  { value: 'bank_transfer', label: String(t('billing.payments.bankTransfer', 'Bank Transfer')) },
                  { value: 'digital_payment', label: String(t('billing.payments.digitalPayment', 'Digital Payment')) },
                  { value: 'insurance', label: String(t('billing.payments.insurance', 'Insurance')) },
                  { value: 'other', label: String(t('billing.payments.other', 'Other')) },
                ]}
                isEditable
              />
            </Column>
          </Row>
          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('billing.payments.referenceNumber', 'Reference Number'))}
                name="walletFundingReference"
                type="text"
                value={fundingData.referenceNumber}
                onChange={(event) => setFundingData({ ...fundingData, referenceNumber: event.target.value })}
                isEditable
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('billing.financial.receivedBy', 'Received By'))}
                name="walletFundingReceivedBy"
                type="text"
                value={fundingData.receivedBy}
                onChange={(event) => setFundingData({ ...fundingData, receivedBy: event.target.value })}
                isEditable
              />
            </Column>
          </Row>
          <Row>
            <Column>
              <TextInputWithLabelFormGroup
                label={String(t('billing.financial.notes', 'Notes'))}
                name="walletFundingNotes"
                type="text"
                value={fundingData.notes}
                onChange={(event) => setFundingData({ ...fundingData, notes: event.target.value })}
                isEditable
              />
            </Column>
          </Row>
          <Row>
            <Column>
              <Button color="success" onClick={handleFundWallet} disabled={isFundingWallet}>
                {String(t('actions.save', 'Save'))}
              </Button>
            </Column>
          </Row>
        </Panel>
      )}

      {showOverrideForm && canApproveOverride && (
        <Panel title={String(t('billing.financial.grantOverride', 'Grant Billing Privilege'))}>
          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('billing.financial.reason', 'Reason'))}
                name="overrideReason"
                type="text"
                value={overrideData.reason}
                onChange={(event) => setOverrideData({ ...overrideData, reason: event.target.value })}
                isEditable
                isRequired
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('billing.financial.grantedBy', 'Granted By'))}
                name="overrideGrantedBy"
                type="text"
                value={overrideData.grantedBy}
                onChange={(event) => setOverrideData({ ...overrideData, grantedBy: event.target.value })}
                isEditable
                isRequired
              />
            </Column>
          </Row>
          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('billing.financial.approvedAmount', 'Approved Amount'))}
                name="overrideAmount"
                type="number"
                value={overrideData.approvedAmount}
                onChange={(event) => setOverrideData({ ...overrideData, approvedAmount: event.target.value })}
                isEditable
                isRequired
              />
            </Column>
            <Column md={6}>
              <DatePickerWithLabelFormGroup
                label={String(t('billing.financial.expiresAt', 'Expiry Date'))}
                name="overrideExpiry"
                value={overrideData.expiresAt ? new Date(overrideData.expiresAt) : undefined}
                onChange={(date) => setOverrideData({ ...overrideData, expiresAt: date.toISOString() })}
                isEditable
              />
            </Column>
          </Row>
          <Row>
            <Column>
              <TextInputWithLabelFormGroup
                label={String(t('billing.financial.notes', 'Notes'))}
                name="overrideNotes"
                type="text"
                value={overrideData.notes}
                onChange={(event) => setOverrideData({ ...overrideData, notes: event.target.value })}
                isEditable
              />
            </Column>
          </Row>
          <Row>
            <Column>
              <Button color="warning" onClick={handleCreateOverride} disabled={isCreatingOverride}>
                {String(t('actions.save', 'Save'))}
              </Button>
            </Column>
          </Row>
        </Panel>
      )}

      <Panel title={String(t('billing.financial.overrides', 'Billing Privileges'))}>
        {activeOverrides.length === 0 ? (
          <p>{t('billing.financial.noOverrides', 'No active billing privileges for this patient.')}</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-hover">
              <thead>
                <tr>
                  <th>{t('billing.financial.reason', 'Reason')}</th>
                  <th>{t('billing.financial.approvedAmount', 'Approved Amount')}</th>
                  <th>{t('billing.financial.grantedBy', 'Granted By')}</th>
                  <th>{t('billing.financial.expiresAt', 'Expiry Date')}</th>
                  <th>{t('billing.invoices.status', 'Status')}</th>
                  {canApproveOverride && <th>{t('actions.actions', 'Actions')}</th>}
                </tr>
              </thead>
              <tbody>
                {activeOverrides.map((override) => (
                  <tr key={override.id || override._id}>
                    <td>{override.reason}</td>
                    <td>{formatCurrency(override.approvedAmount || override.limitAmount || 0, wallet?.currency)}</td>
                    <td>{override.grantedBy}</td>
                    <td>{override.expiresAt ? new Date(override.expiresAt).toLocaleDateString() : '-'}</td>
                    <td>{override.status}</td>
                    {canApproveOverride && (
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
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title={String(t('billing.financial.transactions', 'Transactions'))}>
        {transactions.length === 0 ? (
          <p>{t('billing.financial.noTransactions', 'No recent transactions for this patient.')}</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-hover">
              <thead>
                <tr>
                  <th>{t('billing.financial.transactionType', 'Type')}</th>
                  <th>{t('billing.financial.direction', 'Direction')}</th>
                  <th>{t('billing.payments.amount', 'Amount')}</th>
                  <th>{t('billing.payments.paymentMethod', 'Payment Method')}</th>
                  <th>{t('billing.financial.postedAt', 'Posted At')}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id || transaction._id}>
                    <td>{transaction.transactionType}</td>
                    <td>{transaction.direction}</td>
                    <td>{formatCurrency(transaction.amount, transaction.currency || wallet?.currency)}</td>
                    <td>{transaction.paymentMethod || '-'}</td>
                    <td>{transaction.postedAt ? new Date(transaction.postedAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}

export default PatientFinancial
