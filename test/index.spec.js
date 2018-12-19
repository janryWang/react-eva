import test from 'ava'
import './polyfill'
import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import {
  effectable,
  createEffects,
  declareActions,
  usePipeEffects
} from '../src'

Enzyme.configure({ adapter: new Adapter() })

const Sample = effectable()(
  class Sample extends React.Component {
    state = {
      text: ''
    }

    getText = () => this.state.text

    setText = text => {
      this.setState({
        text
      })
    }

    actions = this.props.handshakeActions({
      getText: this.getText,
      setText: this.setText
    })

    render() {
      return (
        <div className="sample">
          <div className="text">{this.state.text}</div>
          <button className="inner-btn" {...this.props.createEvents('onClick')}>
            button
          </button>
        </div>
      )
    }
  }
)

const useState = React.useState

const Sample2 = props => {
  const [state, setState] = useState('')
  const { handshakeActions, createEvents } = usePipeEffects(props)

  const actions = handshakeActions({
    getText() {
      return state
    },
    setText(text) {
      setState(text)
    }
  })

  return (
    <div className="sample">
      <div className="text">{state}</div>
      <button className="inner-btn" {...createEvents('onClick')}>
        button
      </button>
    </div>
  )
}

test('simple', t => {
  const actions = declareActions('setText')
  const effects = createEffects($ => {
    $('onClick').subscribe(() => {
      actions.setText('This is inner click')
    })
  })
  const dom = mount(
    <div>
      <Sample actions={[actions]} effects={effects} />
      <button
        className="outer-btn"
        onClick={() => {
          actions.setText('This is outer click')
        }}
      >
        button
      </button>
    </div>
  )
  t.truthy(dom.find('.text').text() == '')
  dom.find('.inner-btn').simulate('click')
  t.truthy(dom.find('.text').text() == 'This is inner click')
  dom.find('.outer-btn').simulate('click')
  t.truthy(dom.find('.text').text() == 'This is outer click')
})

/*
can not write test case.
test('hooks', t => {
  const actions = declareActions('setText')
  const effects = createEffects($ => {
    $('onClick').subscribe(() => {
      actions.setText('This is inner click')
    })
  })
  const dom = mount(
    <div>
      <Sample2 actions={actions} effects={effects} />
      <button
        className="outer-btn"
        onClick={() => {
          actions.setText('This is outer click')
        }}
      >
        button
      </button>
    </div>
  )
  t.truthy(dom.find('.text').text() == '')
  dom.find('.inner-btn').simulate('click')
  t.truthy(dom.find('.text').text() == 'This is inner click')
  dom.find('.outer-btn').simulate('click')
  t.truthy(dom.find('.text').text() == 'This is outer click')
})

*/
