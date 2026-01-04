import * as React from "react";
import { Input } from "@base-ui/react/input";
import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";

import { cn } from "@/lib/utils";

// ==================== Context ====================

interface EditableContextValue {
  isEditing: boolean;
  value: string;
  startEdit: () => void;
  cancelEdit: () => void;
  submitEdit: () => void;
  setValue: (value: string) => void;
}

const EditableContext = React.createContext<EditableContextValue | null>(null);

function useEditableContext() {
  const context = React.useContext(EditableContext);
  if (!context) {
    throw new Error("Editable 子组件必须在 <Editable> 内使用");
  }
  return context;
}

// ==================== Root Component ====================

function Editable({
  defaultValue = "",
  value: controlledValue,
  onChange,
  onSubmit,
  onCancel,
  onEdit,
  disabled = false,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange" | "onSubmit"> & {
  /** 默认值（非受控） */
  defaultValue?: string;
  /** 受控值 */
  value?: string;
  /** 值改变回调 */
  onChange?: (value: string) => void;
  /** 提交回调 */
  onSubmit?: (value: string) => void;
  /** 取消回调 */
  onCancel?: () => void;
  /** 编辑状态改变回调 */
  onEdit?: (isEditing: boolean) => void;
  /** 是否禁用 */
  disabled?: boolean;
}) {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingValue, setEditingValue] = React.useState("");

  // 当前显示的值
  const displayValue = isControlled ? controlledValue : uncontrolledValue;

  const startEdit = React.useCallback(() => {
    if (disabled) return;
    setEditingValue(displayValue);
    setIsEditing(true);
    onEdit?.(true);
  }, [disabled, displayValue, onEdit]);

  const cancelEdit = React.useCallback(() => {
    setIsEditing(false);
    setEditingValue("");
    onEdit?.(false);
    onCancel?.();
  }, [onEdit, onCancel]);

  const submitEdit = React.useCallback(() => {
    if (!isControlled) {
      setUncontrolledValue(editingValue);
    }
    // onChange 已经在每次输入时调用，提交时只调用 onSubmit
    onSubmit?.(editingValue);
    setIsEditing(false);
    onEdit?.(false);
  }, [isControlled, editingValue, onSubmit, onEdit]);

  const setValue = React.useCallback(
    (newValue: string) => {
      setEditingValue(newValue);
      // 每次输入变化都调用 onChange
      onChange?.(newValue);
    },
    [onChange],
  );

  const contextValue: EditableContextValue = React.useMemo(
    () => ({
      isEditing,
      value: isEditing ? editingValue : displayValue,
      startEdit,
      cancelEdit,
      submitEdit,
      setValue,
    }),
    [isEditing, editingValue, displayValue, startEdit, cancelEdit, submitEdit, setValue],
  );

  return (
    <EditableContext.Provider value={contextValue}>
      <div data-slot="editable" className={cn("relative", className)} {...props}>
        {children}
      </div>
    </EditableContext.Provider>
  );
}

// ==================== Preview Component ====================

function EditablePreview({
  className,
  children,
  placeholder = "Enter text...",
  render,
  ...props
}: useRender.ComponentProps<"div"> & {
  /** 占位符文本 */
  placeholder?: string;
}) {
  const { isEditing, value, startEdit } = useEditableContext();

  // 判断是否显示 placeholder
  const hasValue = Boolean(value || children);
  const content = children || value || placeholder;

  const defaultProps: useRender.ElementProps<"div"> = {
    className: cn(!hasValue && "text-muted-foreground", isEditing && "hidden", className),
    onClick: startEdit,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        startEdit();
      }
    },
    role: "button",
    tabIndex: 0,
    children: content,
  };

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
    state: {
      slot: "editable-preview",
      hasValue,
      value,
    },
  });
}

// ==================== Input Component ====================

function EditableInput({
  className,
  onKeyDown,
  onBlur,
  render,
  ...props
}: useRender.ComponentProps<"input"> & Omit<React.ComponentProps<"input">, "value" | "onChange">) {
  const { isEditing, value, setValue, submitEdit, cancelEdit } = useEditableContext();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // 自动聚焦并将光标移到末尾
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // 将光标移动到文本末尾
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
    onKeyDown?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // 失去焦点时自动提交
    submitEdit();
    onBlur?.(e);
  };

  const defaultProps: useRender.ElementProps<"input"> = {
    ref: inputRef as any,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
    className: cn("w-full outline-none", className),
  };

  const element = useRender({
    defaultTagName: "input",
    props: mergeProps<"input">(defaultProps, props),
    render: render ?? <Input />,
    state: {
      slot: "editable-input",
      value,
    },
  });

  // 在所有 Hooks 调用之后才做条件渲染
  if (!isEditing) return null;

  return element;
}

export { Editable, EditablePreview, EditableInput };
