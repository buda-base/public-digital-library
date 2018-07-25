// @flow

export type Action = {
    type: string,
    payload?: any,
    error?: Error,
    meta?: any
}

export const INITIATE_APP = 'INITIATE_APP';
export const initiateApp = (params:{},iri?:string,auth?:{}): Action => {
    return {
        type: INITIATE_APP,
        payload:params,
        meta:{iri,auth}
    }
}
