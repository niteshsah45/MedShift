function ConfirmModal({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
}) {
  return (
    <div className="modal-overlay">

      <div className="confirm-modal">

        <h2>{title}</h2>

        <p>{message}</p>

        <div className="confirm-modal-actions">

          <button
            className="secondary-button"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            className={
              danger
                ? "modal-danger-button"
                : "primary-button"
            }
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmText}
          </button>

        </div>

      </div>

    </div>
  );
}

export default ConfirmModal;