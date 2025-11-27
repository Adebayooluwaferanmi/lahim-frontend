import React, { useState, useEffect, useCallback } from 'react'
import useTitle from '../../page-header/useTitle'
import { useTranslation } from 'react-i18next'
import format from 'date-fns/format'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import { Button } from '@hospitalrun/components'
import { useHistory } from 'react-router'

const Reports = () => {
  const { t } = useTranslation()
  const history = useHistory()
  const setButtons = useButtonToolbarSetter()
  useTitle(t('lims.reports.label'))

  const [reports, setReports] = useState<any[]>([])

  const getButtons = useCallback(() => {
    return [
      <Button
        icon="add"
        onClick={() => history.push('/lims/reports/generate')}
        outlined
        color="success"
        key="reports.generate"
      >
        {t('lims.reports.generate')}
      </Button>,
    ]
  }, [history, t])

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await fetch('/reports')
        const data = await response.json()
        setReports(data.reports || [])
      } catch (error) {
        console.error('Failed to fetch reports:', error)
      }
    }

    setButtons(getButtons())
    fetch()

    return () => {
      setButtons([])
    }
  }, [getButtons, setButtons])

  const onTableRowClick = (report: any) => {
    history.push(`/lims/reports/${report._id}`)
  }

  return (
    <>
      <table className="table table-hover">
        <thead className="thead-light">
          <tr>
            <th>{t('lims.reports.reportId')}</th>
            <th>{t('lims.reports.reportType')}</th>
            <th>{t('lims.reports.generatedOn')}</th>
            <th>{t('lims.reports.status')}</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr onClick={() => onTableRowClick(report)} key={report._id}>
              <td>{report._id}</td>
              <td>{report.reportType || '-'}</td>
              <td>{report.generatedOn ? format(new Date(report.generatedOn), 'yyyy-MM-dd hh:mm a') : '-'}</td>
              <td>{report.status || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default Reports

