import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Toaster } from '@hospitalrun/components'
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
import { RootState } from './store'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import Patients from './patients/Patients'

const HospitalRun = () => {
  const { title } = useSelector((state: RootState) => state.title)
  const { permissions } = useSelector((state: RootState) => state.user)
  const { sidebarCollapsed } = useSelector((state: RootState) => state.components)

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
              } ml-sm-auto px-4`}
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

export default HospitalRun
