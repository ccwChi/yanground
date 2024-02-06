import React, { useState } from "react";
// Components
import ModalTemplete from "../../components/Modal/ModalTemplete";

const ReviewModal = React.memo(({ title, deliverInfo, sendDataToBackend, onClose }) => {
	console.log(deliverInfo);
	return (
		<>
			{/* Modal */}
			<ModalTemplete title={title} show={true} maxWidth={"768px"} onClose={onClose}>
				<div className="flex flex-col pt-4">
					{deliverInfo.attendance && (
						<div className="inline-flex flex-col sm:flex-row border px-3 py-2 rounded-sm border-zinc-300">
							<p className="w-full">
								日期：<span className="font-bold">{deliverInfo.attendance.date}</span>
							</p>
							<p className="w-full">
								類型：<span className="font-bold">{deliverInfo.attendance.anomaly.chinese}</span>
							</p>
						</div>
					)}
					<div></div>
				</div>
			</ModalTemplete>
		</>
	);
});
export { ReviewModal };
