# react-eva

> React distributed state management solution.

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
          <button className="inner-btn" {...this.props.createEvents('onClick')}>
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
  </div>
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
| implementActions | it used for batch create state actions method,and it will communicate with externally declared actions. | Function | `handshakeAction(type : String,handler : Function)` |
| dispatch         | It is used to dispatch custom events.                                                                   | Function | `dispatch(type:String,..args : any)`                |
| subscription     | It is used to perform side-effect logic.If you set autoRun to false, then you need to call it manually. | Function | `subscription()`                                    |
| subscribes       | It is the core object of event communication.                                                           | Object   |                                                     |




##### 2. `createActions(...type : String) : Object`

It is used for batch declaration of state actions.




##### 3. `createEffects(callback : ($ : (type : String, filter : Function)=>Observable)=>{}) : Function`

It is used to create a side-effect execution environment.


##### 4. `useEva({actions:Object,effects:Function})`

It will return the following methods.

| property name    | description                                                                                             | type     | params                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------- ||
| implementActions | it used for batch create state actions method,and it will communicate with externally declared actions. | Function | `handshakeAction(type : String,handler : Function)` |
| dispatch         | It is used to dispatch custom events.                                                                   | Function | `dispatch(type:String,..args : any)`                |
| subscription     | It is used to perform side-effect logic.If you set autoRun to false, then you need to call it manually. | Function | `subscription()`                                    |

**USECASE**

```jsx
import { useEva } from 'react-eva'

const App = ({actions,effects}) => {
  const [state, setState] = useState({ text: '' })
  const { implementActions, createEvents } = useEva({actions,effects})
  const actions = implementActions({
    getText: () => state.text,
    setText: text => setState({ text })
  })
  return (
    <div className="sample">
      <div className="text">{state.text}</div>
      <button className="inner-btn" {...createEvents('onClick')}>
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
