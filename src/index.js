import React, { Component } from "react"
import { isFn } from "./utils"
import { Subject } from "rxjs"
import { filter } from "rxjs/operators"

const EffectsContext = React.createContext()

const createEffectsManager = (declaredActions, effects, subscribes) => {
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

  const createEvents = (...names) => {
    return names.reduce((buf, name) => {
      if (typeof name === "object") {
        for (let key in name) {
          if (name.hasOwnProperty(key) && isFn(name[key])) {
            buf[key] = (...args) => {
              let res = name[key](...args)
              if (res !== undefined) {
                dispatch(key, res)
              } else {
                dispatch(key, ...args)
              }
            }
          }
        }
      } else if (typeof name === "string") {
        buf[name] = (...args) => {
          dispatch(name, ...args)
        }
      }
      return buf
    }, {})
  }

  const handshakeAction = (name, fn) => {
    if (declaredActions) {
      if (name && isFn(fn)) {
        if (Array.isArray(declaredActions)) {
          let findedIndex = declaredActions.findIndex(
            actions => !!actions[name]
          )
          if (findedIndex > -1) {
            declaredActions[findedIndex][name] = fn
          }
        } else if (typeof declaredActions === "object") {
          if (declaredActions[name]) {
            declaredActions[name] = fn
          }
        }
      }
    }
    return fn
  }

  const handshakeActions = obj => {
    let actions = {}
    for (let name in obj) {
      if (obj.hasOwnProperty(name) && isFn(obj[name])) {
        actions[name] = handshakeAction(name, obj[name])
      }
    }
    return actions
  }

  return {
    dispatch,
    createEvents,
    subscription,
    handshakeAction,
    handshakeActions
  }
}

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
        this.subscribes = {}
        const {
          subscription,
          dispatch,
          createEvents,
          handshakeAction,
          handshakeActions
        } = createEffectsManager(
          props.declaredActions || props.actions,
          props.effects,
          props.subscribes
        )
        this.handshakeAction = handshakeAction
        this.handshakeActions = handshakeActions
        this.subscription = subscription
        this.dispatch = dispatch
        this.createEvents = createEvents
        if (options.autoRun) {
          subscription()
        }
      }

      render() {
        return (
          <Target
            {...this.props}
            handshakeAction={this.handshakeAction}
            handshakeActions={this.handshakeActions}
            createEvents={this.createEvents}
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

export const useXEffect = ({
  declaredActions,
  actions,
  effects,
  subscribes,
  autoRun = true
} = {}) => {
  const context = React.useContext(EffectsContext) || {}

  declaredActions = declaredActions || actions

  return React.useMemo(() => {
    const manager = createEffectsManager(declaredActions, effects, subscribes)
    if (autoRun) {
      manager.subscription()
    }
    return manager
  })
}
