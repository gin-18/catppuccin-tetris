<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { emitter } from "@/assets/js/emitter.js";

const keys = ref({
  play: "i",
  hard_drop: " ",
  soft_drop: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  rotate_right: "ArrowUp",
  rotate_left: "z",
  rotate_reverse: "a",
  hold: "c",
});

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keyup", handleKeyUp);
});

function handleKeyDown(e) {
  switch (e.key) {
    case keys.value.play:
      emitter.emit("play");
      break;
    case keys.value.left:
      emitter.emit("left");
      break;
    case keys.value.right:
      emitter.emit("right");
      break;
    case keys.value.hard_drop:
      emitter.emit("hardDrop");
      break;
    case keys.value.soft_drop:
      emitter.emit("softDrop", true);
      break;
    case keys.value.rotate_right:
      emitter.emit("rotateRight");
      break;
    case keys.value.rotate_left:
      emitter.emit("rotateLeft");
      break;
    case keys.value.rotate_reverse:
      emitter.emit("rotateReverse");
      break;
    case keys.value.hold:
      emitter.emit("hold");
      break;
  }
}

function handleKeyUp(e) {
  if (e.key === keys.value.soft_drop) {
    emitter.emit("softDrop", false);
  }
}
</script>

<!-- TODO: option -->
<template></template>
