import React from 'react'
import { Routes, Route } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'

// Lab Orders
import LabOrders from './lab-orders/LabOrders'
import NewLabOrder from './lab-orders/NewLabOrder'
import ViewLabOrder from './lab-orders/ViewLabOrder'

// Specimens
import Specimens from './specimens/Specimens'
import ViewSpecimen from './specimens/ViewSpecimen'
import SpecimenReception from './specimens/SpecimenReception'
import SpecimenProcessing from './specimens/SpecimenProcessing'

// Worklists
import Worklists from './worklists/Worklists'
import GenerateWorklist from './worklists/GenerateWorklist'
import ViewWorklist from './worklists/ViewWorklist'

// Instruments
import Instruments from './instruments/Instruments'
import ViewInstrument from './instruments/ViewInstrument'

// QC Results
import QCResults from './qc-results/QCResults'
import NewQCResult from './qc-results/NewQCResult'
import ViewQCResult from './qc-results/ViewQCResult'

// Reports
import Reports from './reports/Reports'
import GenerateReport from './reports/GenerateReport'
import ViewReport from './reports/ViewReport'

// Inventory
import InventoryItems from './inventory/InventoryItems'
import NewInventoryItem from './inventory/NewInventoryItem'
import ViewInventoryItem from './inventory/ViewInventoryItem'
import StockLevels from './inventory/StockLevels'
import ReceiveInventory from './inventory/ReceiveInventory'
import IssueInventory from './inventory/IssueInventory'

// Results
import TemplateBasedResultEntry from './results/TemplateBasedResultEntry'
import ResultInterpretation from './results/ResultInterpretation'

// Test Catalog
import TestCatalog from './test-catalog/TestCatalog'

// Critical Values
import CriticalValues from './critical-values/CriticalValues'

// Vocabularies
import Vocabularies from './vocabularies/Vocabularies'

// Workflow
import WorkflowDashboard from './workflow/WorkflowDashboard'
import WorkflowTimeline from './workflow/WorkflowTimeline'

// Logistics
import SpecimenTransport from './logistics/SpecimenTransport'
import ViewSpecimenTransport from './logistics/ViewSpecimenTransport'
import NewSpecimenTransport from './logistics/NewSpecimenTransport'
import Equipment from './logistics/Equipment'
import ViewEquipment from './logistics/ViewEquipment'
import NewEquipment from './logistics/NewEquipment'

const LIMS = () => {
  return (
    <Routes>
      {/* Lab Orders Routes */}
      <Route path="lab-orders" element={<PrivateRoute isAuthenticated={true}><LabOrders /></PrivateRoute>} />
      <Route path="lab-orders/new" element={<PrivateRoute isAuthenticated={true}><NewLabOrder /></PrivateRoute>} />
      <Route path="lab-orders/:id" element={<PrivateRoute isAuthenticated={true}><ViewLabOrder /></PrivateRoute>} />

      {/* Specimens Routes */}
      <Route path="specimens" element={<PrivateRoute isAuthenticated={true}><Specimens /></PrivateRoute>} />
      <Route path="specimens/:id" element={<PrivateRoute isAuthenticated={true}><ViewSpecimen /></PrivateRoute>} />
      <Route path="specimens/:id/reception" element={<PrivateRoute isAuthenticated={true}><SpecimenReception /></PrivateRoute>} />
      <Route path="specimens/:id/processing" element={<PrivateRoute isAuthenticated={true}><SpecimenProcessing /></PrivateRoute>} />

      {/* Worklists Routes */}
      <Route path="worklists" element={<PrivateRoute isAuthenticated={true}><Worklists /></PrivateRoute>} />
      <Route path="worklists/generate" element={<PrivateRoute isAuthenticated={true}><GenerateWorklist /></PrivateRoute>} />
      <Route path="worklists/:id" element={<PrivateRoute isAuthenticated={true}><ViewWorklist /></PrivateRoute>} />

      {/* Instruments Routes */}
      <Route path="instruments" element={<PrivateRoute isAuthenticated={true}><Instruments /></PrivateRoute>} />
      <Route path="instruments/:id" element={<PrivateRoute isAuthenticated={true}><ViewInstrument /></PrivateRoute>} />

      {/* QC Results Routes */}
      <Route path="qc-results" element={<PrivateRoute isAuthenticated={true}><QCResults /></PrivateRoute>} />
      <Route path="qc-results/new" element={<PrivateRoute isAuthenticated={true}><NewQCResult /></PrivateRoute>} />
      <Route path="qc-results/:id" element={<PrivateRoute isAuthenticated={true}><ViewQCResult /></PrivateRoute>} />

      {/* Reports Routes */}
      <Route path="reports" element={<PrivateRoute isAuthenticated={true}><Reports /></PrivateRoute>} />
      <Route path="reports/generate" element={<PrivateRoute isAuthenticated={true}><GenerateReport /></PrivateRoute>} />
      <Route path="reports/:id" element={<PrivateRoute isAuthenticated={true}><ViewReport /></PrivateRoute>} />

      {/* Inventory Routes */}
      <Route path="inventory/items" element={<PrivateRoute isAuthenticated={true}><InventoryItems /></PrivateRoute>} />
      <Route path="inventory/items/new" element={<PrivateRoute isAuthenticated={true}><NewInventoryItem /></PrivateRoute>} />
      <Route path="inventory/items/:id" element={<PrivateRoute isAuthenticated={true}><ViewInventoryItem /></PrivateRoute>} />
      <Route path="inventory/stock-levels" element={<PrivateRoute isAuthenticated={true}><StockLevels /></PrivateRoute>} />
      <Route path="inventory/receive" element={<PrivateRoute isAuthenticated={true}><ReceiveInventory /></PrivateRoute>} />
      <Route path="inventory/issue" element={<PrivateRoute isAuthenticated={true}><IssueInventory /></PrivateRoute>} />

      {/* Results Routes */}
      <Route path="results/enter" element={<PrivateRoute isAuthenticated={true}><TemplateBasedResultEntry /></PrivateRoute>} />
      <Route path="results/:id/interpretation" element={<PrivateRoute isAuthenticated={true}><ResultInterpretation /></PrivateRoute>} />

      {/* Test Catalog Routes */}
      <Route path="test-catalog" element={<PrivateRoute isAuthenticated={true}><TestCatalog /></PrivateRoute>} />

      {/* Critical Values Routes */}
      <Route path="critical-values" element={<PrivateRoute isAuthenticated={true}><CriticalValues /></PrivateRoute>} />

      {/* Vocabularies Routes */}
      <Route path="vocabularies" element={<PrivateRoute isAuthenticated={true}><Vocabularies /></PrivateRoute>} />

      {/* Workflow Routes */}
      <Route path="workflow" element={<PrivateRoute isAuthenticated={true}><WorkflowDashboard /></PrivateRoute>} />
      <Route path="workflow/:orderId" element={<PrivateRoute isAuthenticated={true}><WorkflowTimeline /></PrivateRoute>} />

      {/* Logistics Routes */}
      <Route path="logistics/transport" element={<PrivateRoute isAuthenticated={true}><SpecimenTransport /></PrivateRoute>} />
      <Route path="logistics/transport/new" element={<PrivateRoute isAuthenticated={true}><NewSpecimenTransport /></PrivateRoute>} />
      <Route path="logistics/transport/:id" element={<PrivateRoute isAuthenticated={true}><ViewSpecimenTransport /></PrivateRoute>} />
      <Route path="logistics/equipment" element={<PrivateRoute isAuthenticated={true}><Equipment /></PrivateRoute>} />
      <Route path="logistics/equipment/new" element={<PrivateRoute isAuthenticated={true}><NewEquipment /></PrivateRoute>} />
      <Route path="logistics/equipment/:id" element={<PrivateRoute isAuthenticated={true}><ViewEquipment /></PrivateRoute>} />

      {/* Default route - redirect to lab-orders */}
      <Route path="" element={<PrivateRoute isAuthenticated={true}><LabOrders /></PrivateRoute>} />
      <Route path="*" element={<PrivateRoute isAuthenticated={true}><LabOrders /></PrivateRoute>} />
    </Routes>
  )
}

export default LIMS

