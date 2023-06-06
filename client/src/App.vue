<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <RouterView />

  <div id="preload-images" style="display: none">
    <img src="/assets/buildings/1.png" />
    <img src="/assets/buildings/2.png" />
    <img src="/assets/buildings/3.png" />
    <img src="/assets/buildings/4.png" />

    <img src="/assets/players/1.png" />
    <img src="/assets/players/2.png" />
    <img src="/assets/players/3.png" />
    <img src="/assets/players/4.png" />
  </div>
</template>

<style>
body {
  font-family: "League Spartan";
  display: flex;
  justify-content: center;
}



html, body {
  overflow: hidden;
}
body {
  position: relative;
}

</style>
