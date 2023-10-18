import type { App } from 'vue';
import { registerJVxeTable } from '/@/components/jeecg/JVxeTable';
import { registerJVxeCustom } from '/@/components/JVxeCustom';

// 注册全局聊天表情包
import { Picker } from 'emoji-mart-vue-fast/src';
// 注册全局dayjs
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';

export async function registerThirdComp(app: App) {
  //---------------------------------------------------------------------
  // 注册 JVxeTable 组件
  registerJVxeTable(app);
  // 注册 JVxeTable 自定义组件
  await registerJVxeCustom();
  //---------------------------------------------------------------------
  // 注册全局聊天表情包
  app.component('Picker', Picker);
  
  //---------------------------------------------------------------------
  // 注册全局dayjs
  dayjs.locale('zh-cn');
  dayjs.extend(relativeTime);
  dayjs.extend(customParseFormat);
  app.config.globalProperties.$dayjs = dayjs
  app.provide('$dayjs', dayjs)
  //---------------------------------------------------------------------
}
