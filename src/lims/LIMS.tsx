import React from 'react'
import { Switch } from 'react-router'
import PrivateRoute from '../components/PrivateRoute'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { useSelector } from 'react-redux'
import Permissions from '../model/Permissions'
import { RootState } from '../store'
import TestCatalog from './test-catalog/TestCatalog'
import LabOrders from './lab-orders/LabOrders'
import Specimens from './specimens/Specimens'
import QCResults from './qc-results/QCResults'
import Instruments from './instruments/Instruments'
import Reports from './reports/Reports'
import Worklists from './worklists/Worklists'
import CriticalValues from './critical-values/CriticalValues'

const LIMS = () => {
  const { permissions } = useSelector((state: RootState) => state.user)
  const breadcrumbs = [
    {
      i18nKey: 'lims.label',
      location: '/lims',
    },
  ]
  useAddBreadcrumbs(breadcrumbs, true)

  return (
    <Switch>
      <PrivateRoute isAuthenticated exact path="/lims/test-catalog" component={TestCatalog} />
      <PrivateRoute isAuthenticated exact path="/lims/lab-orders" component={LabOrders} />
      <PrivateRoute isAuthenticated exact path="/lims/specimens" component={Specimens} />
      <PrivateRoute isAuthenticated exact path="/lims/qc-results" component={QCResults} />
      <PrivateRoute isAuthenticated exact path="/lims/instruments" component={Instruments} />
      <PrivateRoute isAuthenticated exact path="/lims/reports" component={Reports} />
      <PrivateRoute isAuthenticated exact path="/lims/worklists" component={Worklists} />
      <PrivateRoute isAuthenticated exact path="/lims/critical-values" component={CriticalValues} />
    </Switch>
  )
}

export default LIMS

