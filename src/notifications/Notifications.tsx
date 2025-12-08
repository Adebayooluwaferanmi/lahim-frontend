import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Container, Row, Column, Spinner, Alert, Table, Button, Badge } from '@hospitalrun/components'
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '../hooks/useNotifications'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { Notification, NotificationType } from '../model/Notification'

const breadcrumbs = [{ i18nKey: 'notifications.label', location: '/notifications' }]

const Notifications = () => {
  const { t } = useTranslation()
  useTitle(t('notifications.label', 'Notifications'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const userId = 'system' // TODO: Get from auth context

  const { data: notifications = [], isLoading, error, refetch } = useNotifications({
    userId,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  })

  const { mutate: markAllRead, isPending: isMarkingAllRead } = useMarkAllNotificationsRead()
  const { mutate: markAsRead } = useMarkNotificationRead('')

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="markAllReadButton"
        color="primary"
        onClick={() => {
          markAllRead({ userId }, {
            onSuccess: () => {
              refetch()
            },
          })
        }}
        disabled={isMarkingAllRead}
      >
        {String(t('notifications.markAllRead', 'Mark All as Read'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, t, markAllRead, userId, isMarkingAllRead, refetch])

  if (isLoading) {
    return (
      <Container>
        <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Alert
          color="danger"
          title={String(t('states.error', 'Error'))}
          message={String(error.message || t('notifications.loadError', 'Failed to load notifications'))}
        />
      </Container>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
  }

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'Success':
        return 'success'
      case 'Warning':
        return 'warning'
      case 'Error':
      case 'Critical':
        return 'danger'
      default:
        return 'info'
    }
  }

  const handleMarkAsRead = (notification: Notification) => {
    if (notification.id) {
      markAsRead({}, {
        mutationKey: ['notifications', notification.id],
        onSuccess: () => {
          refetch()
        },
      })
    }
  }

  return (
    <Container>
      <Row>
        <Column>
          <h2>{t('notifications.label', 'Notifications')}</h2>
        </Column>
      </Row>

      <Row>
        <Column md={6}>
          <select
            id="statusFilter"
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t('notifications.allStatus', 'All Status')}</option>
            <option value="Unread">{t('notifications.status.unread', 'Unread')}</option>
            <option value="Read">{t('notifications.status.read', 'Read')}</option>
            <option value="Archived">{t('notifications.status.archived', 'Archived')}</option>
          </select>
        </Column>
        <Column md={6}>
          <select
            id="typeFilter"
            className="form-control"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">{t('notifications.allTypes', 'All Types')}</option>
            <option value="Info">{t('notifications.type.info', 'Info')}</option>
            <option value="Success">{t('notifications.type.success', 'Success')}</option>
            <option value="Warning">{t('notifications.type.warning', 'Warning')}</option>
            <option value="Error">{t('notifications.type.error', 'Error')}</option>
            <option value="Critical">{t('notifications.type.critical', 'Critical')}</option>
          </select>
        </Column>
      </Row>

      <Row>
        <Column>
          <Table
            data={notifications}
            getID={(row) => row.id || row._id}
            columns={[
              {
                label: t('notifications.type', 'Type'),
                key: 'type',
                formatter: (row: Notification) => (
                  <Badge color={getNotificationColor(row.type)}>{row.type}</Badge>
                ),
              },
              {
                label: t('notifications.title', 'Title'),
                key: 'title',
              },
              {
                label: t('notifications.message', 'Message'),
                key: 'message',
                formatter: (row: Notification) => (
                  <span style={{ maxWidth: '300px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {row.message}
                  </span>
                ),
              },
              {
                label: t('notifications.createdAt', 'Created'),
                key: 'createdAt',
                formatter: (row: Notification) => formatDate(row.createdAt),
              },
              {
                label: t('notifications.status', 'Status'),
                key: 'status',
                formatter: (row: Notification) => (
                  <Badge color={row.status === 'Unread' ? 'primary' : 'secondary'}>
                    {row.status}
                  </Badge>
                ),
              },
            ]}
            actionsHeaderText={t('actions.label', 'Actions')}
            actions={[
              {
                label: t('notifications.markRead', 'Mark as Read'),
                action: (row: Notification) => handleMarkAsRead(row),
                disabled: (row: Notification) => row.status === 'Read',
              },
            ]}
          />
        </Column>
      </Row>
    </Container>
  )
}

export default Notifications

