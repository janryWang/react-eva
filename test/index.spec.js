import test from 'ava'
import './polyfill'
import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { connect, createEffects, createActions, mergeActions, useEva } from '../src'

Enzyme.configure({ adapter: new Adapter() })

const Sample = connect()(
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

    actions = this.props.implementActions({
      getText: this.getText,
      setText: this.setText
    })

    render() {
      return (
        <div className="sample">
          <div className="text">{this.state.text}</div>
          <button
            className="inner-btn"
            onClick={() => this.props.dispatch('onClick')}
          >
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
  const { implementActions, dispatch } = useEva(props)

  const actions = implementActions({
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
      <button className="inner-btn" onClick={() => dispatch('onClick')}>
        button
      </button>
    </div>
  )
}

test('indicator', t => {
  const actions = createActions('setText')
  const actionsSymbol = Symbol.for("__REVA_ACTIONS")
  t.truthy(actions[actionsSymbol] === true)
  const dom = mount(
    <div>
      <Sample actions={actions} />
    </div>
  )

  t.truthy(actions[actionsSymbol] === true)
})

test('merge indicator', t => {
  const actions = createActions('setText')
  const actions2 = createActions('setText2')
  const actionsCombo = mergeActions(actions, actions2)
  const actionsSymbol = Symbol.for("__REVA_ACTIONS")
  t.truthy(actionsCombo[actionsSymbol] === true)
  const dom = mount(
    <div>
      <Sample actions={actionsCombo} />
    </div>
  )

  t.truthy(actionsCombo[actionsSymbol] === true)
})

test('simple', t => {
  const actions = createActions('setText')
  const effects = createEffects($ => {
    $('onClick').subscribe(() => {
      actions.setText('This is inner click')
    })
  })
  const dom = mount(
    <div>
      <Sample actions={actions} effects={effects} />
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
  const actions = createActions('setText')
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
