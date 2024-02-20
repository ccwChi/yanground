import React, { useState } from "react";
// MUI
import Chip from "@mui/material/Chip";
import Backdrop from "@mui/material/Backdrop";
// Components
import ModalTemplete from "../../components/Modal/ModalTemplete";
import { LoadingTwo } from "../../components/Loader/Loading";
// Hooks
import useLocalStorageValue from "../../hooks/useLocalStorageValue";

/***
 * 檢視審核 Modal
 * @param {string} title - Modal 標題名稱
 * @param {Object} deliverInfo - 顯示資訊
 * @param {Function} onClose - 關閉函式
 * @returns
 ***/
const ViewModal = React.memo(({ title, deliverInfo, onClose }) => {
	// 取得當前用戶資訊
	const userProfile = useLocalStorageValue("userProfile");

	return (
		<>
			{/* Modal */}
			<ModalTemplete title={title} show={!!userProfile} maxWidth={"768px"} onClose={onClose}>
				<div className="flex flex-col pt-4 gap-3">
					{deliverInfo.attendance && (
						<div className="inline-flex flex-col sm:flex-row border px-3 py-2 rounded-sm border-zinc-300 gap-1">
							<p className="w-full">
								日期：<span className="font-bold">{deliverInfo.attendance.date}</span>
							</p>
							<p className="w-full">
								申請原因：
								<span className="font-bold">
									{deliverInfo.attendance.anomaly
										? deliverInfo.attendance?.anomaly?.chinese || null
										: deliverInfo.attendance?.type?.chinese || null}
								</span>
							</p>
						</div>
					)}
					<div className="flex flex-col">
						<div className="inline-flex flex-col sm:flex-row py-1 gap-1">
							<p className="w-full">
								申請人：<span className="font-bold">{deliverInfo.fullname}</span>
							</p>
							<p className="w-full">
								申請類型：<span className="font-bold">{deliverInfo.attendanceWaivertype}</span>
							</p>
						</div>
						<div className="inline-flex flex-col sm:flex-row py-1 gap-1">
							<p className="w-full">
								申請區間(起)：<span className="font-bold">{deliverInfo.since}</span>
							</p>
							<p className="w-full">
								申請區間(迄)：<span className="font-bold">{deliverInfo.until}</span>
							</p>
						</div>
						<div className="inline-flex flex-col sm:flex-row py-1 gap-1">
							<p className="w-full">
								申請緣由：<span className="font-bold">{deliverInfo.excuse}</span>
							</p>
						</div>
					</div>
					<div className="relative inline-flex flex-col justify-center border sm:px-4 px-3 py-2 rounded-sm bg-zinc-100 min-h-[140px] gap-2">
						{deliverInfo.approveState ? (
							<>
								<p className="w-full">
									簽核主管：
									<span className="font-bold">
										{deliverInfo.approver.lastname}
										{deliverInfo.approver.firstname}
									</span>
								</p>
								<p className="w-full">
									簽核日期：
									<span className="font-bold">{deliverInfo.approvedAt}</span>
								</p>
								<p className="w-full">
									簽核備註：<span className="font-bold">{deliverInfo.remark}</span>
								</p>
							</>
						) : (
							<div className="flex items-center justify-center">
								<span className="italic text-neutral-500 text-sm">(尚未被審核，故無資料顯示)</span>
							</div>
						)}
						<div className="absolute right-3 -top-9">
							{deliverInfo.approveState === true ? (
								<Chip
									variant="outlined"
									label={"審核通過"}
									size="small"
									color="success"
									// icon={<DoneIcon />}
									sx={{ fontWeight: "700", borderRadius: "4px", backgroundColor: "#21AA9C19" }}
								/>
							) : deliverInfo.approveState === false ? (
								<Chip
									variant="outlined"
									label={"審核不通過"}
									size="small"
									color="error"
									// icon={<CloseIcon />}
									sx={{ fontWeight: "700", borderRadius: "4px", backgroundColor: "#D52F2F19" }}
								/>
							) : (
								<Chip
									variant="outlined"
									label={"待審核"}
									size="small"
									color="warning"
									// icon={<WarningIcon />}
									sx={{ fontWeight: "700", borderRadius: "4px", backgroundColor: "#ED6C0219" }}
								/>
							)}
						</div>
					</div>
				</div>
			</ModalTemplete>

			{/* Backdrop */}
			<Backdrop sx={{ color: "#fff", zIndex: 1050 }} open={!userProfile} onClick={onClose}>
				<LoadingTwo />
			</Backdrop>
		</>
	);
});
export { ViewModal };
