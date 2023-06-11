<script setup lang="ts">

</script>

<template>
  <div class="main-div">
    <h1>How to play?</h1>
    <div class="rule-point">
        <div class="rule-text">
            <h3>Goal</h3>
            <p>The goal of the game is to either climb on the top of a level 3 building, or to get the other player(s) into a position in which they can't make a move.</p>
        </div>
    </div>
    <div class="rule-point">
        <div class="rule-text">
            <h3>Moving</h3>
            <p>When it's your turn, you can move with a pawn into any of the directly adjacent pawn-free cells which are on the same level, any number of levels lower or up to 1 level higher if it's not domed (level 4).</p>
        </div>
        <img src="/assets/other/move.gif" />
    </div>
    <div class="rule-point">
        <div class="rule-text">
            <h3>... and Building</h3>
            <p>After your move is performed, you finish your turn by building. You can build on any pawn-free cell adjacent to the spot you've just moved to, if the building on it has not reached the maximum height of 4 levels.</p>
        </div>
        <img src="/assets/other/build.gif" />
    </div>
    <div class="rule-point">
        <div class="rule-text">
            <h3>Tips</h3>
            <p>Look out for players close to level 3 buildings, make sure to be close enough to block them by building a dome on those cells. Try to limit the moves your opponent can make, maybe you can get them stuck. And most importantly, have fun! :)</p>
        </div>
        <img src="/assets/other/tips.gif" />
    </div>
  </div>
</template>

<style lang="scss">
body {
    overscroll-behavior: auto;
}
body, html {
    overflow: auto;
}
.main-div {
    font-family: "League Spartan";
    // font-size: 28px;

    margin: 0 auto;
    width: fit-content;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    h1 {
        text-align: center;
    }

    .rule-point {
        width: 60%;
        font-size: 18px;

        display: flex;

        h3 {
            font-size: 28px;
        }
    }
}
@media only screen and (orientation: portrait) {
    .rule-point {
        flex-direction: column;
    }
}
</style>
