<template>
  <!-- <div v-html="getHtmlData" :class="$props.class" class="markdown-viewer markdown-body"></div> -->
  <!-- update-begin--author:liaozhiyang---date:20231201---for：【issues/872】MarkdownViewer组件无样式 -->
  <div v-html="getHtmlData" :class="$props.class" class="markdown-viewer vditor-reset"></div>
  <!-- update-begin--author:liaozhiyang---date:20231201---for：【issues/872】MarkdownViewer组件无样式 -->
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import showdown from 'showdown';
  import 'vditor/dist/index.css';
  const converter = new showdown.Converter();
  converter.setOption('tables', true);
  const props = defineProps({
    value: { type: String },
    class: { type: String },
  });
  const getHtmlData = computed(() => converter.makeHtml(props.value || ''));
</script>

<style scoped>
  .markdown-viewer {
    width: 100%;
  }
</style>
