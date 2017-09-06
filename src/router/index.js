import Vue from 'vue'
import Router from 'vue-router'
import GoodList from '@/views/GoodList'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'GoodList',
      component: GoodList
    }
  ]
})
