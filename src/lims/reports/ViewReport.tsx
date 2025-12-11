import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Container, Row, Column, Spinner, Alert, Modal } from '@hospitalrun/components'
import { useReport, useDeliverReport } from '../../hooks/useReports'
import { apiClient } from '../../lib/api-client'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'

const ViewReport = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: report, isLoading, error } = useReport(id)
  const setButtonToolBar = useButtonToolbarSetter()
  const deliverMutation = useDeliverReport()

  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [deliveryMethods, setDeliveryMethods] = useState<string[]>([])
  const [emailAddress, setEmailAddress] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [deliveryError, setDeliveryError] = useState<string | null>(null)

  useTitle(report ? `${String(t('lims.reports.view', 'View Report'))} - ${report.reportNumber || id}` : t('lims.reports.view', 'View Report'))

  useAddBreadcrumbs(
    id
      ? [
          { i18nKey: 'lims.reports.label', location: '/lims/reports' },
          { i18nKey: 'lims.reports.view', location: `/lims/reports/${id}` },
        ]
      : [],
    true
  )

  const handleDeliveryMethodToggle = (method: string) => {
    setDeliveryMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    )
    setDeliveryError(null)
  }

  const handleDeliver = () => {
    setDeliveryError(null)

    if (deliveryMethods.length === 0) {
      setDeliveryError(t('lims.reports.deliveryMethodRequired', 'At least one delivery method is required'))
      return
    }

    if (deliveryMethods.includes('email') && !emailAddress) {
      setDeliveryError(t('lims.reports.emailRequired', 'Email address is required for email delivery'))
      return
    }

    deliverMutation.mutate(
      {
        id: id!,
        methods: deliveryMethods as ('email' | 'portal' | 'print' | 'api' | 'hl7')[],
        emailAddress: emailAddress || undefined,
        recipientName: recipientName || undefined,
      },
      {
        onSuccess: () => {
          setShowDeliveryModal(false)
          setDeliveryMethods([])
          setEmailAddress('')
          setRecipientName('')
          setDeliveryError(null)
        },
        onError: (err: Error) => {
          setDeliveryError(err.message || t('lims.reports.deliveryError', 'Failed to deliver report'))
        },
      }
    )
  }

  useEffect(() => {
    const buttons = [
      <Button
        key="backButton"
        outlined
        color="secondary"
        icon="left-arrow"
        iconLocation="left"
        onClick={() => navigate('/lims/reports')}
      >
        {String(t('actions.back', 'Back'))}
      </Button>,
    ]

    // Add PDF download button (always available)
    buttons.push(
      <Button
        key="downloadPdfButton"
        color="info"
        icon="download"
        iconLocation="left"
        onClick={() => {
          // Download PDF report
          const pdfUrl = `${apiClient.defaults.baseURL || ''}/reports/${id}/pdf`
          const link = document.createElement('a')
          link.href = pdfUrl
          link.download = `report-${report?.reportNumber || id}.pdf`
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }}
      >
        {String(t('lims.reports.downloadPdf', 'Download PDF'))}
      </Button>
    )

    if (report && report.status !== 'delivered' && report.status !== 'cancelled') {
      buttons.push(
        <Button
          key="deliverButton"
          color="primary"
          icon="paper-plane"
          iconLocation="left"
          onClick={() => setShowDeliveryModal(true)}
        >
          {String(t('lims.reports.deliver', 'Deliver Report'))}
        </Button>
      )
    }

    setButtonToolBar(buttons)

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t, report])

  if (isLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  if (error || !report) {
    return (
      <Container>
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={String(error?.message || t('lims.reports.notFound', 'Report not found'))} />
      </Container>
    )
  }

  return (
    <Container>
      <Panel title={`${String(t('lims.reports.view', 'View Report'))} - ${report.reportNumber || id}`}>
          <Row>
            <Column md={6}>
              <h4>{String(t('lims.reports.reportInformation', 'Report Information'))}</h4>
              <table className="table">
                <tbody>
                  <tr>
                    <td><strong>{String(t('lims.reports.reportNumber', 'Report Number'))}</strong></td>
                    <td>{report.reportNumber || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.reports.patientName', 'Patient Name'))}</strong></td>
                    <td>{report.patientName || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.reports.patientId', 'Patient ID'))}</strong></td>
                    <td>{report.patientId || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.reports.status', 'Status'))}</strong></td>
                    <td>
                      <span className={`badge badge-${report.status === 'delivered' ? 'success' : 'warning'}`}>
                        {report.status || '-'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.reports.reportDate', 'Report Date'))}</strong></td>
                    <td>{report.reportDate ? new Date(report.reportDate).toLocaleString() : '-'}</td>
                  </tr>
                  {report.signedBy && (
                    <>
                      <tr>
                        <td><strong>{String(t('lims.reports.signedBy', 'Signed By'))}</strong></td>
                        <td>{report.signedBy}</td>
                      </tr>
                      <tr>
                        <td><strong>{String(t('lims.reports.signedDate', 'Signed Date'))}</strong></td>
                        <td>{report.signedDate ? new Date(report.signedDate).toLocaleString() : '-'}</td>
                      </tr>
                    </>
                  )}
                  {report.deliveredBy && (
                    <>
                      <tr>
                        <td><strong>{String(t('lims.reports.deliveredBy', 'Delivered By'))}</strong></td>
                        <td>{report.deliveredBy}</td>
                      </tr>
                      <tr>
                        <td><strong>{String(t('lims.reports.deliveredDate', 'Delivered Date'))}</strong></td>
                        <td>{report.deliveredDate ? new Date(report.deliveredDate).toLocaleString() : '-'}</td>
                      </tr>
                      <tr>
                        <td><strong>{String(t('lims.reports.deliveryMethod', 'Delivery Method'))}</strong></td>
                        <td>{report.deliveryMethod || '-'}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </Column>
          </Row>
      </Panel>

      <Modal
        show={showDeliveryModal}
        toggle={() => {
          setShowDeliveryModal(false)
          setDeliveryMethods([])
          setEmailAddress('')
          setRecipientName('')
          setDeliveryError(null)
        }}
        title={String(t('lims.reports.deliver', 'Deliver Report'))}
        body={
          <div>
            {deliveryError && (
              <Alert
                color="danger"
                title={String(t('states.error', 'Error'))}
                message={String(deliveryError)}
              />
            )}

            <h5>{String(t('lims.reports.deliveryMethods', 'Delivery Methods'))}</h5>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={deliveryMethods.includes('email')}
                  onChange={() => handleDeliveryMethodToggle('email')}
                />
                {' '}
                {String(t('lims.reports.deliveryMethod.email', 'Email'))}
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={deliveryMethods.includes('portal')}
                  onChange={() => handleDeliveryMethodToggle('portal')}
                />
                {' '}
                {String(t('lims.reports.deliveryMethod.portal', 'Patient Portal'))}
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={deliveryMethods.includes('print')}
                  onChange={() => handleDeliveryMethodToggle('print')}
                />
                {' '}
                {String(t('lims.reports.deliveryMethod.print', 'Print Queue'))}
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={deliveryMethods.includes('api')}
                  onChange={() => handleDeliveryMethodToggle('api')}
                />
                {' '}
                {String(t('lims.reports.deliveryMethod.api', 'API'))}
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={deliveryMethods.includes('hl7')}
                  onChange={() => handleDeliveryMethodToggle('hl7')}
                />
                {' '}
                {String(t('lims.reports.deliveryMethod.hl7', 'HL7'))}
              </label>
            </div>

            {deliveryMethods.includes('email') && (
              <TextInputWithLabelFormGroup
                name="emailAddress"
                label={String(t('lims.reports.emailAddress', 'Email Address'))}
                isRequired
                value={emailAddress}
                onChange={(e) => {
                  setEmailAddress(e.target.value)
                  setDeliveryError(null)
                }}
                isEditable
                type="email"
              />
            )}

            <TextInputWithLabelFormGroup
              name="recipientName"
              label={String(t('lims.reports.recipientName', 'Recipient Name (Optional)'))}
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              isEditable
            />
          </div>
        }
        closeButton={{
          children: String(t('actions.cancel', 'Cancel')),
          color: 'danger',
          onClick: () => {
            setShowDeliveryModal(false)
            setDeliveryMethods([])
            setEmailAddress('')
            setRecipientName('')
            setDeliveryError(null)
          },
        }}
        successButton={{
          children: String(t('lims.reports.deliver', 'Deliver')),
          color: 'success',
          icon: 'paper-plane',
          iconLocation: 'left',
          onClick: handleDeliver,
          disabled: deliveryMethods.length === 0 || deliverMutation.isPending,
        }}
      />
    </Container>
  )
}

export default ViewReport

