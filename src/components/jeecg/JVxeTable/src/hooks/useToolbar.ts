import { h } from 'vue';
import JVxeToolbar from '../components/JVxeToolbar.vue';
import { JVxeDataProps, JVxeTableMethods, JVxeTableProps } from '../types';

export function useToolbar(props: JVxeTableProps, data: JVxeDataProps, methods: JVxeTableMethods, $slots) {
  /** 渲染工具栏 */
  function renderToolbar() {
    if (props.toolbar) {
      return h(
        JVxeToolbar,
        {
          size: props.size,
          disabled: props.disabled,
          toolbarConfig: props.toolbarConfig,
          disabledRows: props.disabledRows,
          hasBtnAuth: methods.hasBtnAuth,
          selectedRowIds: data.selectedRowIds.value,
          // 新增事件
          onAdd: () => methods.addRows(),
          // 保存事件
          onSave: () => methods.trigger('save'),
          onRemove() {
            let $table = methods.getXTable();
            let deleteRows = methods.filterNewRows(data.selectedRows.value);
            // 触发删除事件
            if (deleteRows.length > 0) {
              let removeEvent: any = { deleteRows, $table};
              if (props.asyncRemove) {
                // 确认删除，只有调用这个方法才会真删除
                removeEvent.confirmRemove = () => methods.removeSelection();
              } else {
                methods.removeSelection();
              }
              methods.trigger('removed', removeEvent);
            } else {
              methods.removeSelection();
            }
          },
          // 清除选择事件
          onClearSelection: () => methods.clearSelection(),
          onRegister: ({ xToolbarRef }) => methods.getXTable().connect(xToolbarRef.value),
        },
        {
          toolbarPrefix: $slots.toolbarPrefix,
          toolbarSuffix: $slots.toolbarSuffix,
        }
      );
    }
    return null;
  }

  return { renderToolbar };
}
