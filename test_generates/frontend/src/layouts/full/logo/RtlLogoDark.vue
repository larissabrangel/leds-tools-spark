<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>
<template>
    <div class="logo">
        <RouterLink to="/">
            <img :src="logo" alt="home" />
        </RouterLink>
    </div>
</template>