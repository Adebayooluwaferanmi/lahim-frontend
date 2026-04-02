enum Permissions {
  ReadPatients = 'read:patients',
  WritePatients = 'write:patients',
  ReadAppointments = 'read:appointments',
  WriteAppointments = 'write:appointments',
  DeleteAppointment = 'delete:appointment',
  AddAllergy = 'write:allergy',
  AddDiagnosis = 'write:diagnosis',
  RequestLab = 'write:labs',
  CancelLab = 'cancel:lab',
  CompleteLab = 'complete:lab',
  ViewLab = 'read:lab',
  ViewLabs = 'read:labs',
  ReadFinancial = 'read:financial',
  WriteFinancial = 'write:financial',
  ApproveBillingOverride = 'approve:billing-override',
  ReadFinancialReports = 'read:financial-reports',
}

export default Permissions
