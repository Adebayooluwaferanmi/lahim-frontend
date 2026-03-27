import { nanoid } from 'nanoid'

const generateCode = (prefix: string) => {
  const id = nanoid(10)
  return `${prefix}-${id}`
}

export default generateCode
