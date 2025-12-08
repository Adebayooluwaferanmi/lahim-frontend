import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Container, Row, Column, Spinner, Alert, Modal } from '@hospitalrun/components'
import { useLabResult } from '../../hooks/useLabResults'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api-client'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import TextFieldWithLabelFormGroup from '../../components/input/TextFieldWithLabelFormGroup'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'

const ResultInterpretation = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: result, isLoading, error } = useLabResult(id)
  const setButtonToolBar = useButtonToolbarSetter()
  const queryClient = useQueryClient()

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showAddendumModal, setShowAddendumModal] = useState(false)
  const [showCorrelationModal, setShowCorrelationModal] = useState(false)

  const [reviewData, setReviewData] = useState({
    reviewedBy: '',
    reviewNotes: '',
    reviewStatus: 'reviewed' as 'reviewed' | 'pending' | 'approved',
    clinicalSignificance: '',
  })

  const [addendumData, setAddendumData] = useState({
    addendumText: '',
    addedBy: '',
  })

  const [correlationData, setCorrelationData] = useState({
    correlationText: '',
    correlatedBy: '',
    relatedResults: [] as string[],
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  useTitle(result ? `${String(t('lims.results.interpretation', 'Result Interpretation'))} - ${result.testCode?.coding?.[0]?.display || id}` : t('lims.results.interpretation', 'Result Interpretation'))

  useAddBreadcrumbs(
    id
      ? [
          { i18nKey: 'lims.results.label', location: '/lims/results' },
          { i18nKey: 'lims.results.interpretation', location: `/lims/results/${id}/interpretation` },
        ]
      : [],
    true
  )

  const reviewMutation = useMutation({
    mutationFn: async (data: typeof reviewData) => {
      return apiClient.post(`/lab-results/${id}/review`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-results', id] })
      queryClient.invalidateQueries({ queryKey: ['lab-results'] })
      setShowReviewModal(false)
      setReviewData({ reviewedBy: '', reviewNotes: '', reviewStatus: 'reviewed', clinicalSignificance: '' })
      setSubmitError(null)
    },
    onError: (err: Error) => {
      setSubmitError(err.message || t('lims.results.reviewError', 'Failed to review result'))
    },
  })

  const addendumMutation = useMutation({
    mutationFn: async (data: typeof addendumData) => {
      return apiClient.post(`/lab-results/${id}/addendum`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-results', id] })
      queryClient.invalidateQueries({ queryKey: ['lab-results'] })
      setShowAddendumModal(false)
      setAddendumData({ addendumText: '', addedBy: '' })
      setSubmitError(null)
    },
    onError: (err: Error) => {
      setSubmitError(err.message || t('lims.results.addendumError', 'Failed to add addendum'))
    },
  })

  const correlationMutation = useMutation({
    mutationFn: async (data: typeof correlationData) => {
      return apiClient.post(`/lab-results/${id}/correlation`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-results', id] })
      queryClient.invalidateQueries({ queryKey: ['lab-results'] })
      setShowCorrelationModal(false)
      setCorrelationData({ correlationText: '', correlatedBy: '', relatedResults: [] })
      setSubmitError(null)
    },
    onError: (err: Error) => {
      setSubmitError(err.message || t('lims.results.correlationError', 'Failed to add clinical correlation'))
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
        onClick={() => navigate(`/lims/results/${id}`)}
      >
        {String(t('actions.back', 'Back'))}
      </Button>,
      <Button
        key="reviewButton"
        color="primary"
        icon="user-md"
        iconLocation="left"
        onClick={() => setShowReviewModal(true)}
      >
        {String(t('lims.results.review', 'Review Result'))}
      </Button>,
      <Button
        key="addendumButton"
        color="info"
        icon="edit"
        iconLocation="left"
        onClick={() => setShowAddendumModal(true)}
      >
        {String(t('lims.results.addAddendum', 'Add Addendum'))}
      </Button>,
      <Button
        key="correlationButton"
        color="success"
        icon="link"
        iconLocation="left"
        onClick={() => setShowCorrelationModal(true)}
      >
        {String(t('lims.results.addCorrelation', 'Add Correlation'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t, id])

  const handleReviewSubmit = () => {
    setSubmitError(null)
    if (!reviewData.reviewedBy) {
      setSubmitError(t('lims.results.reviewedByRequired', 'Reviewed by is required'))
      return
    }
    reviewMutation.mutate(reviewData)
  }

  const handleAddendumSubmit = () => {
    setSubmitError(null)
    if (!addendumData.addendumText || !addendumData.addedBy) {
      setSubmitError(t('lims.results.addendumFieldsRequired', 'Addendum text and added by are required'))
      return
    }
    addendumMutation.mutate(addendumData)
  }

  const handleCorrelationSubmit = () => {
    setSubmitError(null)
    if (!correlationData.correlationText || !correlationData.correlatedBy) {
      setSubmitError(t('lims.results.correlationFieldsRequired', 'Correlation text and correlated by are required'))
      return
    }
    correlationMutation.mutate(correlationData)
  }

  if (isLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  if (error || !result) {
    return (
      <Container>
        <Alert
          color="danger"
          title={String(t('states.error', 'Error'))}
          message={String(error?.message || t('lims.results.notFound', 'Result not found'))}
        />
      </Container>
    )
  }

  const interpretation = (result as any).interpretation || {}

  return (
    <Container>
      <Panel title={String(t('lims.results.interpretation', 'Result Interpretation'))}>
        <Row>
          <Column md={6}>
            <h4>{String(t('lims.results.resultInformation', 'Result Information'))}</h4>
            <table className="table">
              <tbody>
                <tr>
                  <td><strong>{String(t('lims.results.testName', 'Test Name'))}</strong></td>
                  <td>{result.testCode?.coding?.[0]?.display || result.testCode?.text || '-'}</td>
                </tr>
                <tr>
                  <td><strong>{String(t('lims.results.resultType', 'Result Type'))}</strong></td>
                  <td>{result.resultType || '-'}</td>
                </tr>
                <tr>
                  <td><strong>{String(t('lims.results.status', 'Status'))}</strong></td>
                  <td>
                    <span className={`badge badge-${result.status === 'final' ? 'success' : 'warning'}`}>
                      {result.status || '-'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td><strong>{String(t('lims.results.value', 'Value'))}</strong></td>
                  <td>{result.value || '-'} {result.unit || ''}</td>
                </tr>
              </tbody>
            </table>
          </Column>
          <Column md={6}>
            <h4>{String(t('lims.results.pathologistReview', 'Pathologist Review'))}</h4>
            {interpretation.reviewedBy ? (
              <div>
                <table className="table">
                  <tbody>
                    <tr>
                      <td><strong>{String(t('lims.results.reviewedBy', 'Reviewed By'))}</strong></td>
                      <td>{interpretation.reviewedBy}</td>
                    </tr>
                    <tr>
                      <td><strong>{String(t('lims.results.reviewedOn', 'Reviewed On'))}</strong></td>
                      <td>{interpretation.reviewedOn ? new Date(interpretation.reviewedOn).toLocaleString() : '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>{String(t('lims.results.reviewStatus', 'Review Status'))}</strong></td>
                      <td>
                        <span className={`badge badge-${interpretation.reviewStatus === 'approved' ? 'success' : 'warning'}`}>
                          {interpretation.reviewStatus || '-'}
                        </span>
                      </td>
                    </tr>
                    {interpretation.reviewNotes && (
                      <tr>
                        <td><strong>{String(t('lims.results.reviewNotes', 'Review Notes'))}</strong></td>
                        <td>{interpretation.reviewNotes}</td>
                      </tr>
                    )}
                    {interpretation.clinicalSignificance && (
                      <tr>
                        <td><strong>{String(t('lims.results.clinicalSignificance', 'Clinical Significance'))}</strong></td>
                        <td>{interpretation.clinicalSignificance}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <Alert
                color="info"
                title={String(t('lims.results.noReview', 'No Review'))}
                message={String(t('lims.results.noReviewMessage', 'This result has not been reviewed yet.'))}
              />
            )}
          </Column>
        </Row>

        {interpretation.addendums && interpretation.addendums.length > 0 && (
          <Row>
            <Column md={12}>
              <h4>{String(t('lims.results.addendums', 'Addendums'))}</h4>
              <div className="list-group">
                {interpretation.addendums.map((addendum: any, index: number) => (
                  <div key={index} className="list-group-item">
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong>{addendum.addedBy}</strong>
                        <span className="text-muted ml-2">
                          {addendum.addedOn ? new Date(addendum.addedOn).toLocaleString() : ''}
                        </span>
                      </div>
                    </div>
                    <p className="mb-0 mt-2">{addendum.text}</p>
                  </div>
                ))}
              </div>
            </Column>
          </Row>
        )}

        {interpretation.clinicalCorrelations && interpretation.clinicalCorrelations.length > 0 && (
          <Row>
            <Column md={12}>
              <h4>{String(t('lims.results.clinicalCorrelations', 'Clinical Correlations'))}</h4>
              <div className="list-group">
                {interpretation.clinicalCorrelations.map((correlation: any, index: number) => (
                  <div key={index} className="list-group-item">
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong>{correlation.correlatedBy}</strong>
                        <span className="text-muted ml-2">
                          {correlation.correlatedOn ? new Date(correlation.correlatedOn).toLocaleString() : ''}
                        </span>
                      </div>
                    </div>
                    <p className="mb-0 mt-2">{correlation.text}</p>
                    {correlation.relatedResults && correlation.relatedResults.length > 0 && (
                      <div className="mt-2">
                        <small className="text-muted">
                          {String(t('lims.results.relatedResults', 'Related Results'))}: {correlation.relatedResults.join(', ')}
                        </small>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Column>
          </Row>
        )}
      </Panel>

      {/* Review Modal */}
      <Modal
        show={showReviewModal}
        toggle={() => {
          setShowReviewModal(false)
          setSubmitError(null)
        }}
        title={String(t('lims.results.review', 'Review Result'))}
        body={
          <div>
            {submitError && (
              <Alert
                color="danger"
                title={String(t('states.error', 'Error'))}
                message={String(submitError)}
              />
            )}
            <TextInputWithLabelFormGroup
              name="reviewedBy"
              label={String(t('lims.results.reviewedBy', 'Reviewed By'))}
              isRequired
              value={reviewData.reviewedBy}
              onChange={(e) => setReviewData({ ...reviewData, reviewedBy: e.target.value })}
              isEditable
            />
            <div className="form-group">
              <label>{String(t('lims.results.reviewStatus', 'Review Status'))}</label>
              <select
                className="form-control"
                value={reviewData.reviewStatus}
                onChange={(e) => setReviewData({ ...reviewData, reviewStatus: e.target.value as any })}
              >
                <option value="reviewed">{String(t('lims.results.status.reviewed', 'Reviewed'))}</option>
                <option value="pending">{String(t('lims.results.status.pending', 'Pending'))}</option>
                <option value="approved">{String(t('lims.results.status.approved', 'Approved'))}</option>
              </select>
            </div>
            <TextFieldWithLabelFormGroup
              name="reviewNotes"
              label={String(t('lims.results.reviewNotes', 'Review Notes'))}
              value={reviewData.reviewNotes}
              onChange={(e) => setReviewData({ ...reviewData, reviewNotes: e.target.value })}
              isEditable
              rows={4}
            />
            <TextInputWithLabelFormGroup
              name="clinicalSignificance"
              label={String(t('lims.results.clinicalSignificance', 'Clinical Significance'))}
              value={reviewData.clinicalSignificance}
              onChange={(e) => setReviewData({ ...reviewData, clinicalSignificance: e.target.value })}
              isEditable
            />
          </div>
        }
        closeButton={{
          children: String(t('actions.cancel', 'Cancel')),
          color: 'danger',
          onClick: () => {
            setShowReviewModal(false)
            setSubmitError(null)
          },
        }}
        successButton={{
          children: String(t('lims.results.submitReview', 'Submit Review')),
          color: 'success',
          icon: 'save',
          iconLocation: 'left',
          onClick: handleReviewSubmit,
          disabled: !reviewData.reviewedBy || reviewMutation.isPending,
        }}
      />

      {/* Addendum Modal */}
      <Modal
        show={showAddendumModal}
        toggle={() => {
          setShowAddendumModal(false)
          setSubmitError(null)
        }}
        title={String(t('lims.results.addAddendum', 'Add Addendum'))}
        body={
          <div>
            {submitError && (
              <Alert
                color="danger"
                title={String(t('states.error', 'Error'))}
                message={String(submitError)}
              />
            )}
            <TextInputWithLabelFormGroup
              name="addedBy"
              label={String(t('lims.results.addedBy', 'Added By'))}
              isRequired
              value={addendumData.addedBy}
              onChange={(e) => setAddendumData({ ...addendumData, addedBy: e.target.value })}
              isEditable
            />
            <TextFieldWithLabelFormGroup
              name="addendumText"
              label={String(t('lims.results.addendumText', 'Addendum Text'))}
              isRequired
              value={addendumData.addendumText}
              onChange={(e) => setAddendumData({ ...addendumData, addendumText: e.target.value })}
              isEditable
              rows={6}
            />
          </div>
        }
        closeButton={{
          children: String(t('actions.cancel', 'Cancel')),
          color: 'danger',
          onClick: () => {
            setShowAddendumModal(false)
            setSubmitError(null)
          },
        }}
        successButton={{
          children: String(t('lims.results.addAddendum', 'Add Addendum')),
          color: 'success',
          icon: 'save',
          iconLocation: 'left',
          onClick: handleAddendumSubmit,
          disabled: !addendumData.addendumText || !addendumData.addedBy || addendumMutation.isPending,
        }}
      />

      {/* Correlation Modal */}
      <Modal
        show={showCorrelationModal}
        toggle={() => {
          setShowCorrelationModal(false)
          setSubmitError(null)
        }}
        title={String(t('lims.results.addCorrelation', 'Add Clinical Correlation'))}
        body={
          <div>
            {submitError && (
              <Alert
                color="danger"
                title={String(t('states.error', 'Error'))}
                message={String(submitError)}
              />
            )}
            <TextInputWithLabelFormGroup
              name="correlatedBy"
              label={String(t('lims.results.correlatedBy', 'Correlated By'))}
              isRequired
              value={correlationData.correlatedBy}
              onChange={(e) => setCorrelationData({ ...correlationData, correlatedBy: e.target.value })}
              isEditable
            />
            <TextFieldWithLabelFormGroup
              name="correlationText"
              label={String(t('lims.results.correlationText', 'Correlation Text'))}
              isRequired
              value={correlationData.correlationText}
              onChange={(e) => setCorrelationData({ ...correlationData, correlationText: e.target.value })}
              isEditable
              rows={6}
            />
            <TextInputWithLabelFormGroup
              name="relatedResults"
              label={String(t('lims.results.relatedResults', 'Related Results (comma-separated IDs)'))}
              value={correlationData.relatedResults.join(', ')}
              onChange={(e) => setCorrelationData({ ...correlationData, relatedResults: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
              isEditable
              placeholder="result-id-1, result-id-2"
            />
          </div>
        }
        closeButton={{
          children: String(t('actions.cancel', 'Cancel')),
          color: 'danger',
          onClick: () => {
            setShowCorrelationModal(false)
            setSubmitError(null)
          },
        }}
        successButton={{
          children: String(t('lims.results.addCorrelation', 'Add Correlation')),
          color: 'success',
          icon: 'save',
          iconLocation: 'left',
          onClick: handleCorrelationSubmit,
          disabled: !correlationData.correlationText || !correlationData.correlatedBy || correlationMutation.isPending,
        }}
      />
    </Container>
  )
}

export default ResultInterpretation


