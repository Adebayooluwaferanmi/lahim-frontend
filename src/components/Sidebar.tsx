import React, { useState, CSSProperties } from 'react'
import { List, ListItem, Icon } from '@lahim/components'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUIStore } from '../store/ui-store'

const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  const { t } = useTranslation()
  const path = useLocation()
  const navigate = useNavigate()
  const { pathname } = path
  const splittedPath = pathname.split('/')

  const navText = (key: string, fallback: string) => navText(key, fallback)

  const navigateTo = (location: string) => {
    navigate(location)
  }

  const listItemStyle: CSSProperties = {
    cursor: 'pointer',
    color: 'rgba(255, 255, 255, 0.85)',
  }

  const expandibleArrow: CSSProperties = {
    marginRight: '20px',
  }

  const iconMargin: CSSProperties = {
    marginRight: '10px',
  }

  const [expandedItem, setExpandedItem] = useState(
    splittedPath[1].includes('patients')
      ? 'patient'
      : splittedPath[1].includes('appointments')
      ? 'appointment'
      : splittedPath[1].includes('visits')
      ? 'visits'
      : splittedPath[1].includes('medications') || splittedPath[1].includes('prescriptions')
      ? 'medications'
      : splittedPath[1].includes('imaging')
      ? 'imaging'
      : splittedPath[1].includes('incidents')
      ? 'incidents'
      : splittedPath[1].includes('reports')
      ? 'reports'
      : splittedPath[1].includes('documents')
      ? 'documents'
      : splittedPath[1].includes('billing')
      ? 'billing'
      : splittedPath[1].includes('labs')
      ? 'labs'
      : splittedPath[1].includes('lims')
      ? 'lims'
      : splittedPath[1].includes('pharmacy')
      ? 'pharmacy'
      : splittedPath[1].includes('insurance')
      ? 'insurance'
      : 'none',
  )

  const setExpansion = (item: string) => {
    if (expandedItem === item) {
      setExpandedItem('none')
      return
    }

    setExpandedItem(item.toString())
  }

  const listSubItemStyleNew: CSSProperties = {
    cursor: 'pointer',
    fontSize: 'small',
    borderBottomWidth: 0,
    borderTopWidth: 0,
    color: '#E8D5B7',
    padding: '.6rem 1.25rem',
    backgroundColor: 'rgba(232, 213, 183, 0.1)',
    transition: 'all 0.15s ease-in-out',
  }

  const listSubItemStyle: CSSProperties = {
    cursor: 'pointer',
    fontSize: 'small',
    borderBottomWidth: 0,
    borderTopWidth: 0,
    color: '#E8D5B7',
    padding: '.6rem 1.25rem',
    backgroundColor: 'rgba(232, 213, 183, 0.1)',
    transition: 'all 0.15s ease-in-out',
  }

  const getDashboardLink = () => (
    <>
      <ListItem
        active={pathname === '/'}
        onClick={() => {
          navigateTo('/')
          setExpansion('none')
        }}
        className="nav-item"
        style={listItemStyle}
      >
        <Icon icon="dashboard" /> {!sidebarCollapsed && navText('dashboard.label', 'Dashboard')}
      </ListItem>
    </>
  )

  const getPatientLinks = () => (
    <>
      <ListItem
        active={splittedPath[1].includes('patient')}
        onClick={() => {
          navigateTo('/patients')
          if (expandedItem === 'patient') {
            setExpandedItem('none')
            return
          }

          setExpandedItem('patient')
        }}
        className="nav-item"
        style={listItemStyle}
      >
        <Icon
          icon={
            splittedPath[1].includes('patient') && expandedItem === 'patient'
              ? 'down-arrow'
              : 'right-arrow'
          }
          style={expandibleArrow}
        />
        <Icon icon="patients" /> {!sidebarCollapsed && navText('patients.label', 'Patients')}
      </ListItem>
      {splittedPath[1].includes('patient') && expandedItem === 'patient' && (
        <List layout="flush">
          <ListItem
            className="nav-item"
            style={listSubItemStyleNew}
            onClick={() => navigateTo('/patients/new')}
            active={splittedPath[1].includes('patients') && splittedPath.length > 2}
          >
            <Icon icon="patient-add" style={iconMargin} />
            {!sidebarCollapsed && navText('patients.newPatient', 'New Patient')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/patients')}
            active={splittedPath[1].includes('patients') && splittedPath.length < 3}
          >
            <Icon icon="incident" style={iconMargin} />
            {!sidebarCollapsed && navText('patients.patientsList', 'Patients List')}
          </ListItem>
        </List>
      )}
    </>
  )

  const getAppointmentLinks = () => (
    <>
      <ListItem
        active={splittedPath[1].includes('appointments')}
        onClick={() => {
          navigateTo('/appointments')
          setExpansion('appointment')
        }}
        className="nav-item"
        style={listItemStyle}
      >
        <Icon
          icon={
            splittedPath[1].includes('appointments') && expandedItem === 'appointment'
              ? 'down-arrow'
              : 'right-arrow'
          }
          style={expandibleArrow}
        />
        <Icon icon="appointment" /> {!sidebarCollapsed && navText('scheduling.label', 'Scheduling')}
      </ListItem>
      {splittedPath[1].includes('appointment') && expandedItem === 'appointment' && (
        <List layout="flush" className="nav flex-column">
          <ListItem
            className="nav-item"
            style={listSubItemStyleNew}
            onClick={() => navigateTo('/appointments/new')}
            active={splittedPath[1].includes('appointments') && splittedPath.length > 2}
          >
            <Icon icon="appointment-add" style={iconMargin} />
            {!sidebarCollapsed && navText('scheduling.appointments.new', 'New Appointment')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/appointments')}
            active={splittedPath[1].includes('appointments') && splittedPath.length < 3}
          >
            <Icon icon="incident" style={iconMargin} />
            {!sidebarCollapsed && navText('scheduling.appointments.schedule', 'Appointment Schedule')}
          </ListItem>
        </List>
      )}
    </>
  )

  const getLabLinks = () => (
    <>
      <ListItem
        active={splittedPath[1].includes('labs')}
        onClick={() => {
          navigateTo('/labs')
          setExpansion('labs')
        }}
        className="nav-item"
        style={listItemStyle}
      >
        <Icon
          icon={
            splittedPath[1].includes('labs') && expandedItem === 'labs'
              ? 'down-arrow'
              : 'right-arrow'
          }
          style={expandibleArrow}
        />
        <Icon icon="lab" /> {!sidebarCollapsed && navText('labs.label', 'Labs')}
      </ListItem>
      {splittedPath[1].includes('labs') && expandedItem === 'labs' && (
        <List layout="flush" className="nav flex-column">
          <ListItem
            className="nav-item"
            style={listSubItemStyleNew}
            onClick={() => navigateTo('/labs/new')}
            active={splittedPath[1].includes('labs') && splittedPath.length > 2}
          >
            <Icon icon="add" style={iconMargin} />
            {!sidebarCollapsed && navText('labs.requests.new', 'New Lab Request')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/labs')}
            active={splittedPath[1].includes('labs') && splittedPath.length < 3}
          >
            <Icon icon="incident" style={iconMargin} />
            {!sidebarCollapsed && navText('labs.requests.label', 'Lab Requests')}
          </ListItem>
        </List>
      )}
    </>
  )

  const getVisitLinks = () => (
    <>
      <ListItem
        active={splittedPath[1].includes('visits')}
        onClick={() => {
          navigateTo('/visits')
          setExpansion('visits')
        }}
        className="nav-item"
        style={listItemStyle}
      >
        <Icon
          icon={
            splittedPath[1].includes('visits') && expandedItem === 'visits'
              ? 'down-arrow'
              : 'right-arrow'
          }
          style={expandibleArrow}
        />
        <Icon icon="appointment" /> {!sidebarCollapsed && navText('visits.label', 'Visits')}
      </ListItem>
      {splittedPath[1].includes('visits') && expandedItem === 'visits' && (
        <List layout="flush" className="nav flex-column">
          <ListItem
            className="nav-item"
            style={listSubItemStyleNew}
            onClick={() => navigateTo('/visits/new')}
            active={splittedPath[1].includes('visits') && splittedPath.length > 2 && splittedPath[2] === 'new'}
          >
            <Icon icon="appointment-add" style={iconMargin} />
            {!sidebarCollapsed && navText('visits.new', 'New Visit')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/visits')}
            active={splittedPath[1].includes('visits') && splittedPath.length < 3}
          >
            <Icon icon="appointment" style={iconMargin} />
            {!sidebarCollapsed && navText('visits.list', 'Visit List')}
          </ListItem>
        </List>
      )}
    </>
  )

  const getIncidentLinks = () => (
    <>
      <ListItem
        active={splittedPath[1].includes('incidents')}
        onClick={() => {
          navigateTo('/incidents')
          setExpansion('incidents')
        }}
        className="nav-item"
        style={listItemStyle}
      >
        <Icon
          icon={
            splittedPath[1].includes('incidents') && expandedItem === 'incidents'
              ? 'down-arrow'
              : 'right-arrow'
          }
          style={expandibleArrow}
        />
        <Icon icon="incident" /> {!sidebarCollapsed && navText('incidents.label', 'Incidents')}
      </ListItem>
      {splittedPath[1].includes('incidents') && expandedItem === 'incidents' && (
        <List layout="flush" className="nav flex-column">
          <ListItem
            className="nav-item"
            style={listSubItemStyleNew}
            onClick={() => navigateTo('/incidents/new')}
            active={splittedPath[1].includes('incidents') && splittedPath.length > 2 && splittedPath[2] === 'new'}
          >
            <Icon icon="add" style={iconMargin} />
            {!sidebarCollapsed && navText('incidents.new', 'New Incident')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/incidents')}
            active={splittedPath[1].includes('incidents') && splittedPath.length < 3}
          >
            <Icon icon="incident" style={iconMargin} />
            {!sidebarCollapsed && navText('incidents.list', 'Incidents List')}
          </ListItem>
        </List>
      )}
    </>
  )

  const getImagingLinks = () => (
    <>
      <ListItem
        active={splittedPath[1].includes('imaging')}
        onClick={() => {
          navigateTo('/imaging')
          setExpansion('imaging')
        }}
        className="nav-item"
        style={listItemStyle}
      >
        <Icon
          icon={
            splittedPath[1].includes('imaging') && expandedItem === 'imaging'
              ? 'down-arrow'
              : 'right-arrow'
          }
          style={expandibleArrow}
        />
        <Icon icon="image" /> {!sidebarCollapsed && navText('imaging.label', 'Imaging')}
      </ListItem>
      {splittedPath[1].includes('imaging') && expandedItem === 'imaging' && (
        <List layout="flush" className="nav flex-column">
          <ListItem
            className="nav-item"
            style={listSubItemStyleNew}
            onClick={() => navigateTo('/imaging/new')}
            active={splittedPath[1].includes('imaging') && splittedPath.length > 2 && splittedPath[2] === 'new'}
          >
            <Icon icon="add" style={iconMargin} />
            {!sidebarCollapsed && navText('imaging.new', 'New Imaging Order')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/imaging')}
            active={splittedPath[1].includes('imaging') && splittedPath.length < 3}
          >
            <Icon icon="image" style={iconMargin} />
            {!sidebarCollapsed && navText('imaging.list', 'Imaging Orders')}
          </ListItem>
        </List>
      )}
    </>
  )

  const getReportLinks = () => (
    <>
      <ListItem
        active={splittedPath[1].includes('reports')}
        onClick={() => {
          navigateTo('/reports')
          setExpansion('reports')
        }}
        className="nav-item"
        style={listItemStyle}
      >
        <Icon
          icon={
            splittedPath[1].includes('reports') && expandedItem === 'reports'
              ? 'down-arrow'
              : 'right-arrow'
          }
          style={expandibleArrow}
        />
        <Icon icon="chart-bar" /> {!sidebarCollapsed && navText('reports.label', 'Reports')}
      </ListItem>
      {splittedPath[1].includes('reports') && expandedItem === 'reports' && (
        <List layout="flush" className="nav flex-column">
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/reports')}
            active={splittedPath[1].includes('reports') && splittedPath.length === 2}
          >
            <Icon icon="chart-bar" style={iconMargin} />
            {!sidebarCollapsed && navText('reports.list', 'Reports List')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/reports/analytics')}
            active={splittedPath[1].includes('reports') && splittedPath[2] === 'analytics'}
          >
            <Icon icon="chart-bar" style={iconMargin} />
            {!sidebarCollapsed && navText('reports.analytics', 'Analytics')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/reports/administrative')}
            active={splittedPath[1].includes('reports') && splittedPath[2] === 'administrative'}
          >
            <Icon icon="chart-bar" style={iconMargin} />
            {!sidebarCollapsed && navText('reports.administrative', 'Administrative Reports')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/reports/financial')}
            active={splittedPath[1].includes('reports') && splittedPath[2] === 'financial'}
          >
            <Icon icon="chart-bar" style={iconMargin} />
            {!sidebarCollapsed && navText('reports.financial', 'Financial Reports')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/reports/custom')}
            active={splittedPath[1].includes('reports') && splittedPath[2] === 'custom'}
          >
            <Icon icon="chart-bar" style={iconMargin} />
            {!sidebarCollapsed && navText('reports.customBuilder', 'Custom Report Builder')}
          </ListItem>
        </List>
      )}
    </>
  )

  const getDocumentLinks = () => (
    <>
      <ListItem
        active={splittedPath[1].includes('documents')}
        onClick={() => {
          navigateTo('/documents')
          setExpansion('documents')
        }}
        className="nav-item"
        style={listItemStyle}
      >
        <Icon
          icon={
            splittedPath[1].includes('documents') && expandedItem === 'documents'
              ? 'down-arrow'
              : 'right-arrow'
          }
          style={expandibleArrow}
        />
        <Icon icon="file" /> {!sidebarCollapsed && navText('documents.label', 'Documents')}
      </ListItem>
      {splittedPath[1].includes('documents') && expandedItem === 'documents' && (
        <List layout="flush" className="nav flex-column">
          <ListItem
            className="nav-item"
            style={listSubItemStyleNew}
            onClick={() => navigateTo('/documents/upload')}
            active={splittedPath[1].includes('documents') && splittedPath.length > 2 && splittedPath[2] === 'upload'}
          >
            <Icon icon="add" style={iconMargin} />
            {!sidebarCollapsed && navText('documents.upload', 'Upload Document')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/documents')}
            active={splittedPath[1].includes('documents') && splittedPath.length < 3}
          >
            <Icon icon="file" style={iconMargin} />
            {!sidebarCollapsed && navText('documents.list', 'Documents List')}
          </ListItem>
        </List>
      )}
    </>
  )

  const getPharmacyLinks = () => (
    <>
      <ListItem
        active={splittedPath[1].includes('pharmacy')}
        onClick={() => {
          navigateTo('/pharmacy')
          setExpansion('pharmacy')
        }}
        className="nav-item"
        style={listItemStyle}
      >
        <Icon
          icon={
            splittedPath[1].includes('pharmacy') && expandedItem === 'pharmacy'
              ? 'down-arrow'
              : 'right-arrow'
          }
          style={expandibleArrow}
        />
        <Icon icon="medication" /> {!sidebarCollapsed && navText('pharmacy.label', 'Pharmacy')}
      </ListItem>
      {splittedPath[1].includes('pharmacy') && expandedItem === 'pharmacy' && (
        <List layout="flush" className="nav flex-column">
          <ListItem
            className="nav-item"
            style={listSubItemStyleNew}
            onClick={() => navigateTo('/pharmacy/new')}
            active={splittedPath[1].includes('pharmacy') && splittedPath.length > 2 && splittedPath[2] === 'new'}
          >
            <Icon icon="add" style={iconMargin} />
            {!sidebarCollapsed && navText('pharmacy.new', 'New Pharmacy')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/pharmacy')}
            active={splittedPath[1].includes('pharmacy') && splittedPath.length < 3}
          >
            <Icon icon="medication" style={iconMargin} />
            {!sidebarCollapsed && navText('pharmacy.list', 'Pharmacies')}
          </ListItem>
        </List>
      )}
    </>
  )

  const getInsuranceLinks = () => (
    <>
      <ListItem
        active={splittedPath[1].includes('insurance')}
        onClick={() => {
          navigateTo('/insurance/providers')
          setExpansion('insurance')
        }}
        className="nav-item"
        style={listItemStyle}
      >
        <Icon
          icon={
            splittedPath[1].includes('insurance') && expandedItem === 'insurance'
              ? 'down-arrow'
              : 'right-arrow'
          }
          style={expandibleArrow}
        />
        <Icon icon="file" /> {!sidebarCollapsed && navText('insurance.label', 'Insurance')}
      </ListItem>
      {splittedPath[1].includes('insurance') && expandedItem === 'insurance' && (
        <List layout="flush" className="nav flex-column">
          <ListItem
            className="nav-item"
            style={listSubItemStyleNew}
            onClick={() => navigateTo('/insurance/providers/new')}
            active={splittedPath[1].includes('insurance') && splittedPath.length > 3 && splittedPath[3] === 'new'}
          >
            <Icon icon="add" style={iconMargin} />
            {!sidebarCollapsed && navText('insurance.providers.new', 'New Provider')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/insurance/providers')}
            active={splittedPath[1].includes('insurance') && splittedPath.length < 4}
          >
            <Icon icon="file" style={iconMargin} />
            {!sidebarCollapsed && navText('insurance.providers.label', 'Providers')}
          </ListItem>
        </List>
      )}
    </>
  )

  const getLIMSLinks = () => (
    <>
      <ListItem
        active={splittedPath[1].includes('lims')}
        onClick={() => {
          navigateTo('/lims/test-catalog')
          setExpansion('lims')
        }}
        className="nav-item"
        style={listItemStyle}
      >
        <Icon
          icon={
            splittedPath[1].includes('lims') && expandedItem === 'lims'
              ? 'down-arrow'
              : 'right-arrow'
          }
          style={expandibleArrow}
        />
        <Icon icon="lab" /> {!sidebarCollapsed && navText('lims.label', 'LIMS')}
      </ListItem>
      {splittedPath[1].includes('lims') && expandedItem === 'lims' && (
        <List layout="flush" className="nav flex-column">
          <ListItem
            className="nav-item"
            style={listSubItemStyleNew}
            onClick={() => navigateTo('/lims/test-catalog')}
            active={splittedPath[2] === 'test-catalog'}
          >
            <Icon icon="setting" style={iconMargin} />
            {!sidebarCollapsed && navText('lims.testCatalog.label', 'Test Catalog')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/lims/lab-orders')}
            active={splittedPath[2] === 'lab-orders'}
          >
            <Icon icon="add" style={iconMargin} />
            {!sidebarCollapsed && navText('lims.labOrders.label', 'Lab Orders')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/lims/specimens')}
            active={splittedPath[2] === 'specimens'}
          >
            <Icon icon="lab" style={iconMargin} />
            {!sidebarCollapsed && navText('lims.specimens.label', 'Specimens')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/lims/qc-results')}
            active={splittedPath[2] === 'qc-results'}
          >
            <Icon icon="add" style={iconMargin} />
            {!sidebarCollapsed && navText('lims.qcResults.label', 'QC Results')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/lims/instruments')}
            active={splittedPath[2] === 'instruments'}
          >
            <Icon icon="setting" style={iconMargin} />
            {!sidebarCollapsed && navText('lims.instruments.label', 'Instruments')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/lims/reports')}
            active={splittedPath[2] === 'reports'}
          >
            <Icon icon="incident" style={iconMargin} />
            {!sidebarCollapsed && navText('lims.reports.label', 'Reports')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/lims/worklists')}
            active={splittedPath[2] === 'worklists'}
          >
            <Icon icon="add" style={iconMargin} />
            {!sidebarCollapsed && navText('lims.worklists.label', 'Worklists')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/lims/critical-values')}
            active={splittedPath[2] === 'critical-values'}
          >
            <Icon icon="incident" style={iconMargin} />
            {!sidebarCollapsed && navText('lims.criticalValues.label', 'Critical Values')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/lims/inventory/items')}
            active={splittedPath[2] === 'inventory' && splittedPath[3] === 'items'}
          >
            <Icon icon="add" style={iconMargin} />
            {!sidebarCollapsed && navText('lims.inventory.items', 'Inventory Items')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/lims/inventory/stock-levels')}
            active={splittedPath[2] === 'inventory' && splittedPath[3] === 'stock-levels'}
          >
            <Icon icon="setting" style={iconMargin} />
            {!sidebarCollapsed && navText('lims.inventory.stockLevels', 'Stock Levels')}
          </ListItem>
        </List>
      )}
    </>
  )

  return (
    <nav
      className="col-md-2 d-none d-md-block sidebar"
      style={{ width: sidebarCollapsed ? '56px' : '260px' }}
    >
      <div className="sidebar-sticky">
        <List layout="flush" className="nav flex-column">
          <ListItem
            onClick={toggleSidebar}
            className="nav-item"
            style={listItemStyle}
          >
            <Icon
              style={{ float: sidebarCollapsed ? 'left' : 'right' }}
              icon={sidebarCollapsed ? 'right-arrow' : 'left-arrow'}
            />
          </ListItem>
          {getDashboardLink()}
          {getPatientLinks()}
          {getAppointmentLinks()}
          {getVisitLinks()}
          {getLabLinks()}
          {getLIMSLinks()}
          {getImagingLinks()}
          {getIncidentLinks()}
          {getReportLinks()}
          {getDocumentLinks()}
          {getPharmacyLinks()}
          {getInsuranceLinks()}
          <ListItem
            active={splittedPath[1].includes('medications') || splittedPath[1].includes('prescriptions')}
            onClick={() => {
              navigateTo('/prescriptions')
              setExpansion('medications')
            }}
            className="nav-item"
            style={listItemStyle}
          >
            <Icon
              icon={
                (splittedPath[1].includes('medications') || splittedPath[1].includes('prescriptions')) && expandedItem === 'medications'
                  ? 'down-arrow'
                  : 'right-arrow'
              }
              style={expandibleArrow}
            />
            <Icon icon="medication" /> {!sidebarCollapsed && navText('medications.label', 'Medications')}
          </ListItem>
          {(splittedPath[1].includes('medications') || splittedPath[1].includes('prescriptions')) && expandedItem === 'medications' && (
            <List layout="flush" className="nav flex-column">
              <ListItem
                className="nav-item"
                style={listSubItemStyleNew}
                onClick={() => navigateTo('/prescriptions/new')}
                active={splittedPath[1].includes('prescriptions') && splittedPath.length > 2 && splittedPath[2] === 'new'}
              >
                <Icon icon="add" style={iconMargin} />
                {!sidebarCollapsed && navText('prescriptions.new', 'New Prescription')}
              </ListItem>
              <ListItem
                className="nav-item"
                style={listSubItemStyle}
                onClick={() => navigateTo('/prescriptions')}
                active={splittedPath[1].includes('prescriptions') && splittedPath.length < 3}
              >
                <Icon icon="medication" style={iconMargin} />
                {!sidebarCollapsed && navText('prescriptions.label', 'Prescriptions')}
              </ListItem>
              <ListItem
                className="nav-item"
                style={listSubItemStyle}
                onClick={() => navigateTo('/medications')}
                active={splittedPath[1].includes('medications')}
              >
                <Icon icon="setting" style={iconMargin} />
                {!sidebarCollapsed && navText('medications.catalog', 'Medication Catalog')}
              </ListItem>
            </List>
          )}
          <ListItem
            active={splittedPath[1].includes('billing')}
            onClick={() => {
              navigateTo('/billing/invoices')
              setExpansion('billing')
            }}
            className="nav-item"
            style={listItemStyle}
          >
            <Icon
              icon={
                splittedPath[1].includes('billing') && expandedItem === 'billing'
                  ? 'down-arrow'
                  : 'right-arrow'
              }
              style={expandibleArrow}
            />
            <Icon icon="dollar-sign" /> {!sidebarCollapsed && navText('billing.label', 'Billing')}
          </ListItem>
          {splittedPath[1].includes('billing') && expandedItem === 'billing' && (
            <List layout="flush" className="nav flex-column">
              <ListItem
                className="nav-item"
                style={listSubItemStyleNew}
                onClick={() => navigateTo('/billing/invoices/new')}
                active={splittedPath[1].includes('billing') && splittedPath[2] === 'invoices' && splittedPath.length > 3 && splittedPath[3] === 'new'}
              >
                <Icon icon="add" style={iconMargin} />
                {!sidebarCollapsed && navText('billing.invoices.new', 'New Invoice')}
              </ListItem>
              <ListItem
                className="nav-item"
                style={listSubItemStyle}
                onClick={() => navigateTo('/billing/invoices')}
                active={splittedPath[1].includes('billing') && splittedPath[2] === 'invoices' && splittedPath.length < 4}
              >
                <Icon icon="dollar-sign" style={iconMargin} />
                {!sidebarCollapsed && navText('billing.invoices.label', 'Invoices')}
              </ListItem>
              <ListItem
                className="nav-item"
                style={listSubItemStyle}
                onClick={() => navigateTo('/billing/charges')}
                active={splittedPath[1].includes('billing') && splittedPath[2] === 'charges'}
              >
                <Icon icon="add" style={iconMargin} />
                {!sidebarCollapsed && navText('billing.charges.label', 'Charges')}
              </ListItem>
            </List>
          )}
          <ListItem
            active={pathname.includes('settings')}
            onClick={() => navigateTo('/settings')}
            className="nav-item"
            style={listItemStyle}
          >
            <Icon icon="setting" /> {!sidebarCollapsed && navText('settings.label', 'Settings')}
          </ListItem>
        </List>
      </div>
    </nav>
  )
}

export default Sidebar
