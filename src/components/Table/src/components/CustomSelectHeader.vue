<!-- 自定义选择列，表头实现部分 -->
<template>
  <template v-if="isRadio">
    <!-- radio不存在全选，所以放个空标签 -->
    <span></span>
  </template>
  <a-checkbox :disabled="disabled" v-else :checked="checked" :indeterminate="isHalf" @update:checked="onChange" />
</template>
<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps({
    isRadio: {
      type: Boolean,
      required: true,
    },
    selectedLength: {
      type: Number,
      required: true,
    },
    // 当前页条目数
    pageSize: {
      type: Number,
      required: true,
    },
    // update-begin--author:liaozhiyang---date:20231016---for：【QQYUN-6774】解决checkbox禁用后全选仍能勾选问题
    disabled: {
      type: Boolean,
      required: true,
    },
    // update-end--author:liaozhiyang---date:20231016---for：【QQYUN-6774】解决checkbox禁用后全选仍能勾选问题
  });
  const emit = defineEmits(['select-all']);

  // 是否全选
  const checked = computed(() => {
    if (props.isRadio) {
      return false;
    }
    return props.selectedLength > 0 && props.selectedLength >= props.pageSize;
  });

  // 是否半选
  const isHalf = computed(() => {
    if (props.isRadio) {
      return false;
    }
    return props.selectedLength > 0 && props.selectedLength < props.pageSize;
  });

  function onChange(checked: boolean) {
    emit('select-all', checked);
  }
</script>

<style scoped lang="scss"></style>
