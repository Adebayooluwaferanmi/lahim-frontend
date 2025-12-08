import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Container, Row, Column, Button, TabsHeader, Tab, Panel } from '@hospitalrun/components'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import Organisms from './Organisms'
import Antibiotics from './Antibiotics'
import ValueSets from './ValueSets'

const breadcrumbs = [{ i18nKey: 'lims.vocabularies.label', location: '/lims/vocabularies' }]

const Vocabularies = () => {
  const { t } = useTranslation()
  useTitle(t('lims.vocabularies.label', 'Vocabularies'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [activeTab, setActiveTab] = useState('organisms')

  React.useEffect(() => {
    setButtonToolBar([])
    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar])

  return (
    <Container>
      <Row>
        <Column md={12}>
          <TabsHeader>
            <Tab
              active={activeTab === 'organisms'}
              label={String(t('lims.vocabularies.organisms', 'Organisms'))}
              onClick={() => setActiveTab('organisms')}
            />
            <Tab
              active={activeTab === 'antibiotics'}
              label={String(t('lims.vocabularies.antibiotics', 'Antibiotics'))}
              onClick={() => setActiveTab('antibiotics')}
            />
            <Tab
              active={activeTab === 'value-sets'}
              label={String(t('lims.vocabularies.valueSets', 'Value Sets'))}
              onClick={() => setActiveTab('value-sets')}
            />
          </TabsHeader>
          <Panel>
            {activeTab === 'organisms' && <Organisms />}
            {activeTab === 'antibiotics' && <Antibiotics />}
            {activeTab === 'value-sets' && <ValueSets />}
          </Panel>
        </Column>
      </Row>
    </Container>
  )
}

export default Vocabularies

