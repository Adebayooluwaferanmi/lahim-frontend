import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Badge } from '@hospitalrun/components'
import { useNotifications, useUnreadNotificationsCount, useMarkNotificationRead } from '../hooks/useNotifications'
import { Notification, NotificationType } from '../model/Notification'

interface NotificationCenterProps {
  userId?: string
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: notifications = [] } = useNotifications({
    userId,
    status: 'Unread',
    limit: 10,
  })

  const { data: unreadCount } = useUnreadNotificationsCount(userId)
  const { mutate: markAsRead } = useMarkNotificationRead('')

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.id && !notification._id) return

    // Mark as read
    if (notification.id) {
      markAsRead({}, {
        mutationKey: ['notifications', notification.id],
        onSuccess: () => {
          // Navigate if link exists
          if (notification.link) {
            navigate(notification.link)
          }
        },
      })
    }

    setIsOpen(false)
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'Success':
        return 'check-circle'
      case 'Warning':
        return 'exclamation-triangle'
      case 'Error':
      case 'Critical':
        return 'exclamation-circle'
      default:
        return 'info-circle'
    }
  }

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'Success':
        return '#28a745'
      case 'Warning':
        return '#ffc107'
      case 'Error':
      case 'Critical':
        return '#dc3545'
      default:
        return '#17a2b8'
    }
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t('notifications.justNow', 'Just now')
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const count = unreadCount?.count || notifications.length

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          padding: '8px',
          cursor: 'pointer',
          position: 'relative',
          color: '#fff',
        }}
      >
        <i className="fas fa-bell" style={{ fontSize: '1.2rem' }} />
        {count > 0 && (
          <Badge
            color="danger"
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              fontSize: '0.7rem',
              padding: '2px 5px',
            }}
          >
            {count > 99 ? '99+' : count}
          </Badge>
        )}
      </button>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: '8px',
            width: '350px',
            maxHeight: '400px',
            overflowY: 'auto',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
          }}
        >
          <div style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
            <strong>{t('notifications.label', 'Notifications')}</strong>
            {count > 0 && (
              <span style={{ marginLeft: '10px', color: '#666' }}>
                {count} {t('notifications.unread', 'unread')}
              </span>
            )}
          </div>
          {notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id || notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '10px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <i
                      className={`fas fa-${getNotificationIcon(notification.type)}`}
                      style={{
                        color: getNotificationColor(notification.type),
                        marginRight: '10px',
                        marginTop: '2px',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {notification.title}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>
                        {notification.message}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#999' }}>
                        {formatTime(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              {t('notifications.noNotifications', 'No new notifications')}
            </div>
          )}
          <div style={{ padding: '10px', borderTop: '1px solid #ddd', textAlign: 'center' }}>
            <button
              onClick={() => {
                navigate('/notifications')
                setIsOpen(false)
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {t('notifications.viewAll', 'View all notifications')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
