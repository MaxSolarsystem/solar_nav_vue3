import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Setting from '../views/Setting.vue'
import NavEdit from '../views/NavEdit.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/setting',
      name: 'setting',
      component: Setting
    },
    {
      path: '/nav-edit',
      name: 'nav-edit',
      component: NavEdit
    }
  ]
})

export default router