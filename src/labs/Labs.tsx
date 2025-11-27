import React from 'react'
import PrivateRoute from 'components/PrivateRoute'
import { Routes, Route } from 'react-router-dom'
import useAddBreadcrumbs from 'breadcrumbs/useAddBreadcrumbs'
import { useSelector } from 'react-redux'
import Permissions from 'model/Permissions'
import LabRequests from './ViewLabs'
import NewLabRequest from './requests/NewLabRequest'
import ViewLab from './ViewLab'
import { RootState } from '../store'

const Labs = () => {
  const { permissions } = useSelector((state: RootState) => state.user)
  const breadcrumbs = [
    {
      i18nKey: 'labs.label',
      location: `/labs`,
    },
  ]
  useAddBreadcrumbs(breadcrumbs, true)

  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute isAuthenticated={permissions.includes(Permissions.ViewLabs)}>
            <LabRequests />
          </PrivateRoute>
        }
      />
      <Route
        path="new"
        element={
          <PrivateRoute isAuthenticated={permissions.includes(Permissions.RequestLab)}>
            <NewLabRequest />
          </PrivateRoute>
        }
      />
      <Route
        path=":id"
        element={
          <PrivateRoute isAuthenticated={permissions.includes(Permissions.ViewLab)}>
            <ViewLab />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

export default Labs
