import React, { Component } from "react"
import { isFn } from "./utils"
import { Subject } from "rxjs"
import { filter } from "rxjs/operators"

const { Provider, Consumer } = React.createContext()

export const EffectProvider = props => (
  <Provider actions={props.actions} effects={props.effects} />
)

export const effectable = options => {
  let Target
  let defaultOptions = {
    autoRun: true
  }

  if (isFn(options)) {
    Target = options
    options = { ...defaultOptions }
  } else {
    options = { ...defaultOptions, ...options }
  }

  const _class_ = Target => {
    class Effect extends Component {
      constructor(props) {
        super(props)
        this.initialize(props)
      }

      initialize(props) {
        this.subscribes = {}
        if (options.autoRun) {
          this.runEffects(props)
        }
      }

      runEffects(props) {
        const { effects } = props || this.props
        if (isFn(effects)) {
          effects((type, $filter) => {
            if (!this.subscribes[type]) {
              this.subscribes[type] = new Subject()
            }
            if (isFn($filter)) {
              return this.subscribes[type].pipe(filter($filter))
            }
            return this.subscribes[type]
          })
        }
      }

      subscription = () => {
        this.runEffects()
      }

      createAction = (name, fn) => {
        const { actions } = this.props
        if (name && isFn(fn)) {
          if (actions) {
            actions[name] = fn
            return actions[name]
          }
        }
      }

      createActions = obj => {
        let actions = {}
        for (let name in obj) {
          if (obj.hasOwnProperty(name) && isFn(obj[name])) {
            actions[name] = this.createAction(name, obj[name])
          }
        }
        return actions
      }

      createEvents = (...names) => {
        return names.reduce((buf, name) => {
          buf[name] = (...args) => {
            this.dispatch(name, ...args)
          }
          return buf
        }, {})
      }

      dispatch = (type, ...args) => {
        if (this.subscribes[type]) {
          this.subscribes[type].next(...args)
        }
      }

      render() {
        return (
          <Target
            {...this.props}
            createAction={this.createAction}
            createActions={this.createActions}
            createEvents={this.createEvents}
            dispatch={this.dispatch}
            subscribes={this.subscribes}
            subscription={this.subscription}
          />
        )
      }
    }

    return props => (
      <Consumer>
        {({ actions, effects } = {}) => (
          <Effect actions={actions} effects={effects} {...props} />
        )}
      </Consumer>
    )
  }

  return Target ? _class_(Target) : _class_
}

export const declareActions = (...names) => {
  return names.reduce((buf, name) => {
    buf[name] = () => {
      if (console && console.error) {
        console.error(`The action "${name}" is not handshake successfully!`)
      }
    }
    return buf
  }, {})
}

export const createEffects = fn => fn
