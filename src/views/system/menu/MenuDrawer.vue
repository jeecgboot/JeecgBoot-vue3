<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" showFooter :width="width" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" class="menuForm"/>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import {ref, computed, unref,useAttrs} from 'vue';
  import {BasicForm, useForm} from '/@/components/Form/index';
  import {formSchema, ComponentTypes} from './menu.data';
  import {BasicDrawer, useDrawerInner} from '/@/components/Drawer';
  import {list, saveOrUpdateMenu} from './menu.api';
  import { useAdapt } from '/@/hooks/system/useAutoAdapt.ts';
  import { filterTree } from '/@/utils/tree';

  // 声明Emits
  const emit = defineEmits(['success', 'register']);
  const {width}= useAdapt();
  const attrs = useAttrs()
  const isUpdate = ref(true);
  const menuType = ref(0);
  const isButton = (type) => type === 2;
  const [registerForm, {setProps,resetFields, setFieldsValue, updateSchema, validate,clearValidate}] = useForm({
    labelCol: {
        md: {span: 4},
        sm: {span: 6},
    },
    wrapperCol: {
        md: {span: 20},
        sm: {span: 18},
    }, 
    schemas: formSchema,
    showActionButtonGroup: false
  });

  const [registerDrawer, {setDrawerProps, closeDrawer}] = useDrawerInner(async (data) => {
    await resetFields()
    setDrawerProps({confirmLoading: false});
    isUpdate.value = !!data?.isUpdate;
    menuType.value = data?.record?.menuType;

    // 获取当前 record 的 id
    const currentId = data?.record?.id;

    //获取下拉树信息
    let treeData = await list();
    if (currentId) {
      treeData = filterTree(treeData, (item: any) => item.id !== currentId);
    }

    updateSchema([{
      field: 'parentId',
      componentProps: {treeData},
    },{
      field: 'name',
      label: isButton(unref(menuType)) ? '按钮/权限' : '菜单名称'
    },{
      field: 'url',
      required: !isButton(unref(menuType))
    }]);

    // 无论新增还是编辑，都可以设置表单值
    if (typeof data.record === 'object') {
      let values = { ...data.record }
      setFieldsValue(values)
    }
    //禁用表单
    setProps({disabled:!attrs.showFooter})
  });
  //获取弹窗标题
  const getTitle = computed(() => (!unref(isUpdate) ? '新增菜单' : '编辑菜单'));
  //提交事件
  async function handleSubmit() {
    try {
      const values = await validate()
      // iframe兼容
      if (ComponentTypes.IFrame === values.component) {
        values.component = values.frameSrc
      }
      setDrawerProps({confirmLoading: true});
      //提交表单
      await saveOrUpdateMenu(values, unref(isUpdate));
      closeDrawer();
      emit('success');
    } finally {
      setDrawerProps({confirmLoading: false});
    }
  }
</script>

