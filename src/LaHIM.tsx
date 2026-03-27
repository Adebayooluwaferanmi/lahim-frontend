import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@lahim/components'
import Appointments from 'scheduling/appointments/Appointments'
import NewAppointment from 'scheduling/appointments/new/NewAppointment'
import EditAppointment from 'scheduling/appointments/edit/EditAppointment'
import ViewAppointment from 'scheduling/appointments/view/ViewAppointment'
import Breadcrumbs from 'breadcrumbs/Breadcrumbs'
import { ButtonBarProvider } from 'page-header/ButtonBarProvider'
import ButtonToolBar from 'page-header/ButtonToolBar'
import Labs from 'labs/Labs'
import LIMS from './lims/LIMS'
import Sidebar from './components/Sidebar'
import Permissions from './model/Permissions'
import Dashboard from './dashboard/Dashboard'
import { useUserStore } from './store/user-store'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import Patients from './patients/Patients'
import Visits from './visits/Visits'
import NewVisit from './visits/NewVisit'
import ViewVisit from './visits/ViewVisit'
import Settings from './settings/Settings'
import Medications from './medications/Medications'
import Prescriptions from './medications/Prescriptions'
import NewPrescription from './medications/NewPrescription'
import Invoices from './billing/Invoices'
import NewInvoice from './billing/NewInvoice'
import ViewInvoice from './billing/ViewInvoice'
import Charges from './billing/Charges'
import NewCharge from './billing/NewCharge'
import Imaging from './imaging/Imaging'
import NewImaging from './imaging/NewImaging'
import ViewImaging from './imaging/ViewImaging'
import Incidents from './incidents/Incidents'
import NewIncident from './incidents/NewIncident'
import ViewIncident from './incidents/ViewIncident'
import Reports from './reports/Reports'
import Analytics from './reports/Analytics'
import AdministrativeReports from './reports/AdministrativeReports'
import FinancialReports from './reports/FinancialReports'
import CustomReportBuilder from './reports/CustomReportBuilder'
import Notifications from './notifications/Notifications'
import Documents from './documents/Documents'
import UploadDocument from './documents/UploadDocument'
import ViewDocument from './documents/ViewDocument'
import InsuranceProviders from './insurance/InsuranceProviders'
import NewInsuranceProvider from './insurance/NewInsuranceProvider'
import Pharmacies from './pharmacy/Pharmacies'
import NewPharmacy from './pharmacy/NewPharmacy'
import ViewPharmacy from './pharmacy/ViewPharmacy'
import ViewPrescription from './medications/ViewPrescription'
import { useUIStore } from './store/ui-store'

const LaHIM = () => {
  const { title, sidebarCollapsed } = useUIStore()
  const permissions = useUserStore((state) => state.permissions)

  return (
    <div>
      <Navbar />
      <div className="container-fluid">
        <Sidebar />
        <ButtonBarProvider>
          <div className="row">
            <main
              role="main"
              className={`${
                sidebarCollapsed ? 'col-md-10 col-lg-11' : 'col-md-9 col-lg-10'
              } ml-sm-auto`}
              style={{ marginLeft: sidebarCollapsed ? '56px' : '260px' }}
            >
              <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 className="h2">{title}</h1>
                <ButtonToolBar />
              </div>
              <Breadcrumbs />
              <div>
                <Routes>
                  <Route path="/" element={<Dashboard />} />

                  <Route
                    path="/appointments"
                    element={
                      <PrivateRoute isAuthenticated={permissions.includes(Permissions.ReadAppointments)}>
                        <Appointments />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/appointments/new"
                    element={
                      <PrivateRoute isAuthenticated={permissions.includes(Permissions.WriteAppointments)}>
                        <NewAppointment />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/appointments/edit/:id"
                    element={
                      <PrivateRoute
                        isAuthenticated={
                          permissions.includes(Permissions.WriteAppointments) &&
                          permissions.includes(Permissions.ReadAppointments)
                        }
                      >
                        <EditAppointment />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/appointments/:id"
                    element={
                      <PrivateRoute isAuthenticated={permissions.includes(Permissions.ReadAppointments)}>
                        <ViewAppointment />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/patients/*"
                    element={
                      <PrivateRoute isAuthenticated>
                        <Patients />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/labs/*"
                    element={
                      <PrivateRoute isAuthenticated>
                        <Labs />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/lims/*"
                    element={
                      <PrivateRoute isAuthenticated>
                        <LIMS />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/visits"
                    element={
                      <PrivateRoute isAuthenticated>
                        <Visits />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/visits/new"
                    element={
                      <PrivateRoute isAuthenticated>
                        <NewVisit />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/visits/:id"
                    element={
                      <PrivateRoute isAuthenticated>
                        <ViewVisit />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <PrivateRoute isAuthenticated>
                        <Settings />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/medications"
                    element={
                      <PrivateRoute isAuthenticated>
                        <Medications />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/prescriptions"
                    element={
                      <PrivateRoute isAuthenticated>
                        <Prescriptions />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/prescriptions/new"
                    element={
                      <PrivateRoute isAuthenticated>
                        <NewPrescription />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/prescriptions/:id"
                    element={
                      <PrivateRoute isAuthenticated>
                        <ViewPrescription />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/billing/invoices"
                    element={
                      <PrivateRoute isAuthenticated>
                        <Invoices />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/billing/invoices/new"
                    element={
                      <PrivateRoute isAuthenticated>
                        <NewInvoice />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/billing/invoices/:id"
                    element={
                      <PrivateRoute isAuthenticated>
                        <ViewInvoice />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/billing/charges"
                    element={
                      <PrivateRoute isAuthenticated>
                        <Charges />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/billing/charges/new"
                    element={
                      <PrivateRoute isAuthenticated>
                        <NewCharge />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/imaging"
                    element={
                      <PrivateRoute isAuthenticated>
                        <Imaging />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/imaging/new"
                    element={
                      <PrivateRoute isAuthenticated>
                        <NewImaging />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/imaging/:id"
                    element={
                      <PrivateRoute isAuthenticated>
                        <ViewImaging />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/incidents"
                    element={
                      <PrivateRoute isAuthenticated>
                        <Incidents />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/incidents/new"
                    element={
                      <PrivateRoute isAuthenticated>
                        <NewIncident />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/incidents/:id"
                    element={
                      <PrivateRoute isAuthenticated>
                        <ViewIncident />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <PrivateRoute isAuthenticated>
                        <Reports />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/reports/analytics"
                    element={
                      <PrivateRoute isAuthenticated>
                        <Analytics />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/reports/administrative"
                    element={
                      <PrivateRoute isAuthenticated>
                        <AdministrativeReports />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/reports/financial"
                    element={
                      <PrivateRoute isAuthenticated>
                        <FinancialReports />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/reports/custom"
                    element={
                      <PrivateRoute isAuthenticated>
                        <CustomReportBuilder />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <PrivateRoute isAuthenticated>
                        <Notifications />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/documents"
                    element={
                      <PrivateRoute isAuthenticated>
                        <Documents />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/documents/upload"
                    element={
                      <PrivateRoute isAuthenticated>
                        <UploadDocument />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/documents/:id"
                    element={
                      <PrivateRoute isAuthenticated>
                        <ViewDocument />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/insurance/providers"
                    element={
                      <PrivateRoute isAuthenticated>
                        <InsuranceProviders />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/insurance/providers/new"
                    element={
                      <PrivateRoute isAuthenticated>
                        <NewInsuranceProvider />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/pharmacy"
                    element={
                      <PrivateRoute isAuthenticated>
                        <Pharmacies />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/pharmacy/new"
                    element={
                      <PrivateRoute isAuthenticated>
                        <NewPharmacy />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/pharmacy/:id"
                    element={
                      <PrivateRoute isAuthenticated>
                        <ViewPharmacy />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </div>
              <Toaster autoClose={5000} hideProgressBar draggable />
            </main>
          </div>
        </ButtonBarProvider>
      </div>
    </div>
  )
}

export default LaHIM
