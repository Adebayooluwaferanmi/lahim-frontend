import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, Spinner, Alert } from '@hospitalrun/components'
import { useWorklists } from '../../hooks/useWorklists'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'

const breadcrumbs = [{ i18nKey: 'lims.worklists.label', location: '/lims/worklists' }]

const Worklists = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.worklists.label', 'Worklists'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [sectionFilter, setSectionFilter] = useState('')

  const { data: worklists = [], isLoading, error } = useWorklists({
    section: sectionFilter || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="generateWorklistButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/lims/worklists/generate')}
      >
        {String(t('lims.worklists.generate', 'Generate Worklist'))}
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
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={String(error.message || t('lims.worklists.loadError', 'Failed to load worklists'))} />
      </Container>
    )
  }

  return (
    <Container>
      <Row>
        <Column md={6}>
          <select
            className="form-control"
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
          >
            <option value="">{String(t('lims.worklists.allSections', 'All Sections'))}</option>
            <option value="chemistry">{String(t('lims.worklists.section.chemistry', 'Chemistry'))}</option>
            <option value="hematology">{String(t('lims.worklists.section.hematology', 'Hematology'))}</option>
            <option value="microbiology">{String(t('lims.worklists.section.microbiology', 'Microbiology'))}</option>
            <option value="immunology">{String(t('lims.worklists.section.immunology', 'Immunology'))}</option>
          </select>
        </Column>
      </Row>

      <Row>
        <Column>
          {worklists.length === 0 ? (
            <div>{String(t('lims.worklists.noWorklists', 'No worklists found'))}</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{String(t('lims.worklists.worklistNumber', 'Worklist Number'))}</th>
                  <th>{String(t('lims.worklists.section', 'Section'))}</th>
                  <th>{String(t('lims.worklists.status', 'Status'))}</th>
                  <th>{String(t('lims.worklists.generatedDate', 'Generated Date'))}</th>
                  <th>{String(t('lims.worklists.itemCount', 'Item Count'))}</th>
                  <th>{String(t('actions.view', 'View'))}</th>
                </tr>
              </thead>
              <tbody>
                {worklists.map((worklist) => (
                  <tr key={worklist.id || worklist._id}>
                    <td>{worklist.worklistNumber || '-'}</td>
                    <td>{worklist.section || '-'}</td>
                    <td>
                      <span className={`badge badge-${worklist.status === 'completed' ? 'success' : 'warning'}`}>
                        {worklist.status || '-'}
                      </span>
                    </td>
                    <td>{worklist.generatedDate ? new Date(worklist.generatedDate).toLocaleDateString() : '-'}</td>
                    <td>{worklist.items?.length || 0}</td>
                    <td>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/lims/worklists/${worklist.id || worklist._id}`)}
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

export default Worklists

