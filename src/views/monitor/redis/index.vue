<template>
  <div class="p-4">
    <a-card>
      <!-- Redis 信息实时监控 -->
      <a-row :gutter="8">
        <a-col :sm="24" :xl="12">
          <div ref="chartRef" style="width: 100%; height: 300px"></div>
        </a-col>
        <a-col :sm="24" :xl="12">
          <div ref="chartRef2" style="width: 100%; height: 300px"></div>
        </a-col>
      </a-row>
    </a-card>

    <BasicTable @register="registerTable" :api="getInfo"></BasicTable>
  </div>
</template>
<script lang="ts" name="monitor-redis" setup>
  import { onMounted, ref, reactive, Ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getInfo, getRedisInfo } from './redis.api';
  import dayjs from 'dayjs';
  import { columns } from './redis.data';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useECharts } from '/@/hooks/web/useECharts';

  const dataSource = ref([]);
  const chartRef = ref<HTMLDivElement | null>(null);
  const chartRef2 = ref<HTMLDivElement | null>(null);
  const { setOptions, echarts } = useECharts(chartRef as Ref<HTMLDivElement>);
  const { setOptions: setOptions2, echarts: echarts2 } = useECharts(chartRef2 as Ref<HTMLDivElement>);
  const loading = ref(false);
  let timer = null;
  const { createMessage } = useMessage();
  const key = reactive({
    title: {
      text: 'Redis Key 实时数量（个）',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [],
        type: 'line',
        areaStyle: {
          color: '#ff6987',
        },
        lineStyle: {
          color: '#dc143c',
          width: 10,
          type: 'solid',
        },
      },
    ],
  });
  const memory = reactive({
    title: {
      text: 'Redis 内存实时占用情况（KB）',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [],
        type: 'line',
        areaStyle: {
          color: '#74bcff',
        },
        lineStyle: {
          color: '#1890ff',
          width: 10,
          type: 'solid',
        },
      },
    ],
  });

  const [registerTable, { reload }] = useTable({
    columns,
    showIndexColumn: false,
    pagination: false,
    bordered: true,
  });

  // 获取一组数据中最大和最小的值
  function getMaxAndMin(dataSource, field) {
    let maxValue = null,
      minValue = null;
    dataSource.forEach((item) => {
      let value = Number.parseInt(item[field]);
      // max
      if (maxValue == null) {
        maxValue = value;
      } else if (value > maxValue) {
        maxValue = value;
      }
      // min
      if (minValue == null) {
        minValue = value;
      } else if (value < minValue) {
        minValue = value;
      }
    });
    return [maxValue, minValue];
  }

  function loadRedisInfo() {
    getInfo().then((res) => {
      dataSource.value = res.result;
    });
  }

  function initCharts() {
    setOptions(memory);
    setOptions2(key);
  }

  /** 开启定时器 */
  function openTimer() {
    loadData();
    closeTimer();
    timer = setInterval(() => {
      loadData();
    }, 5000);
  }

  /** 关闭定时器 */
  function closeTimer() {
    if (timer) clearInterval(timer);
  }

  function loadData() {
    getRedisInfo()
      .then((res) => {
        let time = dayjs().format('hh:mm:ss');
        let [{ dbSize: currentSize }, memoryInfo] = res;
        let currentMemory = memoryInfo.used_memory / 1000;
        // push 数据
        key.xAxis.data.push(time);
        key.series[0].data.push(currentSize);
        memory.xAxis.data.push(time);
        memory.series[0].data.push(currentMemory);
        // 最大长度为6
        if (key.series[0].data.length > 6) {
          key.xAxis.data.splice(0, 1);
          key.series[0].data.splice(0, 1);
          memory.xAxis.data.splice(0, 1);
          memory.series[0].data.splice(0, 1);
        }
        setOptions(memory, false);
        setOptions2(key, false);

        // 计算 Key 最大最小值
        //let keyPole = getMaxAndMin(key.dataSource, 'y');
        //key.max = Math.floor(keyPole[0]) + 10;
        //key.min = Math.floor(keyPole[1]) - 10;
        //if (key.min < 0) this.key.min = 0;

        // 计算 Memory 最大最小值
        //let memoryPole = getMaxAndMin(memory.dataSource, 'y');
        //memory.max = Math.floor(memoryPole[0]) + 100;
        //memory.min = Math.floor(memoryPole[1]) - 100;
        //if (memory.min < 0) memory.min = 0;
      })
      .catch((e) => {
        //closeTimer()
      });
  }

  onMounted(() => {
    initCharts();
    openTimer();
    setTimeout(() => {
      loadData();
    }, 1000);
  });
</script>
