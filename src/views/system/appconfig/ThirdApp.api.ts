import { defHttp } from '/@/utils/http/axios';

enum Api {
  //第三方登录配置
  addThirdAppConfig = '/sys/thirdApp/addThirdAppConfig',
  editThirdAppConfig = '/sys/thirdApp/editThirdAppConfig',
  getThirdConfigByTenantId = '/sys/thirdApp/getThirdConfigByTenantId',
  syncDingTalkDepartUserToLocal = '/sys/thirdApp/sync/dingtalk/departAndUser/toLocal',
}

/**
 * 第三方配置保存或者更新
 */
export const saveOrUpdateThirdConfig = (params, isUpdate) => {
  let url = isUpdate ? Api.editThirdAppConfig : Api.addThirdAppConfig;
  return defHttp.post({ url: url, params }, { joinParamsToUrl: true });
};

/**
 * 获取第三方配置
 * @param params
 */
export const getThirdConfigByTenantId = (params) => {
  return defHttp.get({ url: Api.getThirdConfigByTenantId, params });
};

/**
 * 同步钉钉部门用户到本地
 * @param params
 */
export const syncDingTalkDepartUserToLocal = () => {
  return defHttp.get({ url: Api.syncDingTalkDepartUserToLocal }, { isTransformResponse: false });
};
