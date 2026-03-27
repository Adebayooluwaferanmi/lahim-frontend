import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Container, Row, Column, Panel, Spinner, Alert, Table } from '@lahim/components'
import useTitle from '../page-header/useTitle'
import { useVisits } from '../hooks/useVisits'
import { usePrescriptions } from '../hooks/useMedications'
import { useInvoices } from '../hooks/useBilling'
import { useImagingOrders } from '../hooks/useImaging'
import { useIncidents } from '../hooks/useIncidents'

const Dashboard: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('dashboard.label', 'Dashboard'))

  // Fetch recent data
  const { data: recentVisits = [], isLoading: visitsLoading } = useVisits({ limit: 5 })
  const { data: recentPrescriptions = [], isLoading: prescriptionsLoading } = usePrescriptions({ limit: 5 })
  const { data: recentInvoices = [], isLoading: invoicesLoading } = useInvoices({ limit: 5 })
  const { data: recentImaging = [], isLoading: imagingLoading } = useImagingOrders({ limit: 5 })
  const { data: recentIncidents = [], isLoading: incidentsLoading } = useIncidents({ limit: 5 })

  // Get counts
  const { data: allVisits = [] } = useVisits({ limit: 1000 })
  const { data: allPrescriptions = [] } = usePrescriptions({ limit: 1000 })
  const { data: allInvoices = [] } = useInvoices({ limit: 1000 })

  const isLoading = visitsLoading || prescriptionsLoading || invoicesLoading || imagingLoading || incidentsLoading

  // Calculate statistics
  const totalVisits = allVisits.length
  const activeVisits = allVisits.filter((v) => v.status === 'Admitted').length
  const totalPrescriptions = allPrescriptions.length
  const activePrescriptions = allPrescriptions.filter((p) => p.status === 'active').length
  const totalInvoices = allInvoices.length
  const pendingInvoices = allInvoices.filter((inv) => inv.status === 'Draft' || inv.status === 'Pending').length
  const totalRevenue = allInvoices.reduce((sum, inv) => sum + (inv.paidTotal || 0), 0)
  const outstandingBalance = allInvoices.reduce((sum, inv) => sum + (inv.balance || 0), 0)

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <Container>
        <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
      </Container>
    )
  }

  return (
    <Container>
      <Row>
        <Column md={12}>
          <h2>{t('dashboard.welcome', 'Welcome to LaHIM Dashboard')}</h2>
        </Column>
      </Row>

      {/* Statistics Cards */}
      <Row>
        <Column md={3}>
          <Panel color="primary">
            <h4>{t('dashboard.statistics.visits', 'Total Visits')}</h4>
            <h2>{totalVisits}</h2>
            <p className="text-muted">
              {t('dashboard.statistics.activeVisits', 'Active')}: {activeVisits}
            </p>
          </Panel>
        </Column>
        <Column md={3}>
          <Panel color="success">
            <h4>{t('dashboard.statistics.prescriptions', 'Prescriptions')}</h4>
            <h2>{totalPrescriptions}</h2>
            <p className="text-muted">
              {t('dashboard.statistics.activePrescriptions', 'Active')}: {activePrescriptions}
            </p>
          </Panel>
        </Column>
        <Column md={3}>
          <Panel color="info">
            <h4>{t('dashboard.statistics.invoices', 'Invoices')}</h4>
            <h2>{totalInvoices}</h2>
            <p className="text-muted">
              {t('dashboard.statistics.pendingInvoices', 'Pending')}: {pendingInvoices}
            </p>
          </Panel>
        </Column>
        <Column md={3}>
          <Panel color="warning">
            <h4>{t('dashboard.statistics.revenue', 'Revenue')}</h4>
            <h2>${totalRevenue.toFixed(2)}</h2>
            <p className="text-muted">
              {t('dashboard.statistics.outstanding', 'Outstanding')}: ${outstandingBalance.toFixed(2)}
            </p>
          </Panel>
        </Column>
      </Row>

      {/* Recent Activities */}
      <Row className="mt-4">
        <Column md={6}>
          <Panel title={String(t('dashboard.recentVisits', 'Recent Visits'))}>
            {recentVisits.length > 0 ? (
              <Table
                data={recentVisits}
                getID={(row) => row.id || row._id}
                columns={[
                  {
                    label: t('visits.patientId', 'Patient ID'),
                    key: 'patientId',
                  },
                  {
                    label: t('visits.visitType', 'Type'),
                    key: 'visitType',
                  },
                  {
                    label: t('visits.status', 'Status'),
                    key: 'status',
                  },
                  {
                    label: t('visits.startDate', 'Start Date'),
                    key: 'startDate',
                    formatter: (row: any) => formatDate(row.startDate),
                  },
                ]}
                actionsHeaderText={t('actions.label', 'Actions')}
                actions={[
                  {
                    label: t('actions.view', 'View'),
                    action: (row: any) => navigate(`/visits/${row.id || row._id}`),
                  },
                ]}
              />
            ) : (
              <p>{t('dashboard.noRecentVisits', 'No recent visits')}</p>
            )}
            <div className="mt-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => navigate('/visits')}
              >
                {t('dashboard.viewAll', 'View All')}
              </button>
            </div>
          </Panel>
        </Column>

        <Column md={6}>
          <Panel title={String(t('dashboard.recentPrescriptions', 'Recent Prescriptions'))}>
            {recentPrescriptions.length > 0 ? (
              <Table
                data={recentPrescriptions}
                getID={(row) => row.id || row._id}
                columns={[
                  {
                    label: t('prescriptions.patientId', 'Patient ID'),
                    key: 'patientId',
                  },
                  {
                    label: t('prescriptions.medicationName', 'Medication'),
                    key: 'medicationName',
                  },
                  {
                    label: t('prescriptions.status', 'Status'),
                    key: 'status',
                  },
                  {
                    label: t('prescriptions.startDate', 'Start Date'),
                    key: 'startDate',
                    formatter: (row: any) => formatDate(row.startDate),
                  },
                ]}
                actionsHeaderText={t('actions.label', 'Actions')}
                actions={[
                  {
                    label: t('actions.view', 'View'),
                    action: (row: any) => navigate(`/prescriptions/${row.id || row._id}`),
                  },
                ]}
              />
            ) : (
              <p>{t('dashboard.noRecentPrescriptions', 'No recent prescriptions')}</p>
            )}
            <div className="mt-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => navigate('/prescriptions')}
              >
                {t('dashboard.viewAll', 'View All')}
              </button>
            </div>
          </Panel>
        </Column>
      </Row>

      <Row className="mt-4">
        <Column md={6}>
          <Panel title={String(t('dashboard.recentInvoices', 'Recent Invoices'))}>
            {recentInvoices.length > 0 ? (
              <Table
                data={recentInvoices}
                getID={(row) => row.id || row._id}
                columns={[
                  {
                    label: t('billing.invoiceNumber', 'Invoice #'),
                    key: 'invoiceNumber',
                  },
                  {
                    label: t('billing.patientId', 'Patient ID'),
                    key: 'patientId',
                  },
                  {
                    label: t('billing.status', 'Status'),
                    key: 'status',
                  },
                  {
                    label: t('billing.total', 'Total'),
                    key: 'total',
                    formatter: (row: any) => `$${(row.total || 0).toFixed(2)}`,
                  },
                ]}
                actionsHeaderText={t('actions.label', 'Actions')}
                actions={[
                  {
                    label: t('actions.view', 'View'),
                    action: (row: any) => navigate(`/billing/invoices/${row.id || row._id}`),
                  },
                ]}
              />
            ) : (
              <p>{t('dashboard.noRecentInvoices', 'No recent invoices')}</p>
            )}
            <div className="mt-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => navigate('/billing/invoices')}
              >
                {t('dashboard.viewAll', 'View All')}
              </button>
            </div>
          </Panel>
        </Column>

        <Column md={6}>
          <Panel title={String(t('dashboard.recentImaging', 'Recent Imaging Orders'))}>
            {recentImaging.length > 0 ? (
              <Table
                data={recentImaging}
                getID={(row) => row.id || row._id}
                columns={[
                  {
                    label: t('imaging.patientId', 'Patient ID'),
                    key: 'patientId',
                  },
                  {
                    label: t('imaging.imagingType', 'Type'),
                    key: 'imagingTypeName',
                  },
                  {
                    label: t('imaging.status', 'Status'),
                    key: 'status',
                  },
                  {
                    label: t('imaging.requestedDate', 'Requested'),
                    key: 'requestedDate',
                    formatter: (row: any) => formatDate(row.requestedDate),
                  },
                ]}
                actionsHeaderText={t('actions.label', 'Actions')}
                actions={[
                  {
                    label: t('actions.view', 'View'),
                    action: (row: any) => navigate(`/imaging/${row.id || row._id}`),
                  },
                ]}
              />
            ) : (
              <p>{t('dashboard.noRecentImaging', 'No recent imaging orders')}</p>
            )}
            <div className="mt-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => navigate('/imaging')}
              >
                {t('dashboard.viewAll', 'View All')}
              </button>
            </div>
          </Panel>
        </Column>
      </Row>

      {/* Quick Actions */}
      <Row className="mt-4">
        <Column md={12}>
          <Panel title={String(t('dashboard.quickActions', 'Quick Actions'))}>
            <div className="d-flex flex-wrap gap-2">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/patients/new')}
              >
                {t('dashboard.actions.newPatient', 'New Patient')}
              </button>
              <button
                className="btn btn-success"
                onClick={() => navigate('/visits/new')}
              >
                {t('dashboard.actions.newVisit', 'New Visit')}
              </button>
              <button
                className="btn btn-info"
                onClick={() => navigate('/prescriptions/new')}
              >
                {t('dashboard.actions.newPrescription', 'New Prescription')}
              </button>
              <button
                className="btn btn-warning"
                onClick={() => navigate('/billing/invoices/new')}
              >
                {t('dashboard.actions.newInvoice', 'New Invoice')}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/imaging/new')}
              >
                {t('dashboard.actions.newImaging', 'New Imaging Order')}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => navigate('/incidents/new')}
              >
                {t('dashboard.actions.newIncident', 'Report Incident')}
              </button>
            </div>
          </Panel>
        </Column>
      </Row>
    </Container>
  )
}

export default Dashboard
