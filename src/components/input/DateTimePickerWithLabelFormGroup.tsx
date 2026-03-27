import React from 'react'
import { Label, DateTimePicker } from '@lahim/components'

interface Props {
  name: string
  label: string
  value: Date | undefined
  isEditable?: boolean
  onChange?: (date: Date) => void
}

const DateTimePickerWithLabelFormGroup = (props: Props) => {
  const { onChange, label, name, isEditable, value } = props
  const id = `${name}DateTimePicker`
  return (
    <div className="form-group">
      <Label text={label} isRequired htmlFor={id} />
      <DateTimePicker
        dateFormat="MM/dd/yyyy h:mm aa"
        dateFormatCalendar="LLLL yyyy"
        dropdownMode="scroll"
        disabled={!isEditable}
        selected={value}
        onChange={(inputDate: Date, event: React.ChangeEvent<HTMLInputElement>) => {
          if (onChange) {
            onChange(inputDate)
          }
        }}
        showTimeSelect
        timeCaption="time"
        timeFormat="h:mm aa"
        timeIntervals={15}
        withPortal={false}
      />
    </div>
  )
}

export default DateTimePickerWithLabelFormGroup
