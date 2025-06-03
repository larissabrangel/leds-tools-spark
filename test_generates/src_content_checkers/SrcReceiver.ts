import { checkFileContent, checkIsDir, checkIsFile } from "../checkers";
import path from "path";
import { StoresChecker } from "./stores/StoresChecker";
import { ViewChecker } from "./views/ViewsChecker";


export class SrcReceiver {

    constructor(private srcPath: string = "src") { 
        checkIsDir(this.srcPath); 
        checkIsFile(path.join(this.srcPath, 'App.vue'));
        checkFileContent(path.join(this.srcPath, 'App.vue'), "<template>\n  <RouterView></RouterView>\n</template>\n\n<script setup lang=\"ts\">\nimport { RouterView } from \"vue-router\";\n</script>");
        checkIsFile(path.join(this.srcPath, 'config.ts'));
        checkFileContent(path.join(this.srcPath, 'config.ts'), "export type ConfigProps = {\n    Sidebar_drawer: any;\n    Customizer_drawer: boolean;\n    mini_sidebar: boolean;\n    setHorizontalLayout: boolean;\n    setRTLLayout: boolean;\n    actTheme: string;\n    inputBg:string;\n    boxed: boolean;\n    setBorderCard: boolean;\n};\n\nconst config: ConfigProps = {\n    Sidebar_drawer: null,\n    Customizer_drawer: false,\n    mini_sidebar: false,\n    setHorizontalLayout: false, // Horizontal layout\n    setRTLLayout: false, // RTL layout\n    actTheme: 'ORANGE_THEME',\n    inputBg: 'ORANGE_THEME',\n    boxed: true,\n    setBorderCard: false\n};\n\nexport default config;");
        checkIsFile(path.join(this.srcPath, 'main.ts'));
        checkFileContent(path.join(this.srcPath, 'main.ts'), "import '@/scss/style.scss';\nimport Maska from 'maska';\nimport { createPinia } from 'pinia';\nimport { createApp } from 'vue';\nimport VueTablerIcons from 'vue-tabler-icons';\nimport VueApexCharts from 'vue3-apexcharts';\nimport 'vue3-carousel/dist/carousel.css';\nimport { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';\nimport 'vue3-perfect-scrollbar/style.css';\nimport App from './App.vue';\nimport vuetify from './plugins/vuetify';\nimport { router } from './router';\n\nimport { createI18n } from 'vue-i18n';\nimport VueScrollTo from 'vue-scrollto';\nimport Vue3EasyDataTable from 'vue3-easy-data-table';\nimport 'vue3-easy-data-table/dist/style.css';\nconst i18n = createI18n({\n    locale: 'en',\n    silentTranslationWarn: true,\n    silentFallbackWarn: true\n});\n\nconst app = createApp(App);\napp.use(router);\napp.component('EasyDataTable', Vue3EasyDataTable);\napp.use(PerfectScrollbarPlugin);\napp.use(createPinia());\napp.use(VueTablerIcons);\n// app.use(print);\napp.use(i18n);\napp.use(Maska);\napp.use(VueApexCharts);\napp.use(vuetify).mount('#app');\n//ScrollTop Use\n// app.use(VueScrollTo);\napp.use(VueScrollTo, {\n    duration: 1000,\n    easing: \"ease\"\n})");
    }

    public getPath(): string {
        return this.srcPath;
    }

    public checkStores(storesDir: string): void {
        const checkStoresInstance = new StoresChecker(path.join(this.srcPath, storesDir));
        checkStoresInstance.storesCheckers();
    } 

    public checkViews(viewsDir: string): void {
        const checkViewsInstance = new ViewChecker(path.join(this.srcPath, viewsDir));
        checkViewsInstance.viewsCheckers();
    }
}
