import { useCallback, useState } from "react";
import { type StyleProp, type ViewStyle } from "react-native";

import { DeleteButton } from "@/components/ui/delete-button";
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal";

type DeleteActionProps = {
  label?: string;
  loadingLabel?: string;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onError?: (error: unknown) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function DeleteAction({
  label = "Excluir",
  loadingLabel = "Excluindo...",
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onError,
  disabled = false,
  style,
}: DeleteActionProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = useCallback(async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      setIsModalVisible(false);
    } catch (error) {
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [onConfirm, onError]);

  const handleCancel = useCallback(() => {
    if (isLoading) return;
    setIsModalVisible(false);
  }, [isLoading]);

  return (
    <>
      <DeleteButton
        label={label}
        loadingLabel={loadingLabel}
        isLoading={isLoading}
        onPress={() => setIsModalVisible(true)}
        disabled={disabled || isModalVisible}
        style={style}
      />

      <DeleteConfirmModal
        visible={isModalVisible}
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        isLoading={isLoading}
        onConfirm={() => {
          void handleConfirm();
        }}
        onCancel={handleCancel}
      />
    </>
  );
}
