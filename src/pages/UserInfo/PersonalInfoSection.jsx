import React from "react";
import { NavLink } from "react-router-dom";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import Diversity3Icon from "@mui/icons-material/Diversity3";

const PersonalInfoSection = React.memo(({ userProfile, personalInfo }) => {
	return (
		<div className="h-full overflow-y-auto px-6 sm:pb-0 pb-8">
			<div className="panel panel-wallet">
				<div className="left bg-secondary-50 text-white">
					<div>
						<RecentActorsIcon />
					</div>
					<div>員工編號</div>
					<div className="text-white">
						<strong className="text-2xl">{userProfile.employeeId ? userProfile.employeeId : "-"}</strong>
					</div>
				</div>

				<div className="right bg-quaternary-50 text-white">
					<div>
						<Diversity3Icon />
					</div>
					<div>部門</div>
					<div className="text-white">
						<strong className="text-2xl">{userProfile.department ? userProfile.department.name : "-"}</strong>
					</div>
				</div>
			</div>

			{personalInfo &&
				personalInfo.map((info, index) => (
					<div key={index}>
						<div className="flex justify-between sm:justify-start py-3">
							<span className="text-neutral-500 pe-2 min-w-[7rem]">{info.title}</span>
							{info.title === "權限" ? (
								<div className="flex gap-2 flex-wrap justify-end sm:justify-start">
									{info.content
										? info.content.map((department, idx) => <Chip key={idx} label={department.name} color="primary" />)
										: "-"}
								</div>
							) : (
								<p className="text-black break-all">{info.content ? info.content : "-"}</p>
							)}
						</div>
						{index !== personalInfo.length - 1 && <Divider />}
					</div>
				))}
		</div>
	);
});

export default PersonalInfoSection;
