<script setup>
import SampleOne from './components/practices/basic/SampleOne.vue'
import SampleTwo from './components/practices/basic/SampleTwo.vue'
import ClassBinding from './components/practices/basic/class-binding.vue'
import StyleBinding from './components/practices/basic/style-binding.vue'
import Shorthand from './components/practices/basic/v-bind-shorthand.vue'
import VHtml from './components/practices/basic/v-html.vue'
import VHtmlXss from './components/practices/basic/v-html-xss.vue'
import VText from './components/practices/basic/v-text.vue'
import VBind from './components/practices/basic/v-bind.vue'
import VIf from './components/practices/basic/v-if.vue'
import VShow from './components/practices/basic/v-show.vue'
import VPre from './components/practices/basic/v-pre.vue'
import VFor from './components/practices/basic/v-for.vue'
import VCloak from './components/practices/basic/v-cloak.vue'
import VOnce from './components/practices/basic/v-once.vue'
import VMemo from './components/practices/basic/v-memo.vue'
import VOn from './components/practices/basic/v-on.vue'
import EventObject from './components/practices/basic/event-object.vue'
import EventModifiers from './components/practices/basic/event-modifiers.vue'
import VModel from './components/practices/basic/v-model.vue'
import VModelModifiers from './components/practices/basic/v-model-modifiers.vue'
import VueStyle from './components/practices/basic/vue-style.vue'
import RefExample from './components/practices/basic/ref.vue'
import ReactiveExample from './components/practices/basic/reactive.vue'
</script>

<template>
  <div style="padding: 20px">
    <SampleOne />
    <SampleTwo />
    <VHtml />
    <VHtmlXss />
    <VText />
    <VBind />
    <ClassBinding />
    <StyleBinding />
    <Shorthand />
    <VIf />
    <VShow />
    <VFor />
    <VPre />
    <VCloak />
    <VOnce />
    <VMemo />
    <VOn />
    <EventObject />
    <EventModifiers />
    <VModel />
    <VModelModifiers />
    <VueStyle />
    <RefExample />
    <ReactiveExample />
  </div>
</template>



<style>
@import '@/assets/practice.css';
</style>