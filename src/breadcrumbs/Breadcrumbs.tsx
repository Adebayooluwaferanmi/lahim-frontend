import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Breadcrumb, BreadcrumbItem } from '@lahim/components'
import { useUIStore } from '../store/ui-store'

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
            {i18nKey ? String(t(i18nKey)) : text}
          </BreadcrumbItem>
        )
      })}
    </Breadcrumb>
  )
}

export default Breadcrumbs
