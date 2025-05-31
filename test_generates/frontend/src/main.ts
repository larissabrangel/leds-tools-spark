import '@/scss/style.scss';
import Maska from 'maska';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import VueTablerIcons from 'vue-tabler-icons';
import VueApexCharts from 'vue3-apexcharts';
import 'vue3-carousel/dist/carousel.css';
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';
import 'vue3-perfect-scrollbar/style.css';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import { router } from './router';

import { createI18n } from 'vue-i18n';
import VueScrollTo from 'vue-scrollto';
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';
const i18n = createI18n({
    locale: 'en',
    silentTranslationWarn: true,
    silentFallbackWarn: true
});

const app = createApp(App);
app.use(router);
app.component('EasyDataTable', Vue3EasyDataTable);
app.use(PerfectScrollbarPlugin);
app.use(createPinia());
app.use(VueTablerIcons);
// app.use(print);
app.use(i18n);
app.use(Maska);
app.use(VueApexCharts);
app.use(vuetify).mount('#app');
//ScrollTop Use
// app.use(VueScrollTo);
app.use(VueScrollTo, {
    duration: 1000,
    easing: "ease"
})