<script setup>
import config from '@/config';
import { computed } from "vue";
import LogoDark from "./LogoDark.vue";
import LogoLight from "./LogoLight.vue";

//const dark = ref(false);
const dark = computed(() => {
  if (
    config.actTheme === "DARK_BLUE_THEME"

  ) {
    return true;
  } else {
    return false;
  }
});
</script>
<template>
  <v-locale-provider v-if="!config.setRTLLayout">
    <LogoLight v-if="dark" />
    <LogoDark v-else />
  </v-locale-provider>
</template>