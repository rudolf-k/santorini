<script setup lang="ts">
import { useRouter } from 'vue-router';
import { socket, state } from "@/socket";
import { ref, watch, type PropType } from 'vue';
import ButtonComponent from '@/components/ButtonComponent.vue';
import { EnteringRoom } from '@/Utilities';

const props = defineProps({
  roomToJoin: String,
});

const router = useRouter()

const username = ref("");
const playerCount = ref(2);

state.room.roomId = undefined;

function onInput(e: Event) {
  const target = (<HTMLInputElement>e.target)
  if (e.target) {
    username.value = target.value;
  }
}

function updateSelect(value: number) {
  playerCount.value = value;
}

watch(() => state.room.roomId, (newRoomId) => {
  if (newRoomId) {
    console.log(newRoomId);
    router.push("/room/" + newRoomId);
  }
});

function onConfirm() {
  if (username.value.length >= 1 && username.value.length <= 16) {
    socket.auth = { username: username.value }
    socket.connect();

    if (props.roomToJoin === EnteringRoom.AsOwner) {
      if ([2, 3, 4].includes(playerCount.value)) {
        socket.emit("new-room", playerCount.value);
      }
    } else {
      socket.emit("join-room", props.roomToJoin);
    }
  }
}

</script>

<template>
  <div class="main-div">
    <h1>Choose a username:</h1>
    <input :value="username" @input="onInput" class="basic-input" />
    <div class="players-radio" v-if="props.roomToJoin === EnteringRoom.AsOwner">
      <label for="2-player" class="l-radio">
        <input type="radio" id="2-player" name="selector" :value="2" @click="updateSelect(2)" :checked="playerCount === 2">
        <span>2 players</span>
      </label>
      <label for="3-player" class="l-radio">
        <input type="radio" id="3-player" name="selector" :value="3" @click="updateSelect(3)" :checked="playerCount === 3">
        <span>3 players</span>
      </label>
      <label for="4-player" class="l-radio">
        <input type="radio" id="4-player" name="selector" :value="4" @click="updateSelect(4)" :checked="playerCount === 4">
        <span>4 players</span>
      </label>
    </div>
    <ButtonComponent :text="'Confirm'" :action="onConfirm" />
  </div>
</template>

<style scoped lang="scss">
@mixin flex-column {
  display: flex;
  flex-direction: column;
}

$select-color: #5551ff;

.main-div {
  font-family: "League Spartan";
  font-size: 18px;

  margin: 0 auto;
  width: fit-content;
  
  @include flex-column;
  justify-content: center;

  h1 {
    text-align: center;
  }
  .basic-input {
    border: 3px solid #000;
    border-radius: 5px;
    height: 50px;
    line-height: normal;
    color: #282828;
    display: block;
    width: 100%;
    box-sizing: border-box;
    user-select: auto;
    font-size: 16px;
    padding: 0 6px;
    padding-left: 12px;
    &:focus{
        border: 3px solid $select-color;
    }
  }

  .players-radio {
    @include flex-column;
    margin: 18px 0px;
    align-items: center;

    $primary: $select-color;
    $seconday: #9F9F9F;
    .l-radio {
      padding: 6px;
      border-radius: 50px;
      display: inline-flex;
      cursor: pointer;
      transition: background .2s ease;
      -webkit-tap-highlight-color: transparent;
      
      &:hover, &:focus-within {
        background: rgba($seconday,.1)
      }
      
      input {
        vertical-align: middle;
        width: 20px;
        height: 20px;
        border-radius: 10px;
        background: none;
        border: 0;
        box-shadow: inset 0 0 0 1px $seconday;
        box-shadow: inset 0 0 0 1.5px $seconday;
        appearance: none;
        padding: 0;
        margin: 0;
        transition: box-shadow 150ms cubic-bezier(.95,.15,.5,1.25);
        pointer-events: none;
      
        &:focus {
          outline: none;
        }
        
        &:checked {
          box-shadow: inset 0 0 0 6px $primary
        }
      }
        
      span {
        vertical-align: middle;
        display: inline-block;
        line-height: 20px;
        padding: 0 8px;
      }
    }
  }
}

</style>
