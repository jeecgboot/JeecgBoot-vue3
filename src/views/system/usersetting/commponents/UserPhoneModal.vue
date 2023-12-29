<template>
<BasicModal v-bind="$attrs" @register="registerModal" width="500px"  :title="title" :showCancelBtn="false" :showOkBtn="false">
  <a-form class="antd-modal-form" ref="formRef" :model="formState" :rules="validatorRules">
    <a-form-item  name="phone">
      <a-input size="large" v-model:value="formState.phone" placeholder="请输入手机号" />
    </a-form-item>
    <a-form-item name="smscode">
      <CountdownInput size="large" v-model:value="formState.smscode" placeholder="输入6位验证码" :sendCodeApi="sendCodeApi" />
    </a-form-item>
    <a-form-item>
      <a-button size="large" type="primary" block @click="updatePhone">
        确认
      </a-button>
    </a-form-item>
  </a-form>
</BasicModal>
</template>

<script lang="ts" setup name="user-replace-phone-modal">
import BasicModal from "/@/components/Modal/src/BasicModal.vue";
import { CountdownInput } from '/@/components/CountDown';
import { useUserStore } from "/@/store/modules/user";
import { useMessage } from "/@/hooks/web/useMessage";
import { defineEmits, ref, reactive, toRaw } from "vue";
import { useModalInner } from "/@/components/Modal";
import { getCaptcha } from "/@/api/sys/user";
import { SmsEnum } from "/@/views/sys/login/useLogin";
import { Rule } from "/@/components/Form";
import { rules } from "/@/utils/helper/validator";
import { Form } from "ant-design-vue";
import { updateMobile } from "../UserSetting.api";
import { duplicateCheck } from "/@/views/system/user/user.api";

const userStore = useUserStore();
const { createMessage } = useMessage();
const formState = reactive<Record<string, any>>({
  phone:'',
  smscode:''
});
const formRef = ref();
const userData = ref<any>({})

const validatorRules: Record<string, Rule[]> = {
  phone: [{...rules.duplicateCheckRule("sys_user",'phone',formState,{ label:'手机号' })[0]},{ pattern: /^1[3456789]\d{9}$/, message: '手机号码格式有误' }],
  smscode: [{ required: true,message:'请输入验证码' }],
};
const useForm = Form.useForm;
const title = ref<string>('');
const emit = defineEmits(['register','success']);
//修改手机号还是绑定手机号
const type = ref<string>('updatePhone');
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  formRef.value.resetFields();
  formRef.value.clearValidate();
  setModalProps({ confirmLoading: false });
  if(data.record.phone){
    title.value = '修改手机号';
    type.value = "updatePhone"
  }else{
    title.value = '绑定手机号';
    type.value = "bindPhone"
  }
  //赋值
  data.record.smscode = '';
  Object.assign(formState, data.record);
  userData.value = data.record;
});

/**
 * 倒计时执行前的函数
 */
function sendCodeApi() {
  return getCaptcha({ mobile: formState.phone, smsmode: SmsEnum.REGISTER });
}

/**
 * 更新手机号
 */
async function updatePhone() {
  await formRef.value.validateFields();
  updateMobile(formState).then((res) =>{
    if(res.success){
      createMessage.success(type.value === "updatePhone"?"修改手机号成功":"绑定手机号成功")
      emit("success")
      closeModal();
    }else{
      createMessage.warning(res.message)
    }
  })
}
</script>
