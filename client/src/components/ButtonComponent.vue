<script setup lang="ts">
const props = defineProps({
  text: String,
  action: Function,
});

function doAction() {
  if (typeof props.action != 'undefined')
    props.action()
}

</script>

<template>
  <button class="menu-button" @click="doAction">{{ text }}</button>
</template>

<style scoped lang="scss">
.menu-button {
  font-family: "League Spartan";
  font-size: 18px;

  display: inline-block;
  outline: none;
  cursor: pointer;
  line-height: 1;
  border-radius: 500px;
  transition-property: background-color,border-color,color,box-shadow,filter;
  transition-duration: .3s;
  border: 1px solid black;
  letter-spacing: 2px;
  min-width: 160px;
  // text-transform: uppercase;
  white-space: normal;
  font-weight: 700;
  text-align: center;
  padding: 17px 48px;
  color: #141414;
  background-color: #fff5de;
  height: 48px;

  &:hover{
      transform: scale(1.04);
  }

  margin: 10px 0px;
}
</style>
