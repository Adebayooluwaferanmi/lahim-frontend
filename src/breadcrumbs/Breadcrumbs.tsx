import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Breadcrumb, BreadcrumbItem } from '@lahim/components'
import { useUIStore } from '../store/ui-store'

const fallbackFromKey = (key: string) => {
  const segments = key.split('.')
  const last = segments[segments.length - 1] || ''
  const previous = segments[segments.length - 2] || ''

  const humanize = (value: string) =>
    value
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())

  if (last === 'label' && previous) return humanize(previous)
  if (last === 'new' && previous) return `New ${humanize(previous)}`
  if (last === 'list' && previous) return `${humanize(previous)} List`

  return humanize(last || previous || key)
}

const Breadcrumbs = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const breadcrumbs = useUIStore((state) => state.breadcrumbs)

  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <Breadcrumb>
      {breadcrumbs.map(({ i18nKey, text, location }, index) => {
        const isLast = index === breadcrumbs.length - 1
        const onClick = !isLast ? () => navigate(location) : undefined

        return (
          <BreadcrumbItem key={location} active={isLast} onClick={onClick}>
            {i18nKey ? String(t(i18nKey, fallbackFromKey(i18nKey))) : text}
          </BreadcrumbItem>
        )
      })}
    </Breadcrumb>
  )
}

export default Breadcrumbs
