// ===============================|| Blank Layout ||=============================== //
<script async setup lang="ts">
import config from '@/config';
import { RouterView } from "vue-router";

</script>
<template>
  <!-----RTL LAYOUT------->
  <v-locale-provider v-if="customizer.setRTLLayout" rtl>
    <v-app :theme="customizer.actTheme">
      <RouterView />
    </v-app>
  </v-locale-provider>

  <!-----LTR LAYOUT------->
  <v-locale-provider v-else>
    <v-app :theme="customizer.actTheme">
      <RouterView />
    </v-app>
  </v-locale-provider>
</template>