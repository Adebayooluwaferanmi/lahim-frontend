import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, TextInput, Spinner, Alert } from '@hospitalrun/components'
import { useQCResults } from '../../hooks/useQCResults'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'

const breadcrumbs = [{ i18nKey: 'lims.qcResults.label', location: '/lims/qc-results' }]

const QCResults = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.qcResults.label', 'QC Results'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [testCodeFilter, setTestCodeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: qcResults = [], isLoading, error } = useQCResults({
    testCode: testCodeFilter || undefined,
    status: statusFilter || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="newQCResultButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/lims/qc-results/new')}
      >
        {String(t('lims.qcResults.new', 'New QC Result'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

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
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={String(error.message || t('lims.qcResults.loadError', 'Failed to load QC results'))} />
      </Container>
    )
  }

  return (
    <Container>
      <Row>
        <Column md={6}>
          <TextInput
            placeholder={String(t('lims.qcResults.testCodePlaceholder', 'Test Code'))}
            value={testCodeFilter}
            onChange={(e) => setTestCodeFilter(e.target.value)}
          />
        </Column>
        <Column md={6}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{String(t('lims.qcResults.allStatus', 'All Status'))}</option>
            <option value="pass">{String(t('lims.qcResults.status.pass', 'Pass'))}</option>
            <option value="fail">{String(t('lims.qcResults.status.fail', 'Fail'))}</option>
            <option value="warning">{String(t('lims.qcResults.status.warning', 'Warning'))}</option>
          </select>
        </Column>
      </Row>

      <Row>
        <Column>
          {qcResults.length === 0 ? (
            <div>{String(t('lims.qcResults.noResults', 'No QC results found'))}</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{String(t('lims.qcResults.testName', 'Test Name'))}</th>
                  <th>{String(t('lims.qcResults.material', 'Material'))}</th>
                  <th>{String(t('lims.qcResults.lotNumber', 'Lot Number'))}</th>
                  <th>{String(t('lims.qcResults.measuredValue', 'Measured Value'))}</th>
                  <th>{String(t('lims.qcResults.targetValue', 'Target Value'))}</th>
                  <th>{String(t('lims.qcResults.status', 'Status'))}</th>
                  <th>{String(t('lims.qcResults.runDate', 'Run Date'))}</th>
                  <th>{String(t('actions.view', 'View'))}</th>
                </tr>
              </thead>
              <tbody>
                {qcResults.map((result) => (
                  <tr key={result.id || result._id}>
                    <td>{result.testName || '-'}</td>
                    <td>{result.materialName || '-'}</td>
                    <td>{result.materialLot || '-'}</td>
                    <td>{result.measuredValue || '-'}</td>
                    <td>{result.targetValue || '-'}</td>
                    <td>
                      <span className={`badge badge-${result.status === 'pass' ? 'success' : result.status === 'fail' ? 'danger' : 'warning'}`}>
                        {result.status || '-'}
                      </span>
                    </td>
                    <td>{result.runDate ? new Date(result.runDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/lims/qc-results/${result.id || result._id}`)}
                      >
                        {String(t('actions.view', 'View'))}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Column>
      </Row>
    </Container>
  )
}

export default QCResults

