# react-eva

> React distributed state management solution.

### Demo

https://codesandbox.io/s/0pk3mlmwrn

### Usage

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { connect, createActions, createEffects } from 'react-eva'

const App = connect(
  class App extends React.Component {
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
          <button className="inner-btn" onClick={() => this.props.dispatch('onClick')}>
            button
          </button>
        </div>
      )
    }
  }
)

const actions = createActions('setText')
const effects = createEffects($ => {
  $('onClick').subscribe(() => {
    actions.setText('This is inner click')
  })
})

ReactDOM.render(
  <div>
    <App actions={actions} effects={effects} />
    <button
      className="outer-btn"
      onClick={() => {
        actions.setText('This is outer click')
      }}
    >
      button
    </button>
  </div>,
  mountNode
)
```

### API

##### 1. `connect(options : Object | ReactComponent) : (Target : ReactComponent)=>ReactComponent`

The connect's options

| property name | description                              | type    |
| ------------- | ---------------------------------------- | ------- |
| autoRun       | It is used to auto run the subscription. | Boolean |

The target component will receive the following properties.

| property name    | description                                                                                             | type     | params                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------- |
| implementActions | it used for batch create state actions method,and it will communicate with externally declared actions. | Function | `implementAction(type : String,handler : Function)` |
| dispatch         | It is used to dispatch custom events.                                                                   | Function | `dispatch(type:String,..args : any)`                |
| subscription     | It is used to perform side-effect logic.If you set autoRun to false, then you need to call it manually. | Function | `subscription()`                                    |
| subscribes       | It is the core object of event communication.                                                           | Object   |                                                     |

The output component will receive the following properties.

| property name | description                                                  | type     | params                                                       |
| ------------- | ------------------------------------------------------------ | -------- | ------------------------------------------------------------ |
| actions       | This property is designed to internal and external communication of components. | Object   |                                                              |
| effects       | This property is designed to handle the side effects of components. | Function | `effects(callback : ($ : (type : String, filter : Function)=>Observable)=>{})` |


##### 2. `createActions(...type : String) : Object`

It is used for batch declaration of state actions.
(Note: The success of calling actions is that the component has been rendered.)

##### 3. `createAsyncActions(...type : String) : Object`

It is used for batch declaration of state actions.
(Note: All methods will return a Promise object, and we don't have to wait for the component to render completed when we call actions.)

##### 3. `mergeActions(...actions : Object) : Object`

It is used for merge multi actions.

##### 4. `createEffects(callback : ($ : (type : String, filter : Function)=>Observable)=>{}) : Function`

It is used to create a side-effect execution environment.

##### 5. `useEva({actions:Object,effects:Function})`

It will return the following methods.

| property name    | description                                                                                             | type     | params                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------- |
| implementActions | it used for batch create state actions method,and it will communicate with externally declared actions. | Function | `implementAction(type : String,handler : Function)` |
| dispatch         | It is used to dispatch custom events.                                                                   | Function | `dispatch(type:String,..args : any)`                |
| subscription     | It is used to perform side-effect logic.If you set autoRun to false, then you need to call it manually. | Function | `subscription()`                                    |

**USECASE**

```jsx
import { useEva } from 'react-eva'

const App = ({ actions, effects }) => {
  const [state, setState] = useState({ text: '' })
  const { implementActions, dispatch } = useEva({ actions, effects })
  const actions = implementActions({
    getText: () => state.text,
    setText: text => setState({ text })
  })
  return (
    <div className="sample">
      <div className="text">{state.text}</div>
      <button className="inner-btn" onClick={() => dispatch('onClick')}>
        button
      </button>
    </div>
  )
}
```

### Install

```
npm install --save react-eva
```

### LICENSE

The MIT License (MIT)

Copyright (c) 2018 JanryWang

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
