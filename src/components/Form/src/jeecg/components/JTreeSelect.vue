<template>
  <a-tree-select
    allowClear
    labelInValue
    style="width: 100%"
    :getPopupContainer="(node) => node.parentNode"
    :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }"
    :placeholder="placeholder"
    :loadData="asyncLoadTreeData"
    :value="treeValue"
    :treeData="treeData"
    :multiple="multiple"
    v-bind="attrs"
    @change="onChange"
    @search="onSearch"
  >
  </a-tree-select>
</template>
<script lang="ts" setup>
  /*
   * 异步树加载组件 通过传入表名 显示字段 存储字段 加载一个树控件
   * <j-tree-select dict="aa_tree_test,aad,id" pid-field="pid" ></j-tree-select>
   * */
  import { ref, watch, unref } from 'vue';
  import { defHttp } from '/@/utils/http/axios';
  import { propTypes } from '/@/utils/propTypes';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { TreeSelect } from 'ant-design-vue';
  import { useMessage } from '/@/hooks/web/useMessage';

  enum Api {
    url = '/sys/dict/loadTreeData',
    view = '/sys/dict/loadDictItem/',
  }

  const props = defineProps({
    value: propTypes.string.def(''),
    placeholder: propTypes.string.def('请选择'),
    dict: propTypes.string.def('id'),
    parentCode: propTypes.string.def(''),
    pidField: propTypes.string.def('pid'),
    //update-begin---author:wangshuai ---date:20220620  for：JTreeSelect组件pidValue还原成空，否则会影响自定义组件树示例------------
    pidValue: propTypes.string.def(''),
    //update-end---author:wangshuai ---date:20220620  for：JTreeSelect组件pidValue还原成空，否则会影响自定义组件树示例--------------
    hasChildField: propTypes.string.def(''),
    converIsLeafVal: propTypes.integer.def(1),
    condition: propTypes.string.def(''),
    multiple: propTypes.bool.def(false),
    loadTriggleChange: propTypes.bool.def(false),
    reload: propTypes.number.def(1),
  });
  const attrs = useAttrs();
  const emit = defineEmits(['change', 'update:value']);
  const { createMessage } = useMessage();
  //树形下拉数据
  const treeData = ref<any[]>([]);
  //选择数据
  const treeValue = ref<any>(null);
  const tableName = ref<any>('');
  const text = ref<any>('');
  const code = ref<any>('');
  /**
   * 监听value数据并初始化
   */
  watch(
    () => props.value,
    () => loadItemByCode(),
    { deep: true, immediate: true }
  );
  /**
   * 监听dict变化
   */
  watch(
    () => props.dict,
    () => {
      initDictInfo();
      loadRoot();
    },
    { deep: true, immediate: true }
  );

  //update-begin-author:taoyan date:2022-5-25 for: VUEN-1056 15、严重——online树表单，添加的时候，父亲节点是空的
  watch(
    () => props.reload,
    async () => {
      treeData.value = [];
      await loadRoot();
    },
    {
      immediate: false,
    }
  );
  //update-end-author:taoyan date:2022-5-25 for: VUEN-1056 15、严重——online树表单，添加的时候，父亲节点是空的

  /**
   * 根据code获取下拉数据并回显
   */
  async function loadItemByCode() {
    if (!props.value || props.value == '0') {
      if(props.multiple){
        treeValue.value = [];
      }else{
        treeValue.value = null;
      }
    } else {
      let params = { key: props.value };
      let result = await defHttp.get({ url: `${Api.view}${props.dict}`, params }, { isTransformResponse: false });
      if (result.success) {
        let values = props.value.split(',');
        treeValue.value = result.result.map((item, index) => ({
          key: values[index],
          value: values[index],
          label: item,
        }));
        onLoadTriggleChange(result.result[0]);
      }
    }
  }

  function onLoadTriggleChange(text) {
    //只有单选才会触发
    if (!props.multiple && props.loadTriggleChange) {
      emit('change', props.value, text);
    }
  }

  /**
   * 初始化数据
   */
  function initDictInfo() {
    let arr = props.dict?.split(',');
    tableName.value = arr[0];
    text.value = arr[1];
    code.value = arr[2];
  }

  /**
   * 加载下拉树形数据
   */
  async function loadRoot() {
    let params = {
      pid: props.pidValue,
      pidField: props.pidField,
      hasChildField: props.hasChildField,
      converIsLeafVal: props.converIsLeafVal,
      condition: props.condition,
      tableName: unref(tableName),
      text: unref(text),
      code: unref(code),
    };
    let res = await defHttp.get({ url: Api.url, params }, { isTransformResponse: false });
    if (res.success && res.result) {
      for (let i of res.result) {
        i.value = i.key;
        i.isLeaf = !!i.leaf;
      }
      treeData.value = [...res.result];
    } else {
      console.log('数根节点查询结果异常', res);
    }
  }

  /**
   * 异步加载数据
   */
  async function asyncLoadTreeData(treeNode) {
    if (treeNode.dataRef.children) {
      return Promise.resolve();
    }
    let pid = treeNode.dataRef.key;
    let params = {
      pid: pid,
      pidField: props.pidField,
      hasChildField: props.hasChildField,
      converIsLeafVal: props.converIsLeafVal,
      condition: props.condition,
      tableName: unref(tableName),
      text: unref(text),
      code: unref(code),
    };
    let res = await defHttp.get({ url: Api.url, params }, { isTransformResponse: false });
    if (res.success) {
      for (let i of res.result) {
        i.value = i.key;
        i.isLeaf = !!i.leaf;
      }
      //添加子节点
      addChildren(pid, res.result, treeData.value);
      treeData.value = [...treeData.value];
    }
    return Promise.resolve();
  }

  /**
   * 加载子节点
   */
  function addChildren(pid, children, treeArray) {
    if (treeArray && treeArray.length > 0) {
      for (let item of treeArray) {
        if (item.key == pid) {
          if (!children || children.length == 0) {
            item.isLeaf = true;
          } else {
            item.children = children;
          }
          break;
        } else {
          addChildren(pid, children, item.children);
        }
      }
    }
  }

  /**
   * 选中树节点事件
   */
  function onChange(value) {
    if (!value) {
      emitValue('');
    } else if (value instanceof Array) {
      emitValue(value.map((item) => item.value).join(','));
    } else {
      emitValue(value.value);
    }
    treeValue.value = value;
  }

  function emitValue(value) {
    emit('change', value);
    emit('update:value', value);
  }

  /**
   * 文本框值变化
   */
  function onSearch(value) {
    console.log(value);
  }

  /**
   * 校验条件配置是否有误
   */
  function validateProp() {
    let mycondition = props.condition;
    return new Promise((resolve, reject) => {
      if (!mycondition) {
        resolve();
      } else {
        try {
          let test = JSON.parse(mycondition);
          if (typeof test == 'object' && test) {
            resolve();
          } else {
            createMessage.error('组件JTreeSelect-condition传值有误，需要一个json字符串!');
            reject();
          }
        } catch (e) {
          createMessage.error('组件JTreeSelect-condition传值有误，需要一个json字符串!');
          reject();
        }
      }
    });
  }

  // onCreated
  validateProp().then(() => {
    initDictInfo();
    loadRoot();
    loadItemByCode();
  });
</script>

<style lang="less"></style>
