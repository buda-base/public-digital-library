// @flow

export type Action = {
    type: string,
    payload?: any,
    error?: Error,
    meta?: any
}

export const INITIATE_APP = 'INITIATE_APP';
export const initiateApp = (params:{}): Action => {
    return {
        type: INITIATE_APP,
        payload:params
    }
}
