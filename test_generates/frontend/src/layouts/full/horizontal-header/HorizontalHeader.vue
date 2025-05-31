<script async setup lang="ts">
import config from '@/config';
import { ref } from 'vue';
const priority = ref(config.setHorizontalLayout ? 0 : 0);
</script>

<template>
    <v-app-bar elevation="0" :priority="priority" height="64" class="horizontal-header" color="background">
        <div :class="config.boxed ? 'maxWidth v-toolbar__content px-lg-0 px-4' : 'v-toolbar__content px-6'">
        </div>
    </v-app-bar>
</template>