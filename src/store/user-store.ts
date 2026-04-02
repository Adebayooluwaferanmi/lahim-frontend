import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import Permissions from '../model/Permissions'

interface UserState {
  permissions: Permissions[]
  fetchPermissions: (permissions: Permissions[]) => void
}

export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      permissions: [
        Permissions.ReadPatients,
        Permissions.WritePatients,
        Permissions.ReadAppointments,
        Permissions.WriteAppointments,
        Permissions.DeleteAppointment,
        Permissions.AddAllergy,
        Permissions.AddDiagnosis,
        Permissions.ViewLabs,
        Permissions.ViewLab,
        Permissions.RequestLab,
        Permissions.CompleteLab,
        Permissions.CancelLab,
        Permissions.ReadFinancial,
        Permissions.WriteFinancial,
        Permissions.ApproveBillingOverride,
        Permissions.ReadFinancialReports,
      ],

      fetchPermissions: (permissions: Permissions[]) =>
        set({ permissions }, false, 'fetchPermissions'),
    }),
    { name: 'UserStore' },
  ),
)
