import React, { useEffect } from 'react'
import { useParams, Route, useNavigate, useLocation } from 'react-router-dom'
import { Panel, Spinner, TabsHeader, Tab, Button } from '@lahim/components'
import { useTranslation } from 'react-i18next'

import { useButtonToolbarSetter } from 'page-header/ButtonBarProvider'
import Allergies from 'patients/allergies/Allergies'
import Diagnoses from 'patients/diagnoses/Diagnoses'
import useTitle from '../../page-header/useTitle'
import { usePatientStore } from '../../store/patient-store'
import { useUserStore } from '../../store/user-store'
import { getPatientFullName } from '../util/patient-name-util'
import Permissions from '../../model/Permissions'
import Patient from '../../model/Patient'
import GeneralInformation from '../GeneralInformation'
import RelatedPerson from '../related-persons/RelatedPersonTab'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import AppointmentsList from '../appointments/AppointmentsList'
import Note from '../notes/NoteTab'
import Labs from '../labs/LabsTab'
import VisitsList from '../visits/VisitsList'
import PatientInsurance from '../insurance/PatientInsurance'

const getPatientCode = (p: Patient): string => {
  if (p) {
    return p.code
  }

  return ''
}

const ViewPatient = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const patient = usePatientStore((s) => s.patient)
  const status = usePatientStore((s) => s.status)
  const fetchPatient = usePatientStore((s) => s.fetchPatient)
  const permissions = useUserStore((s) => s.permissions)

  useTitle(`${getPatientFullName(patient)} (${getPatientCode(patient)})`)

  const setButtonToolBar = useButtonToolbarSetter()

  const breadcrumbs = [
    { i18nKey: 'patients.label', location: '/patients' },
    { text: getPatientFullName(patient), location: `/patients/${patient.id}` },
  ]
  useAddBreadcrumbs(breadcrumbs, true)

  const { id } = useParams()
  useEffect(() => {
    if (id) {
      fetchPatient(id)
    }

    const buttons = []
    if (permissions.includes(Permissions.WritePatients)) {
      buttons.push(
        <Button
          key="editPatientButton"
          color="success"
          icon="edit"
          outlined
          onClick={() => {
            navigate(`/patients/edit/${patient.id}`)
          }}
        >
          {String(t('actions.edit'))}
        </Button>,
      )
    }

    setButtonToolBar(buttons)

    return () => {
      setButtonToolBar([])
    }
  }, [id, fetchPatient, setButtonToolBar, navigate, patient.id, permissions, t])

  if (status === 'loading' || !patient) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  return (
    <div>
      <TabsHeader>
        <Tab
          active={location.pathname === `/patients/${patient.id}`}
          label={String(t('patient.generalInformation'))}
          onClick={() => navigate(`/patients/${patient.id}`)}
        />
        <Tab
          active={location.pathname === `/patients/${patient.id}/relatedpersons`}
          label={String(t('patient.relatedPersons.label'))}
          onClick={() => navigate(`/patients/${patient.id}/relatedpersons`)}
        />
        <Tab
          active={location.pathname === `/patients/${patient.id}/appointments`}
          label={String(t('scheduling.appointments.label'))}
          onClick={() => navigate(`/patients/${patient.id}/appointments`)}
        />
        <Tab
          active={location.pathname === `/patients/${patient.id}/allergies`}
          label={String(t('patient.allergies.label'))}
          onClick={() => navigate(`/patients/${patient.id}/allergies`)}
        />
        <Tab
          active={location.pathname === `/patients/${patient.id}/diagnoses`}
          label={String(t('patient.diagnoses.label'))}
          onClick={() => navigate(`/patients/${patient.id}/diagnoses`)}
        />
        <Tab
          active={location.pathname === `/patients/${patient.id}/notes`}
          label={String(t('patient.notes.label'))}
          onClick={() => navigate(`/patients/${patient.id}/notes`)}
        />
        <Tab
          active={location.pathname === `/patients/${patient.id}/labs`}
          label={String(t('patient.labs.label'))}
          onClick={() => navigate(`/patients/${patient.id}/labs`)}
        />
        <Tab
          active={location.pathname === `/patients/${patient.id}/visits`}
          label={String(t('visits.label', 'Visits'))}
          onClick={() => navigate(`/patients/${patient.id}/visits`)}
        />
        <Tab
          active={location.pathname === `/patients/${patient.id}/insurance`}
          label={String(t('patient.insurance.label', 'Insurance'))}
          onClick={() => navigate(`/patients/${patient.id}/insurance`)}
        />
      </TabsHeader>
      <Panel>
        <Route path="/patients/:id">
          <GeneralInformation patient={patient} />
        </Route>
        <Route path="/patients/:id/relatedpersons">
          <RelatedPerson patient={patient} />
        </Route>
        <Route path="/patients/:id/appointments">
          <AppointmentsList patientId={patient.id} />
        </Route>
        <Route path="/patients/:id/allergies">
          <Allergies patient={patient} />
        </Route>
        <Route path="/patients/:id/diagnoses">
          <Diagnoses patient={patient} />
        </Route>
        <Route path="/patients/:id/notes">
          <Note patient={patient} />
        </Route>
        <Route path="/patients/:id/labs">
          <Labs patientId={patient.id} />
        </Route>
        <Route path="/patients/:id/visits">
          <VisitsList patientId={patient.id} />
        </Route>
        <Route path="/patients/:id/insurance">
          <PatientInsurance patient={patient} />
        </Route>
      </Panel>
    </div>
  )
}

export default ViewPatient
