<script setup lang="ts">
import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { socket, state } from "@/socket";

import ButtonComponent from '@/components/ButtonComponent.vue';
import Board from "@/components/BoardComponent.vue";
import { GameMode } from '@/Utilities';

const props = defineProps({
  roomId: String,
});

const router = useRouter()


if (!socket.connected) {
  router.push({name: "login", params: { roomToJoin: props.roomId }});
}

function startGame() {
  socket.emit("start-game", state.room.roomId);
}

function joinTeam(teamIndex: number, indexInTeam: number) {
  socket.emit("join-team", teamIndex, indexInTeam);
}

</script>

<template>
  <div class="main-div">
    <h1 v-if="state.room.gameStarted === false">Room {{ props.roomId }} </h1>
    <div class="start-div" v-if="state.room.gameStarted === false">
      <div class="player-list">
        <div class="team" v-for="t, i in state.room.teams">
          <h2>{{ `Team ${i+1}:` }}</h2>
          <div class="player-slot" v-for="player, j in t">
            <span v-if="player" >{{ player }}</span>
            <div v-else class="plus-icon-div" @click="joinTeam(i, j)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6L15 12L9 18" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <ButtonComponent :text="'Start Game'" :action="startGame" v-if="socket.id === props.roomId" />
    </div>
    <Board v-else :gameMode="GameMode.Online"/>
  </div>
</template>

<style scoped lang="scss">
  .player-slot {
    font-family: "League Spartan";
    font-size: 22px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    // align-items: center;

    margin-bottom: 10px;
    height: 38px;
    width: 250px;
    border: 2px solid black;
    border-radius: 20px;
    padding: 10px;

    span {
      margin-left: 10px;
    }

    .plus-icon-div {
      position: relative;

      display: flex;
      justify-content: center;

      &:hover {
        cursor: pointer;
      }

      &:hover svg {
        background-color: #159415;
        path {
          stroke: white;
        }
      }

      svg {
        margin: 0px;
        border: 2px solid black;
        border-radius: 999999999999px;
        padding: 5px;

        transition: background-color 0.2s;

        path {
          transition: fill 0.2s;
        }
      }
    }
  }

  .main-div {
    margin: 0 auto;
    width: fit-content;
    
    display: flex;
    flex-direction: column;
    justify-content: center;

    .start-div {
      display: flex;
      flex-direction: column;
    }

    h1 {
      text-align: center;
    }

    .player-list {
      margin-bottom: 25px;
    }
}
  .button-container {
    display: flex;
    flex-direction: column;
  }
</style>
