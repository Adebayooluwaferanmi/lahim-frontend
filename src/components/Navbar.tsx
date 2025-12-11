import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar as HospitalRunNavbar } from '@hospitalrun/components'
import { useTranslation } from 'react-i18next'
import NotificationCenter from '../notifications/NotificationCenter'

const Navbar = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div style={{ position: 'relative' }}>
    <HospitalRunNavbar
      bg="dark"
      variant="dark"
      navItems={[
        {
          type: 'image',
          src: '/logo.png',
          alt: 'LaHIM Logo',
          onClick: () => {
            navigate('/')
          },
          className: 'nav-icon',
        },
        {
          type: 'header',
          label: 'LaHIM',
          onClick: () => {
            navigate('/')
          },
          className: 'nav-header',
        },
        {
          type: 'link-list',
          label: t('patients.label'),
          className: 'patients-link-list d-md-none d-block',
          children: [
            {
              type: 'link',
              label: t('actions.list'),
              onClick: () => {
                navigate('/patients')
              },
            },
            {
              type: 'link',
              label: t('actions.new'),
              onClick: () => {
                navigate('/patients/new')
              },
            },
          ],
        },
        {
          type: 'link-list',
          label: t('scheduling.label'),
          className: 'scheduling-link-list d-md-none d-block',
          children: [
            {
              type: 'link',
              label: t('scheduling.appointments.label'),
              onClick: () => {
                navigate('/appointments')
              },
            },
            {
              type: 'link',
              label: t('scheduling.appointments.new'),
              onClick: () => {
                navigate('/appointments/new')
              },
            },
          ],
        },
        {
          type: 'link-list',
          label: t('labs.label'),
          className: 'labs-link-list d-md-none d-block',
          children: [
            {
              type: 'link',
              label: t('labs.label'),
              onClick: () => {
                navigate('/labs')
              },
            },
            {
              type: 'link',
              label: t('labs.requests.new'),
              onClick: () => {
                navigate('/labs/new')
              },
            },
          ],
        },
        {
          type: 'search',
          placeholderText: t('actions.search'),
          className: 'ml-auto nav-search',
          buttonText: t('actions.search'),
          buttonColor: 'secondary',
          onClickButton: () => undefined,
          onChangeInput: () => undefined,
        },
      ]}
    />
    <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', zIndex: 1000 }}>
      <NotificationCenter userId="system" />
    </div>
    </div>
  )
}
export default Navbar
