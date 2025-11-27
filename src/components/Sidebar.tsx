import React, { useState, CSSProperties } from 'react'
import { List, ListItem, Icon } from '@hospitalrun/components'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { updateSidebar } from './component-slice'

const Sidebar = () => {
  const dispatch = useDispatch()
  const { sidebarCollapsed } = useSelector((state: RootState) => state.components)

  const { t } = useTranslation()
  const path = useLocation()
  const navigate = useNavigate()
  const { pathname } = path
  const splittedPath = pathname.split('/')

  const navigateTo = (location: string) => {
    navigate(location)
  }

  const listItemStyle: CSSProperties = {
    cursor: 'pointer',
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
      : splittedPath[1].includes('labs')
      ? 'labs'
      : splittedPath[1].includes('lims')
      ? 'lims'
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
    color: 'black',
    padding: '.6rem 1.25rem',
    backgroundColor: 'rgba(245,245,245,1)',
  }

  const listSubItemStyle: CSSProperties = {
    cursor: 'pointer',
    fontSize: 'small',
    borderBottomWidth: 0,
    borderTopWidth: 0,
    color: 'black',
    padding: '.6rem 1.25rem',
    backgroundColor: 'rgba(245,245,245,1)',
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
        <Icon icon="dashboard" /> {!sidebarCollapsed && t('dashboard.label')}
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
        <Icon icon="patients" /> {!sidebarCollapsed && t('patients.label')}
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
            {!sidebarCollapsed && t('patients.newPatient')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/patients')}
            active={splittedPath[1].includes('patients') && splittedPath.length < 3}
          >
            <Icon icon="incident" style={iconMargin} />
            {!sidebarCollapsed && t('patients.patientsList')}
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
        <Icon icon="appointment" /> {!sidebarCollapsed && t('scheduling.label')}
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
            {!sidebarCollapsed && t('scheduling.appointments.new')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/appointments')}
            active={splittedPath[1].includes('appointments') && splittedPath.length < 3}
          >
            <Icon icon="incident" style={iconMargin} />
            {!sidebarCollapsed && t('scheduling.appointments.schedule')}
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
        <Icon icon="lab" /> {!sidebarCollapsed && t('labs.label')}
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
            {!sidebarCollapsed && t('labs.requests.new')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/labs')}
            active={splittedPath[1].includes('labs') && splittedPath.length < 3}
          >
            <Icon icon="incident" style={iconMargin} />
            {!sidebarCollapsed && t('labs.requests.label')}
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
        <Icon icon="lab" /> {!sidebarCollapsed && t('lims.label')}
      </ListItem>
      {splittedPath[1].includes('lims') && expandedItem === 'lims' && (
        <List layout="flush" className="nav flex-column">
          <ListItem
            className="nav-item"
            style={listSubItemStyleNew}
            onClick={() => navigateTo('/lims/test-catalog')}
            active={splittedPath[2] === 'test-catalog'}
          >
            <Icon icon="settings" style={iconMargin} />
            {!sidebarCollapsed && t('lims.testCatalog.label')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/lims/lab-orders')}
            active={splittedPath[2] === 'lab-orders'}
          >
            <Icon icon="add" style={iconMargin} />
            {!sidebarCollapsed && t('lims.labOrders.label')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/lims/specimens')}
            active={splittedPath[2] === 'specimens'}
          >
            <Icon icon="lab" style={iconMargin} />
            {!sidebarCollapsed && t('lims.specimens.label')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/lims/qc-results')}
            active={splittedPath[2] === 'qc-results'}
          >
            <Icon icon="check" style={iconMargin} />
            {!sidebarCollapsed && t('lims.qcResults.label')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/lims/instruments')}
            active={splittedPath[2] === 'instruments'}
          >
            <Icon icon="settings" style={iconMargin} />
            {!sidebarCollapsed && t('lims.instruments.label')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/lims/reports')}
            active={splittedPath[2] === 'reports'}
          >
            <Icon icon="document" style={iconMargin} />
            {!sidebarCollapsed && t('lims.reports.label')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/lims/worklists')}
            active={splittedPath[2] === 'worklists'}
          >
            <Icon icon="list" style={iconMargin} />
            {!sidebarCollapsed && t('lims.worklists.label')}
          </ListItem>
          <ListItem
            className="nav-item"
            style={listSubItemStyle}
            onClick={() => navigateTo('/lims/critical-values')}
            active={splittedPath[2] === 'critical-values'}
          >
            <Icon icon="warning" style={iconMargin} />
            {!sidebarCollapsed && t('lims.criticalValues.label')}
          </ListItem>
        </List>
      )}
    </>
  )

  return (
    <nav
      className="col-md-2 d-none d-md-block bg-light sidebar"
      style={{ width: sidebarCollapsed ? '56px' : '' }}
    >
      <div className="sidebar-sticky">
        <List layout="flush" className="nav flex-column">
          <ListItem
            onClick={() => dispatch(updateSidebar())}
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
          {getLabLinks()}
          {getLIMSLinks()}
        </List>
      </div>
    </nav>
  )
}

export default Sidebar
