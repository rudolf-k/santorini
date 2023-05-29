<script setup lang="ts">
import { EnteringRoom } from '@/Utilities';
import ButtonComponent from '@/components/ButtonComponent.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

function aiGameLink() {
  router.push("/game-options");
}

function loginAsOwner() {
  router.push({name: "login", params: { roomToJoin: EnteringRoom.AsOwner }});
}
</script>

<template>
  <div class="main-div">
    <h1>Santorini</h1>
    <div class="button-container">
      <ButtonComponent :text="'Play against AI'" :action="aiGameLink"/>
      <ButtonComponent :text="'Create multiplayer room'" :action="loginAsOwner"/>
      <!-- <ButtonComponent :text="'Join room'" :action="loginAsGuest"/> -->
    </div>
  </div>
</template>

<style scoped lang="scss">
  .main-div {
    margin: 0 auto;
    width: fit-content;
    
    display: flex;
    flex-direction: column;
    justify-content: center;

    h1 {
      text-align: center;
    }
}
  .button-container {
    display: flex;
    flex-direction: column;
  }
</style>
