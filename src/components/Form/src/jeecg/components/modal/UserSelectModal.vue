<!--用户选择框-->
<template>
  <div>
    <BasicModal
      v-bind="$attrs"
      @register="register"
      :title="modalTitle"
      width="900px"
      wrapClassName="j-user-select-modal"
      @ok="handleOk"
      destroyOnClose
      @visible-change="visibleChange"
    >
      <a-row>
        <a-col :span="showSelected ? 18 : 24">
          <BasicTable
            ref="tableRef"
            :columns="columns"
            :scroll="tableScroll"
            v-bind="getBindValue"
            :useSearchForm="true"
            :formConfig="formConfig"
            :api="getUserList"
            :searchInfo="searchInfo"
            :rowSelection="rowSelection"
            :indexColumnProps="indexColumnProps"
          >
            <!-- update-begin-author:taoyan date:2022-5-25 for: VUEN-1112一对多 用户选择 未显示选择条数，及清空 -->
            <template #tableTitle></template>
            <!-- update-end-author:taoyan date:2022-5-25 for: VUEN-1112一对多 用户选择 未显示选择条数，及清空 -->
          </BasicTable>
        </a-col>
        <a-col :span="showSelected ? 6 : 0">
          <BasicTable
            v-bind="selectedTable"
            :dataSource="selectRows"
            :useSearchForm="true"
            :formConfig="{ showActionButtonGroup: false, baseRowStyle: { minHeight: '40px' } }"
          >
            <!--操作栏-->
            <template #action="{ record }">
              <a href="javascript:void(0)" @click="handleDeleteSelected(record)"><Icon icon="ant-design:delete-outlined"></Icon></a>
            </template>
          </BasicTable>
        </a-col>
      </a-row>
    </BasicModal>
  </div>
</template>
<script lang="ts">
  import { defineComponent, unref, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getUserList } from '/@/api/common/api';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { useSelectBiz } from '/@/components/Form/src/jeecg/hooks/useSelectBiz';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { selectProps } from '/@/components/Form/src/jeecg/props/props';

  export default defineComponent({
    name: 'UserSelectModal',
    components: {
      //此处需要异步加载BasicTable
      BasicModal,
      BasicTable: createAsyncComponent(() => import('/@/components/Table/src/BasicTable.vue'), {
        loading: true,
      }),
    },
    props: {
      ...selectProps,
      //选择框标题
      modalTitle: {
        type: String,
        default: '选择用户',
      },
    },
    emits: ['register', 'getSelectResult'],
    setup(props, { emit, refs }) {
      // update-begin-author:taoyan date:2022-5-24 for: VUEN-1086 【移动端】用户选择 查询按钮 效果不好 列表展示没有滚动条
      const tableScroll = ref<any>({ x: false });
      const tableRef = ref();
      //注册弹框
      const [register, { closeModal }] = useModalInner(() => {
        if (window.innerWidth < 900) {
          tableScroll.value = { x: 900 };
        } else {
          tableScroll.value = { x: false };
        }
        //update-begin-author:taoyan date:2022-6-2 for: VUEN-1112 一对多 用户选择 未显示选择条数，及清空
        setTimeout(() => {
          if (tableRef.value) {
            tableRef.value.setSelectedRowKeys(selectValues['value'] || []);
          }
        }, 800);
        //update-end-author:taoyan date:2022-6-2 for: VUEN-1112 一对多 用户选择 未显示选择条数，及清空
      });
      // update-end-author:taoyan date:2022-5-24 for: VUEN-1086 【移动端】用户选择 查询按钮 效果不好 列表展示没有滚动条
      const attrs = useAttrs();
      //表格配置
      const config = {
        canResize: false,
        bordered: true,
        size: 'small',
      };
      const getBindValue = Object.assign({}, unref(props), unref(attrs), config);
      const [{ rowSelection, visibleChange, selectValues, indexColumnProps, getSelectResult, handleDeleteSelected, selectRows }] = useSelectBiz(
        getUserList,
        getBindValue
      );
      const searchInfo = ref(props.params);
      //查询form
      const formConfig = {
        baseColProps: {
          xs: 24,
          sm: 8,
          md: 6,
          lg: 8,
          xl: 6,
          xxl: 6,
        },
        //update-begin-author:taoyan date:2022-5-24 for: VUEN-1086 【移动端】用户选择 查询按钮 效果不好 列表展示没有滚动条---查询表单按钮的栅格布局和表单的保持一致
        actionColOptions: {
          xs: 24,
          sm: 8,
          md: 8,
          lg: 8,
          xl: 8,
          xxl: 8,
        },
        //update-end-author:taoyan date:2022-5-24 for: VUEN-1086 【移动端】用户选择 查询按钮 效果不好 列表展示没有滚动条---查询表单按钮的栅格布局和表单的保持一致
        schemas: [
          {
            label: '账号',
            field: 'username',
            component: 'JInput',
          },
          {
            label: '姓名',
            field: 'realname',
            component: 'JInput',
          },
        ],
      };
      //定义表格列
      const columns = [
        {
          title: '用户账号',
          dataIndex: 'username',
          width: 40,
          align: 'left',
        },
        {
          title: '用户姓名',
          dataIndex: 'realname',
          width: 40,
        },
        {
          title: '性别',
          dataIndex: 'sex_dictText',
          width: 20,
        },
        {
          title: '手机号码',
          dataIndex: 'phone',
          width: 30,
        },
        {
          title: '邮箱',
          dataIndex: 'email',
          width: 40,
        },
        {
          title: '状态',
          dataIndex: 'status_dictText',
          width: 20,
        },
      ];
      //已选择的table信息
      const selectedTable = {
        pagination: false,
        showIndexColumn: false,
        scroll: { y: 390 },
        size: 'small',
        canResize: false,
        bordered: true,
        rowKey: 'id',
        columns: [
          {
            title: '用户姓名',
            dataIndex: 'realname',
            width: 40,
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            width: 40,
            slots: { customRender: 'action' },
          },
        ],
      };
      /**
       * 确定选择
       */
      function handleOk() {
        getSelectResult((options, values) => {
          //回传选项和已选择的值
          emit('getSelectResult', options, values);
          //关闭弹窗
          closeModal();
        });
      }

      return {
        //config,
        handleOk,
        searchInfo,
        register,
        indexColumnProps,
        visibleChange,
        getBindValue,
        getUserList,
        formConfig,
        columns,
        rowSelection,
        selectRows,
        selectedTable,
        handleDeleteSelected,
        tableScroll,
        tableRef,
      };
    },
  });
</script>
