import { createStore, createLogger } from 'vuex'
import state from './state'
import mutations from './mutations'
import * as getters from './getters'
import * as actions from './actions'

const debug = process.env.NODE_ENV !== 'production' // 开发环境  createLogger来查看提交情况

export default createStore({
    state,
    getters,
    mutations,
    actions,
    strict: debug,
    plugins: debug ? [createLogger()] : []
})