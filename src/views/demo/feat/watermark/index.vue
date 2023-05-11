<template>
  <PageWrapper title="水印示例">
    <CollapseContainer class="w-full h-32 bg-white rounded-md" title="Global WaterMark">
      <a-button type="primary" class="mr-2" @click="setWatermark(`${getUserInfo.realname}`)"> Create </a-button>
      <a-button color="error" class="mr-2" @click="clear"> Clear </a-button>
      <a-button color="warning" class="mr-2" @click="setWatermark('WaterMark Info New')"> Reset </a-button>
    </CollapseContainer>
  </PageWrapper>
</template>
<script lang="ts">
  import { defineComponent,computed, ref } from 'vue';
  import { CollapseContainer } from '/@/components/Container/index';
  import { useWatermark } from '/@/hooks/web/useWatermark';
  import { PageWrapper } from '/@/components/Page';
  import { useUserStore } from '/@/store/modules/user';

  export default defineComponent({
    components: { CollapseContainer, PageWrapper },
    setup() {
      const areaRef = ref<Nullable<HTMLElement>>(null);
      const { setWatermark, clear } = useWatermark();
      const userStore = useUserStore();
      const getUserInfo = computed(() => {
        const { realname = '' } = userStore.getUserInfo || {};
        return { realname };
      });
      return {
        setWatermark,
        clear,
        areaRef,
        getUserInfo
      };
    },
  });
</script>
