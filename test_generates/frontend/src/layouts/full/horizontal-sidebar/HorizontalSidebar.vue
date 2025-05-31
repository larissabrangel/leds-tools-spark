<script async setup lang="ts">
import config from '@/config';
import { shallowRef } from 'vue';
import { useDisplay } from 'vuetify';
import VerticalSidebar from '../vertical-sidebar/VerticalSidebar.vue';
import HorizontalItems from './horizontalItems';
import NavCollapse from './NavCollapse/Index.vue';
import NavItem from './NavItem/Index.vue';

const sidebarMenu = shallowRef(HorizontalItems);
const { mdAndUp } = useDisplay();
</script>

<template>
    <template v-if="mdAndUp">
        <div class="horizontalMenu  border-bottom bg-surface position-relative">
            <div :class="config.boxed ? 'maxWidth' : 'px-6'">
                <ul class="gap-1 horizontal-navbar mx-lg-0 mx-3">
                    <!---Menu Loop -->
                    <li v-for="(item, i) in sidebarMenu" :key="i" class="navItem">
                        <!---If Has Child -->
                        <NavCollapse :item="item" :level="0" v-if="item.children" />
                        <!---Single Item-->
                        <NavItem :item="item" v-else />
                        <!---End Single Item-->
                    </li>
                </ul>
            </div>
        </div>
    </template>
    <div v-else class="mobile-menu">
        <VerticalSidebar />
    </div>
</template>
<style async lang="scss"></style>