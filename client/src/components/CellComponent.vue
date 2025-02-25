<script setup lang="ts">
import type { Coord } from "@/Utilities";
import type { PropType } from "vue";

const props = defineProps({
  coord: {
    type: Object as PropType<Coord>,
    required: true,
  },
  content: String,
});

const emit = defineEmits(["dragStart", "dragEnd"]);

function dragStart(e: MouseEvent) {
  if (e.target && e.target instanceof HTMLElement && e.target.parentElement) {
    const originalPos = e.target.parentElement.getBoundingClientRect();
    emit(
      "dragStart",
      e.target,
      { y: props.coord.y, x: props.coord.x },
      { x: originalPos.left, y: originalPos.top },
      { x: e.clientX, y: e.clientY },
      originalPos.width
    );
  }
}

function dragEnd(e: MouseEvent) {
  emit("dragEnd", { y: props.coord.y, x: props.coord.x });
}
</script>

<template>
  <div
    class="cell"
    :id="`${props.coord.y}_${props.coord.x}`"
    :class="{
      'building-1': props.content && props.content[1] === '1',
      'building-2': props.content && props.content[1] === '2',
      'building-3': props.content && props.content[1] === '3',
      'building-4': props.content && props.content[1] === '4',
    }"
    @mouseup="dragEnd"
  >
    <img
      class="pawn"
      v-if="props.content && props.content[0] !== '0'"
      :src="`/assets/players/${props.content[0]}.png`"
      @mousedown="dragStart"
      @dragstart.prevent=""
    />
  </div>
</template>

<style scoped>
.cell {
  width: min(10vh, 10vw);
  height: min(10vh, 10vw);

  /* background-color: rgb(240, 236, 225); */
  background-color: rgb(202, 255, 198);
  border: 1px solid rgb(100, 100, 100);
  box-sizing: border-box;

  background-size: cover;
}

@media only screen and (orientation: portrait) {
  .cell {
    width: 15vw;
    height: 15vw;
  }
}

.cell > img {
  width: 100%;
}

.building-1 {
  background-image: url("/assets/buildings/1.png");
}
.building-2 {
  background-image: url("/assets/buildings/2.png");
}
.building-3 {
  background-image: url("/assets/buildings/3.png");
}
.building-4 {
  background-image: url("/assets/buildings/4.png");
}

.cell > .pawn:hover {
  cursor: grab;
}

.cell > .pawn:active {
  cursor: grabbing;
}
</style>
