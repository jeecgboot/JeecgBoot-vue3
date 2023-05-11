<template>
  <ConfigProvider :locale="getAntdLocale">
    <AppProvider>
      <RouterView />
    </AppProvider>
  </ConfigProvider>
</template>

<script lang="ts" setup>
  // import { defineComponent, computed, ref } from 'vue';
  import { ConfigProvider } from 'ant-design-vue';
  import { AppProvider } from '/@/components/Application';
  import { useTitle } from '/@/hooks/web/useTitle';
  import { useLocale } from '/@/locales/useLocale';
  import { useUserStore } from '/@/store/modules/user';
  import { useWatermark } from '/@/hooks/web/useWatermark';

  // 解决日期时间国际化问题
  import 'dayjs/locale/zh-cn';
  // support Multi-language
  const { getAntdLocale } = useLocale();
  const { setWatermark } = useWatermark();
  const userStore = useUserStore();
  // const getUserInfo = computed(() => {
  //   const { realname = '' } = userStore.getUserInfo || {};
  //   return { realname };
  // });
  setWatermark(userStore.getUserInfo.realname + '(' + userStore.getUserInfo.workNo + ')');
  useTitle();
</script>
