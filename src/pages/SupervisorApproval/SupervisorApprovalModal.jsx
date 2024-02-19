import React, { useState } from "react";
// MUI
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
// Components
import ModalTemplete from "../../components/Modal/ModalTemplete";

const ReviewModal = React.memo(({ title, deliverInfo, sendDataToBackend, onClose }) => {
	console.log(deliverInfo);
	return (
		<>
			{/* Modal */}
			<ModalTemplete title={title} show={true} maxWidth={"768px"} onClose={onClose}>
				<div className="flex flex-col pt-4 gap-3">
					{deliverInfo.attendance && (
						<div className="inline-flex flex-col sm:flex-row border px-3 py-2 rounded-sm border-zinc-300 gap-1">
							<p className="w-full">
								日期：<span className="font-bold">{deliverInfo.attendance.date}</span>
							</p>
							<p className="w-full">
								類型：<span className="font-bold">{deliverInfo.attendance.anomaly.chinese}</span>
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
								申請時間(起)：<span className="font-bold">{deliverInfo.since}</span>
							</p>
							<p className="w-full">
								申請時間(迄)：<span className="font-bold">{deliverInfo.until}</span>
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
									簽核主管：<span className="font-bold">{deliverInfo.approver}</span>
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
							<>
								<TextField multiline rows={2} className="inputPadding bg-white" placeholder="請輸入備註 (可為空)" fullWidth />
								<Button variant="contained">送出</Button>
							</>
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
		</>
	);
});
export { ReviewModal };
