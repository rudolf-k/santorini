<script setup lang="ts">
import Cell from "@/components/CellComponent.vue";
import { useGameState } from "@/stores/gameState";
import { GameStage, type Coord, type Piece, GameMode } from "@/Utilities";
import { ref, watch, type Ref, type PropType } from "vue";

import { socket, state } from "@/socket";

const props = defineProps({
  gameMode: Number as PropType<GameMode>,
});

const gameState = useGameState();

if (props.gameMode === GameMode.Online) {
  if (state.room.initData) {
    gameState.initialiseOnlineGame(state.room.initData);
  } else {
    watch(() => state.room.initData, (initUpdate) => {
      gameState.initialiseOnlineGame(initUpdate);
    });
  }

  watch(() => state.room.gameState, (stateUpdate) => {
    gameState.updateGameState(stateUpdate);
  });
}

const movingPiece: Ref<Piece | null> = ref(null);

function onCellClick(row: number, col: number) {
  if (gameState.gameStage === GameStage.Spawn) {
    gameState.spawnPawn(row, col, props.gameMode);
  } else if (gameState.gameStage === GameStage.Build) {
    if (movingPiece.value?.destinationCell) {
      if (gameState.build({ y: row, x: col }, movingPiece.value.destinationCell, props.gameMode)) {
        movingPiece.value = null
      }
    }
  }
}

function dragStart(img: HTMLElement, cell: Coord, pos: Coord, mousePos: Coord, cellSize: number) {
  if (gameState.gameStage === GameStage.End) {
    return;
  }
  if (img) {
    if (movingPiece.value?.destinationCell) {
      return
    }

    movingPiece.value = {
      pieceHtml: img,
      originalCell: cell,
      originalPos: pos,
      destinationCell: null,
    };
    
    movingPiece.value.pieceHtml.style.left = `${mousePos.x - cellSize / 2}px`;
    movingPiece.value.pieceHtml.style.top = `${mousePos.y - cellSize / 2}px`;
    movingPiece.value.pieceHtml.style.position = "fixed";
    movingPiece.value.pieceHtml.style.width = `${cellSize}px`;
    movingPiece.value.pieceHtml.style.height = `${cellSize}px`;
    movingPiece.value.pieceHtml.style.pointerEvents = "none";
  }
}

function dragMove(e: MouseEvent) {
  if (movingPiece.value) {
    const cellSize = Math.min(window.innerWidth, window.innerHeight) / 10;
    movingPiece.value.pieceHtml.style.left = `${e.clientX - cellSize / 2}px`;
    movingPiece.value.pieceHtml.style.top = `${e.clientY - cellSize / 2}px`;
  }
}

function dragEnd(targetCell: Coord) {
  if (movingPiece.value && movingPiece.value.destinationCell == null) {
    if (
      targetCell.y === movingPiece.value.originalCell.y &&
      targetCell.x === movingPiece.value.originalCell.x
    ) {
      resetPiece();
      movingPiece.value = null;
      return;
    }

    if (!gameState.makeMove(movingPiece.value.originalCell, targetCell, props.gameMode)) {
      resetPiece();
      movingPiece.value = null;
      return
    }
    movingPiece.value.destinationCell = targetCell;
  }
}

function resetPiece() {
  if (movingPiece.value) {
    movingPiece.value.pieceHtml.style.left = `${movingPiece.value.originalPos.x}px`;
    movingPiece.value.pieceHtml.style.top = `${movingPiece.value.originalPos.y}px`;
    movingPiece.value.pieceHtml.style.pointerEvents = "auto";
  }
}

window.addEventListener("mouseup", () => {
  if (movingPiece.value && movingPiece.value.destinationCell == null) {
    resetPiece();
    movingPiece.value = null;
  }
});
</script>

<template>
  <div class="board-component">
    <div id="board" @mousemove="dragMove">
      <Cell
        v-for="c in gameState.boardAsList"
        :key="`${c.y}_${c.x}`"
        :coord="{ x: c.x, y: c.y }"
        :content="c.content"
        @click="onCellClick(c.y, c.x)"
        @dragStart="dragStart"
        @dragEnd="dragEnd"
      />
    </div>
    <h3>{{ gameState.gameStateMessage }}</h3>
  </div>
</template>

<style>
#board {
  margin-top: 5vh;

  display: grid;
  grid-template-columns: repeat(5, min(10vh, 10vw));
  grid-template-rows: repeat(5, min(10vh, 10vw));

  border: 1px solid rgb(100, 100, 100);
}

@media only screen and (orientation: portrait) {
  #board {
    grid-template-columns: repeat(5, 15vw);
    grid-template-rows: repeat(5, 15vw);
  }
}
</style>
