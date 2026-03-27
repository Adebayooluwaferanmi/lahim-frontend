import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Container, Row, Column, Spinner, Alert } from '@lahim/components'
import { useQCResult } from '../../hooks/useQCResults'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'

const ViewQCResult = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: qcResult, isLoading, error } = useQCResult(id)
  const setButtonToolBar = useButtonToolbarSetter()

  useTitle(qcResult ? `${String(t('lims.qcResults.view', 'View QC Result'))} - ${qcResult.testName || id}` : t('lims.qcResults.view', 'View QC Result'))

  useAddBreadcrumbs(
    id
      ? [
          { i18nKey: 'lims.qcResults.label', location: '/lims/qc-results' },
          { i18nKey: 'lims.qcResults.view', location: `/lims/qc-results/${id}` },
        ]
      : [],
    true
  )

  useEffect(() => {
    setButtonToolBar([
      <Button
        key="backButton"
        outlined
        color="secondary"
        icon="left-arrow"
        iconLocation="left"
        onClick={() => navigate('/lims/qc-results')}
      >
        {String(t('actions.back', 'Back'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  if (isLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  if (error || !qcResult) {
    return (
      <Container>
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={String(error?.message || t('lims.qcResults.notFound', 'QC result not found'))} />
      </Container>
    )
  }

  return (
    <Container>
      <Panel title={`${String(t('lims.qcResults.view', 'View QC Result'))} - ${qcResult.testName || id}`}>
          <Row>
            <Column md={6}>
              <h4>{String(t('lims.qcResults.qcResultInformation', 'QC Result Information'))}</h4>
              <table className="table">
                <tbody>
                  <tr>
                    <td><strong>{String(t('lims.qcResults.testName', 'Test Name'))}</strong></td>
                    <td>{qcResult.testName || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.qcResults.material', 'Material'))}</strong></td>
                    <td>{qcResult.materialName || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.qcResults.lotNumber', 'Lot Number'))}</strong></td>
                    <td>{qcResult.materialLot || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.qcResults.instrument', 'Instrument'))}</strong></td>
                    <td>{qcResult.instrumentName || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.qcResults.measuredValue', 'Measured Value'))}</strong></td>
                    <td>{qcResult.measuredValue || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.qcResults.targetValue', 'Target Value'))}</strong></td>
                    <td>{qcResult.targetValue || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.qcResults.status', 'Status'))}</strong></td>
                    <td>
                      <span className={`badge badge-${qcResult.status === 'pass' ? 'success' : qcResult.status === 'fail' ? 'danger' : 'warning'}`}>
                        {qcResult.status || '-'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.qcResults.runDate', 'Run Date'))}</strong></td>
                    <td>{qcResult.runDate ? new Date(qcResult.runDate).toLocaleString() : '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>{String(t('lims.qcResults.runNumber', 'Run Number'))}</strong></td>
                    <td>{qcResult.runNumber || '-'}</td>
                  </tr>
                  {qcResult.notes && (
                    <tr>
                      <td><strong>{String(t('lims.qcResults.notes', 'Notes'))}</strong></td>
                      <td>{qcResult.notes}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Column>
            <Column md={6}>
              <h4>{String(t('lims.qcResults.westgardRules', 'Westgard Rules'))}</h4>
              {(qcResult as any).qcRuleViolations && Array.isArray((qcResult as any).qcRuleViolations) && (qcResult as any).qcRuleViolations.length > 0 ? (
                <div>
                  <Alert
                    color="danger"
                    title={String(t('lims.qcResults.ruleViolations', 'Rule Violations Detected'))}
                    message={String(t('lims.qcResults.ruleViolationsMessage', `${(qcResult as any).qcRuleViolations.length} Westgard rule violation(s) detected.`))}
                  />
                  <ul className="list-group" style={{ marginTop: '10px' }}>
                    {(qcResult as any).qcRuleViolations.map((violation: string, index: number) => (
                      <li key={index} className="list-group-item list-group-item-danger">
                        <strong>{violation}</strong> - {String(t(`lims.qcResults.rule.${violation}`, violation))}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Alert
                  color="success"
                  title={String(t('lims.qcResults.noViolations', 'No Rule Violations'))}
                  message={String(t('lims.qcResults.noViolationsMessage', 'All Westgard rules passed.'))}
                />
              )}
              {(qcResult as any).mean && (qcResult as any).standardDeviation && (
                <div style={{ marginTop: '20px' }}>
                  <h5>{String(t('lims.qcResults.statistics', 'QC Statistics'))}</h5>
                  <table className="table">
                    <tbody>
                      <tr>
                        <td><strong>{String(t('lims.qcResults.mean', 'Mean'))}</strong></td>
                        <td>{(qcResult as any).mean}</td>
                      </tr>
                      <tr>
                        <td><strong>{String(t('lims.qcResults.standardDeviation', 'Standard Deviation'))}</strong></td>
                        <td>{(qcResult as any).standardDeviation}</td>
                      </tr>
                      {(qcResult as any).measuredValue && (qcResult as any).mean && (qcResult as any).standardDeviation && (
                        <tr>
                          <td><strong>{String(t('lims.qcResults.zScore', 'Z-Score'))}</strong></td>
                          <td>
                            {((qcResult as any).standardDeviation !== 0
                              ? ((qcResult as any).measuredValue - (qcResult as any).mean) / (qcResult as any).standardDeviation
                              : 0
                            ).toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Column>
          </Row>
      </Panel>
    </Container>
  )
}

export default ViewQCResult

