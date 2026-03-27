import '../__mocks__/matchMediaMock'
import React from 'react'
import { mount } from 'enzyme'
import LaHIM from '../LaHIM'
import App from '../App'

it('renders without crashing', () => {
  const wrapper = mount(<App />)
  expect(wrapper.find(LaHIM)).toHaveLength(1)
})
