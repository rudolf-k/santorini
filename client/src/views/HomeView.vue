<script setup lang="ts">
import { EnteringRoom } from '@/Utilities';
import ButtonComponent from '@/components/ButtonComponent.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

function aiGameLink() {
  router.push("/ai-game");
}

function loginAsOwner() {
  router.push({name: "login", params: { roomToJoin: EnteringRoom.AsOwner }});
}

function rulesLink() {
  router.push("/rules");
}
</script>

<template>
  <div class="main-div">
    <h1>Santorini</h1>
    <div class="button-container">
      <ButtonComponent :text="'Play against the AI'" :action="aiGameLink"/>
      <ButtonComponent :text="'Create multiplayer room'" :action="loginAsOwner"/>
      
      <span href="/rules" @click="rulesLink">How to play?</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .main-div {
    font-family: "League Spartan";
    font-size: 28px;

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
    
    .menu-button {
      width: 100%;
    }
    align-items: center;
    text-align: center;
    span {
      width: fit-content;
      padding: 0px 15px 0px 15px;
      margin-top: 15px;
      color: cornflowerblue;
      font-size: 24px;
      text-decoration: none;

      &:hover {
        border-radius: 15px;
        background-color: cornflowerblue;
        color: white;

        cursor: pointer;
      }
    }
  }
</style>
