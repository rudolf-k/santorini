<script setup lang="ts">
import { useRouter } from 'vue-router';

import ButtonComponent from '@/components/ButtonComponent.vue';
import Board from "@/components/BoardComponent.vue";
import { ref } from 'vue';

const router = useRouter()

const selectedAi = ref(0);
const gameStarted = ref(false);

function updateSelect(value: number) {
	selectedAi.value = value;
}

function startGame() {
	gameStarted.value = true;
}

</script>

<template>
	<div class="main-div">
		<div class="start-div" v-if="gameStarted === false">
			<h1>Choose the AI agent implementation: </h1>
			<div class="options-radio">
					<label for="minimax" class="l-radio">
							<input type="radio" id="minimax" name="selector" :value="0" @click="updateSelect(0)" :checked="selectedAi === 0">
							<span>Minimax</span>
					</label>
					<label for="mcts" class="l-radio">
							<input type="radio" id="mcts" name="selector" :value="1" @click="updateSelect(1)" :checked="selectedAi === 1">
							<span>Monte Carlo Tree Search</span>
					</label>
			</div>
			<div class="button-div">
				<ButtonComponent :text="'Start Game'" :action="startGame"/>
			</div>
		</div>
		<Board v-else :gameMode="selectedAi"/>
	</div>
</template>

<style scoped lang="scss">
.main-div {
  font-family: "League Spartan";
  font-size: 18px;

  margin: 0 auto;
  width: fit-content;
  
  display: flex;
  flex-direction: column;
  justify-content: center;
	align-items: center;

  h1 {
    text-align: center;
  }

  .options-radio {
		width: fit-content;
    margin: 18px auto;
    display: flex;
    flex-direction: column;

    $primary: #5551ff;
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
	.button-div {
		display: flex;
		justify-content: center;
	}
}
</style>
