import { AbstractDBModel } from './Model'

export type NotificationType = 
  | 'Info'
  | 'Success'
  | 'Warning'
  | 'Error'
  | 'Critical'

export type NotificationStatus = 'Unread' | 'Read' | 'Archived'

export type NotificationChannel = 'In-App' | 'Email' | 'SMS' | 'Push'

export interface Notification extends AbstractDBModel {
  userId: string // Target user ID
  type: NotificationType
  status: NotificationStatus
  title: string
  message: string
  // Optional metadata
  link?: string // URL to navigate when clicked
  linkText?: string
  // Related entities
  relatedEntityType?: string // e.g., 'visit', 'lab-result', 'incident'
  relatedEntityId?: string
  // Channels
  channels?: NotificationChannel[]
  sentChannels?: NotificationChannel[] // Channels where notification was successfully sent
  // Timestamps
  readAt?: string
  archivedAt?: string
  expiresAt?: string
  // Priority
  priority?: 'Low' | 'Normal' | 'High' | 'Urgent'
  // Actions
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: string // e.g., 'view', 'approve', 'dismiss'
  link?: string
}

export interface NotificationPreferences {
  userId: string
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
  inAppEnabled: boolean
  // Per-type preferences
  preferencesByType?: {
    [key in NotificationType]?: {
      email?: boolean
      sms?: boolean
      push?: boolean
      inApp?: boolean
    }
  }
}

