<!--部门选择框-->
<template>
  <div>
    <BasicModal v-bind="$attrs" @register="register" :title="modalTitle" width="500px" @ok="handleOk" destroyOnClose @visible-change="visibleChange">
      <BasicTree
        ref="treeRef"
        :treeData="treeData"
        :load-data="sync == false ? null : onLoadData"
        v-bind="getBindValue"
        @select="onSelect"
        @check="onCheck"
        :fieldNames="fieldNames"
        :checkedKeys="checkedKeys"
        :checkStrictly="getCheckStrictly"
      />
      <!--树操作部分-->
      <template #insertFooter>
        <a-dropdown placement="top">
          <template #overlay>
            <a-menu>
              <a-menu-item v-if="multiple" key="1" @click="checkALL(true)">全部勾选</a-menu-item>
              <a-menu-item v-if="multiple" key="2" @click="checkALL(false)">取消全选</a-menu-item>
              <a-menu-item key="3" @click="expandAll(true)">展开全部</a-menu-item>
              <a-menu-item key="4" @click="expandAll(false)">折叠全部</a-menu-item>
            </a-menu>
          </template>
          <a-button style="float: left"> 树操作 <Icon icon="ant-design:up-outlined" /> </a-button>
        </a-dropdown>
      </template>
    </BasicModal>
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { queryDepartTreeSync, queryTreeList } from '/@/api/common/api';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { treeProps } from '/@/components/Form/src/jeecg/props/props';
  import { BasicTree, TreeActionType } from '/@/components/Tree';
  import { useTreeBiz } from '/@/components/Form/src/jeecg/hooks/useTreeBiz';

  export default defineComponent({
    name: 'DeptSelectModal',
    components: {
      BasicModal,
      BasicTree,
    },
    props: {
      ...treeProps,
      //选择框标题
      modalTitle: {
        type: String,
        default: '部门选择',
      },
    },
    emits: ['register', 'getSelectResult'],
    setup(props, { emit, refs }) {
      //注册弹框
      const [register, { closeModal }] = useModalInner();
      const attrs = useAttrs();
      const treeRef = ref<Nullable<TreeActionType>>(null);
      const getBindValue = Object.assign({}, unref(props), unref(attrs));
      const queryUrl = getQueryUrl();
      const [{ visibleChange, checkedKeys, getCheckStrictly, getSelectTreeData, onCheck, onLoadData, treeData, checkALL, expandAll, onSelect }] =
        useTreeBiz(treeRef, queryUrl, getBindValue);
      const searchInfo = ref(props.params);
      const tree = ref([]);
      //替换treeNode中key字段为treeData中对应的字段
      const fieldNames = {
        key: props.rowKey,
      };
      // {children:'children', title:'title', key:'key' }
      /**
       * 确定选择
       */
      function handleOk() {
        getSelectTreeData((options, values) => {
          //回传选项和已选择的值
          emit('getSelectResult', options, values);
          //关闭弹窗
          closeModal();
        });
      }

      /** 获取查询数据方法 */
      function getQueryUrl() {
        let queryFn = props.sync ? queryDepartTreeSync : queryTreeList;
        //update-begin-author:taoyan date:2022-7-4 for: issues/I5F3P4 online配置部门选择后编辑，查看数据应该显示部门名称，不是部门代码
        return (params) => queryFn(Object.assign({}, params, { primaryKey: props.rowKey }));
        //update-end-author:taoyan date:2022-7-4 for: issues/I5F3P4 online配置部门选择后编辑，查看数据应该显示部门名称，不是部门代码
      }

      return {
        tree,
        handleOk,
        searchInfo,
        treeRef,
        treeData,
        onCheck,
        onSelect,
        checkALL,
        expandAll,
        fieldNames,
        checkedKeys,
        register,
        getBindValue,
        getCheckStrictly,
        visibleChange,
        onLoadData,
      };
    },
  });
</script>
