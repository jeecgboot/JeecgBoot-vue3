<template>
  <div class="p-4">
    <BasicTable @register="registerTable" :dataSource="dataSource">
      <template #tableTitle>
        <div slot="message">
          共追踪到 {{ dataSource.length }} 条近期HTTP请求记录
          <a-divider type="vertical" />
          <a @click="loadDate">立即刷新</a>
        </div>
      </template>

    </BasicTable>
  </div>
</template>
<script lang="ts" name="monitor-trace" setup>
  import { onMounted, ref, reactive } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getActuatorList } from './trace.api';
  import { columns } from './trace.data';
  import { useMessage } from '/@/hooks/web/useMessage';

  const dataSource = ref([]);
  const { createMessage } = useMessage();

  const [registerTable, { reload }] = useTable({
    columns,
    showIndexColumn: false,
    bordered: true,
    rowKey: 'id',
  });

  function loadDate() {
    getActuatorList().then((res) => {
      let filterData = [];
      for (let d of res.traces) {
        if (d.request.method !== 'OPTIONS' && d.request.uri.indexOf('httptrace') === -1) {
          filterData.push(d);
        }
      }
      dataSource.value = filterData;
    });
  }

  onMounted(() => {
    loadDate();
  });
</script>
