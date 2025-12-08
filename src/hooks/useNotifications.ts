import { useApiQueryWithParams, useApiQuery } from '../lib/queries'
import { useCreateMutation, useUpdateMutation, useDeleteMutation } from '../lib/mutations'
import { Notification, NotificationPreferences } from '../model/Notification'

interface UseNotificationsParams extends Record<string, unknown> {
  userId?: string
  status?: string
  type?: string
  limit?: number
  skip?: number
}

/**
 * Fetch notifications with optional filters
 */
export const useNotifications = (params: UseNotificationsParams = {}) => {
  const { data, ...rest } = useApiQueryWithParams<Notification[] | { notifications: Notification[] }, UseNotificationsParams>(
    ['notifications'],
    '/notifications',
    params
  )

  // Normalize response format
  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { notifications: Notification[] }).notifications || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

/**
 * Fetch unread notifications count
 */
export const useUnreadNotificationsCount = (userId?: string) => {
  return useApiQueryWithParams<{ count: number }, { userId?: string }>(
    ['notifications', 'unread', userId],
    '/notifications/unread',
    {
      userId: userId || 'system',
    }
  )
}

/**
 * Fetch a single notification by ID
 */
export const useNotificationById = (id: string | undefined) => {
  return useApiQuery<Notification>(
    ['notifications', id],
    `/notifications/${id}`,
    {
      enabled: !!id,
    }
  )
}

/**
 * Create a new notification
 */
export const useCreateNotification = () => {
  return useCreateMutation<Notification, Partial<Notification>>(
    '/notifications',
    {
      queryKey: ['notifications'],
      invalidateQueries: [['notifications'], ['notifications', 'unread']],
    }
  )
}

/**
 * Update an existing notification
 */
export const useUpdateNotification = (id: string) => {
  return useUpdateMutation<Notification, Partial<Notification>>(
    `/notifications/${id}`,
    {
      queryKey: ['notifications', id],
      invalidateQueries: [['notifications'], ['notifications', id], ['notifications', 'unread']],
    }
  )
}

/**
 * Mark notification as read
 */
export const useMarkNotificationRead = (id: string) => {
  return useCreateMutation<{ success: boolean }, {}>(
    `/notifications/${id}/read`,
    {
      queryKey: ['notifications', id],
      invalidateQueries: [['notifications'], ['notifications', id], ['notifications', 'unread']],
    }
  )
}

/**
 * Mark all notifications as read
 */
export const useMarkAllNotificationsRead = () => {
  return useCreateMutation<{ success: boolean; count: number }, { userId: string }>(
    '/notifications/read-all',
    {
      queryKey: ['notifications'],
      invalidateQueries: [['notifications'], ['notifications', 'unread']],
    }
  )
}

/**
 * Delete a notification
 */
export const useDeleteNotification = () => {
  return useDeleteMutation<{ message: string }>(
    '/notifications',
    {
      queryKey: ['notifications'],
      invalidateQueries: [['notifications'], ['notifications', 'unread']],
    }
  )
}

/**
 * Get notification preferences
 */
export const useNotificationPreferences = (userId: string | undefined) => {
  return useApiQuery<NotificationPreferences>(
    ['notification-preferences', userId],
    `/notifications/preferences/${userId}`,
    {
      enabled: !!userId,
    }
  )
}

/**
 * Update notification preferences
 */
export const useUpdateNotificationPreferences = (userId: string) => {
  return useUpdateMutation<NotificationPreferences, Partial<NotificationPreferences>>(
    `/notifications/preferences/${userId}`,
    {
      queryKey: ['notification-preferences', userId],
      invalidateQueries: [['notification-preferences', userId]],
    }
  )
}

