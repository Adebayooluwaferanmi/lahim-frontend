import LabRepository from '../../../clients/db/LabRepository'
import Lab from '../../../model/Lab'

describe('lab repository', () => {
  it('should generate a lab code', async () => {
    const newLab = await LabRepository.save({
      patientId: '123',
      type: 'test',
    } as Lab)

    expect(newLab.code).toMatch(/^L-[A-Za-z0-9_-]{10}$/)
  })
})
