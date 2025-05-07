import { Model } from "../../../../../language/generated/ast.js";
import fs from "fs";
import { expandToString } from "langium/generate";
import path from "path";

export function generate(model: Model, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder, 'README.md'), generateREDME());
    fs.writeFileSync(path.join(target_folder, 'index.ts'), generateIndex());
    fs.writeFileSync(path.join(target_folder, 'pinia.ts'), generatePinia());
    fs.writeFileSync(path.join(target_folder, 'router.ts'), generateRouter());
    fs.writeFileSync(path.join(target_folder, 'vuetify.ts'), generateVuetify());
}


function generateREDME() : string {
    return expandToString`
# Plugins

Plugins are a way to extend the functionality of your Vue application. Use this folder for registering plugins that you want to use globally.
`
}


function generateIndex() : string {
    return expandToString`
/**
 * plugins/index.ts
 *
 * Automatically included in './src/main.ts'
 */

// Plugins
// import vuetify from './vuetify'
import router from './router'
import pinia from './pinia'

// Types
import type { App } from 'vue'

export function registerPlugins (app: App) {
  // app.use(vuetify)
  app.use(router)
  app.use(pinia)
}
`
}


function generatePinia() : string {
    return expandToString`
import { createPinia } from 'pinia'



const pinia = createPinia()

export default pinia
`

}


function generateRouter(): string {
    return expandToString`
import { createWebHistory, createRouter, type RouteRecordRaw } from 'vue-router'
import { routes as rootRoutes } from '@/routes'
import { routes as moduleRoutes } from '@/modules'
import PlainLayout from '@/layouts/NewPlain.vue'
import DefaultLayout from '@/layouts/NewDefault.vue'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: PlainLayout,
    children: rootRoutes,
  },
  {
    path: '/',
    component: DefaultLayout,
    children: moduleRoutes,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta?.requiresAuth) {
    if (auth.estaLogado()) {
      return true
    } else {
      return { name: 'login' }
    }
  } else {
    return true
  }
})
export default router
`
}


function generateVuetify() : string {
    return expandToString`
/**
 * plugins/vuetify.ts
 *
 * Framework documentation: 'https://vuetifyjs.com'
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'dark',
  },
})
`
}
