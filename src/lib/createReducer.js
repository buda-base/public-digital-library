// @flow
import type { Action } from '../state/actions';

const createReducer = (initialState: {}, handlers: {}) => {
    return function reducer(state: {} = initialState, action: Action) {
        if (handlers.hasOwnProperty(action.type)) {
            return handlers[action.type](state, action)
        } else {
            return state
        }
    }
}

export default createReducer;
