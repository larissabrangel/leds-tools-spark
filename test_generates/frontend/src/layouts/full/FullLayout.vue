<script async setup lang="ts">
import config from '@/config';
import { RouterView } from 'vue-router';
import HorizontalHeader from './horizontal-header/HorizontalHeader.vue';
import HorizontalSidebar from './horizontal-sidebar/HorizontalSidebar.vue';
import VerticalSidebarVue from './vertical-sidebar/VerticalSidebar.vue';
import VerticalHeaderVue from './vertical-header/VerticalHeader.vue';
import Customizer from './customizer/Customizer.vue';
</script>

<template>
    <!-----RTL LAYOUT------->
    <v-locale-provider v-if="!config.setRTLLayout">
        <v-app :theme="config.actTheme" :class="[
            config.actTheme,
            config.mini_sidebar ? 'mini-sidebar' : '',
            config.setHorizontalLayout ? 'horizontalLayout' : 'verticalLayout',
            config.setBorderCard ? 'cardBordered' : '',
            config.inputBg ? 'inputWithbg' : ''
        ]">
            <VerticalSidebarVue v-if="!config.setHorizontalLayout" />
            <VerticalHeaderVue v-if="!config.setHorizontalLayout" />
            <HorizontalHeader v-if="config.setHorizontalLayout" />
            <HorizontalSidebar v-if="config.setHorizontalLayout" />

            <v-main>
                <v-container fluid class="page-wrapper pb-sm-15 pb-10">
                    <div :class="config.boxed ? 'maxWidth' : ''">
                        <RouterView />
                    </div>
                </v-container>
            </v-main>
        </v-app>
    </v-locale-provider>
</template>