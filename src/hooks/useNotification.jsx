// 這是一個便於管理與呼叫 Notistack 設定的 Hook

import { useSnackbar } from "notistack";

export const useNotification = () => {
	const { enqueueSnackbar } = useSnackbar();

	const showNotification = (message, isSuccess) => {
		enqueueSnackbar(message, {
			variant: isSuccess ? "success" : "error",
			anchorOrigin: {
				vertical: "bottom",       // 垂直，可選：'top', 'bottom'
				horizontal: "center",     // 水平，可選：'left', 'center', 'right'
			},
			autoHideDuration: 5000,
		});
	};

	return showNotification;
};

// How to Used
// const showNotification = useNotification();
// showNotification('操作成功', true);
// showNotification('操作失敗', false);
