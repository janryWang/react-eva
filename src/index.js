import React, { Component } from 'react'
import { Subject } from 'rxjs'
import { filter } from 'rxjs/operators'

const EvaContext = React.createContext()

const isFn = val => typeof val === 'function'

const createEva = (actions, effects, subscribes) => {
  subscribes = subscribes || {}

  const subscription = () => {
    if (isFn(effects)) {
      effects((type, $filter) => {
        if (!subscribes[type]) {
          subscribes[type] = new Subject()
        }
        if (isFn($filter)) {
          return subscribes[type].pipe(filter($filter))
        }
        return subscribes[type]
      })
    }
  }

  const dispatch = (type, ...args) => {
    if (subscribes[type]) {
      subscribes[type].next(...args)
    }
  }

  const implementAction = (name, fn) => {
    if (actions) {
      if (name && isFn(fn)) {
        if (Array.isArray(actions)) {
          let findedIndex = actions.findIndex(actions => !!actions[name])
          if (findedIndex > -1) {
            actions[findedIndex][name] = fn
          }
        } else if (typeof actions === 'object') {
          if (actions[name]) {
            actions[name] = fn
          }
        }
      }
    }
    return fn
  }

  const implementActions = obj => {
    let actions = {}
    for (let name in obj) {
      if (obj.hasOwnProperty(name) && isFn(obj[name])) {
        actions[name] = implementAction(name, obj[name])
      }
    }
    return actions
  }

  return {
    dispatch,
    subscription,
    implementActions
  }
}

export const connect = options => {
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
        this.subscribes = {}
        const { subscription, dispatch, implementActions } = createEva(
          props.actions,
          props.effects,
          props.subscribes
        )
        this.implementActions = implementActions
        this.subscription = subscription
        this.dispatch = dispatch
        if (options.autoRun) {
          subscription()
        }
      }

      render() {
        return (
          <Target
            {...this.props}
            implementActions={this.implementActions}
            dispatch={this.dispatch}
            subscribes={this.subscribes}
            subscription={this.subscription}
          />
        )
      }
    }

    return Effect
  }

  return Target ? _class_(Target) : _class_
}

export const createActions = (...names) => {
  return names.reduce((buf, name) => {
    buf[name] = () => {
      if (console && console.error) {
        console.error(`The action "${name}" is not implemented!`)
      }
    }
    return buf
  }, {})
}

export const createEffects = fn => fn

export const useEva = ({
  actions,
  effects,
  subscribes,
  autoRun = true
} = {}) => {
  const context = React.useContext(EffectsContext) || {}

  return React.useMemo(() => {
    const manager = createEva(actions, effects, subscribes)
    if (autoRun) {
      manager.subscription()
    }
    return manager
  })
}
