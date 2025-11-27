import React, { useState, useEffect, useCallback } from 'react'
import useTitle from '../../page-header/useTitle'
import { useTranslation } from 'react-i18next'
import format from 'date-fns/format'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import { Button } from '@hospitalrun/components'
import { useHistory } from 'react-router'

const LabOrders = () => {
  const { t } = useTranslation()
  const history = useHistory()
  const setButtons = useButtonToolbarSetter()
  useTitle(t('lims.labOrders.label'))

  const [orders, setOrders] = useState<any[]>([])

  const getButtons = useCallback(() => {
    return [
      <Button
        icon="add"
        onClick={() => history.push('/lims/lab-orders/new')}
        outlined
        color="success"
        key="labOrders.new"
      >
        {t('lims.labOrders.new')}
      </Button>,
    ]
  }, [history, t])

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await fetch('/lab-orders')
        const data = await response.json()
        setOrders(data.orders || [])
      } catch (error) {
        console.error('Failed to fetch lab orders:', error)
      }
    }

    setButtons(getButtons())
    fetch()

    return () => {
      setButtons([])
    }
  }, [getButtons, setButtons])

  const onTableRowClick = (order: any) => {
    history.push(`/lims/lab-orders/${order._id}`)
  }

  return (
    <>
      <table className="table table-hover">
        <thead className="thead-light">
          <tr>
            <th>{t('lims.labOrders.orderId')}</th>
            <th>{t('lims.labOrders.patientId')}</th>
            <th>{t('lims.labOrders.orderedOn')}</th>
            <th>{t('lims.labOrders.status')}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr onClick={() => onTableRowClick(order)} key={order._id}>
              <td>{order._id}</td>
              <td>{order.patientId}</td>
              <td>{order.orderedOn ? format(new Date(order.orderedOn), 'yyyy-MM-dd hh:mm a') : '-'}</td>
              <td>{order.status || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default LabOrders

