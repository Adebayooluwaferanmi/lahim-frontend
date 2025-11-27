import React from 'react'
import { useSelector } from 'react-redux'
import { Routes, Route } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'
import Permissions from '../model/Permissions'
import ViewPatients from './list/ViewPatients'
import NewPatient from './new/NewPatient'
import EditPatient from './edit/EditPatient'
import ViewPatient from './view/ViewPatient'
import { RootState } from '../store'

const Patients = () => {
  const permissions = useSelector((state: RootState) => state.user.permissions)
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute isAuthenticated={permissions.includes(Permissions.ReadPatients)}>
            <ViewPatients />
          </PrivateRoute>
        }
      />
      <Route
        path="new"
        element={
          <PrivateRoute isAuthenticated={permissions.includes(Permissions.WritePatients)}>
            <NewPatient />
          </PrivateRoute>
        }
      />
      <Route
        path="edit/:id"
        element={
          <PrivateRoute
            isAuthenticated={
              permissions.includes(Permissions.WritePatients) &&
              permissions.includes(Permissions.ReadPatients)
            }
          >
            <EditPatient />
          </PrivateRoute>
        }
      />
      <Route
        path=":id"
        element={
          <PrivateRoute isAuthenticated={permissions.includes(Permissions.ReadPatients)}>
            <ViewPatient />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

export default Patients
