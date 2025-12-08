import actions from './actions'
import dashboard from './dashboard'
import patient from './patient'
import patients from './patients'
import scheduling from './scheduling'
import states from './states'
import sex from './sex'
import labs from './labs'
import lims from './lims'
import prescriptions from './prescriptions'
import visits from './visits'
import imaging from './imaging'
import incidents from './incidents'
import reports from './reports'
import documents from './documents'
import medications from './medications'
import billing from './billing'
import settings from './settings'

export default {
  ...actions,
  ...dashboard,
  ...patient,
  ...patients,
  ...scheduling,
  ...states,
  ...sex,
  ...labs,
  ...lims,
  ...prescriptions,
  ...visits,
  ...imaging,
  ...incidents,
  ...reports,
  ...documents,
  ...medications,
  ...billing,
  ...settings,
}
