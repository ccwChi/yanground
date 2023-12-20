import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import useLocalStorageValue from "../../hooks/useLocalStorageValue";
import useMediaQuery from "@mui/material/useMediaQuery";
import Avatar from "@mui/material/Avatar";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import logoIcon from "../../assets/Logo.png";
import "./Layout.scss";

const Sidebar = ({ menuItems, closeSidebar }) => {
	const [expanded, setExpanded] = useState(null);
	const userProfile = useLocalStorageValue("userProfile");
	const isSmallScreen = useMediaQuery("(max-width:575.98px)");

	const handleAccordionChange = (panel) => (event, isExpanded) => {
		setExpanded(isExpanded ? panel : null);
	};

	return (
		<div className="flex flex-col items-center justify-between h-full pointer-events-auto lg:max-w-none max-w-sm overflow-y-auto gap-4 pb-2">
			<div className="w-full">
				<div
					className={"flex flex-col items-center justify-center px-6 py-4 mb-3 select-none"}
					style={{ wordBreak: "break-word" }}>
					<NavLink to="/" className="lg:flex hidden items-center text-2xl select-none">
						{/* Logo */}
						<img src={logoIcon} alt="Logo" className="h-12 me-2" />
						<span className="whitespace-nowrap font-medium -translate-y-px text-text">元融科技</span>
					</NavLink>
					<Avatar
						alt={userProfile?.displayName}
						src={userProfile?.pictureUrl}
						sx={{
							width: isSmallScreen ? 120 : 150,
							height: isSmallScreen ? 120 : 150,
							border: "solid 1.25em transparent",
							borderRadius: "50%",
							background:
								"radial-Gradient(circle at calc(50% + (50% - 0.625em)*1) calc(50% + (50% - 0.625em)*0), #f03355 calc(0.625em - 1px), transparent 0.625em), radial-Gradient(circle at calc(50% + (50% - 0.625em)*0) calc(50% + (50% - 0.625em)*1), #514b82 calc(0.625em - 1px), transparent 0.625em), radial-Gradient(circle at calc(50% + (50% - 0.625em)*-1) calc(50% + (50% - 0.625em)*0), #ffa516 calc(0.625em - 1px), transparent 0.625em), radial-Gradient(circle at calc(50% + (50% - 0.625em)*0) calc(50% + (50% - 0.625em)*-1), #25b09b calc(0.625em - 1px), transparent 0.625em), conic-Gradient(#f03355 0% 90deg, #514b82 0% 180deg, #ffa516 0% 270deg, #25b09b 0% 360deg)",
							backgroundOrigin: "border-box",
							"--mask":
								"radial-Gradient(closest-side, red calc(100% - 1.25em - 1px), transparent calc(100% - 0.75em ) calc(100% - 1.25em), red calc(100% - 0.75em + 1px) calc(100% - 1px), transparent)",
							WebkitMask: " var(--mask)",
							mask: "var(--mask)",
						}}
						className="mt-4"
					/>
					<p className="font-bold text-1xl">{userProfile ? userProfile.displayName : "-"}</p>
					<span className="opacity-90">
						{userProfile ? userProfile.department && userProfile.department.name : "-"}
					</span>
				</div>
				<List className="mainMenu !px-3 flex flex-col gap-1">
					{menuItems.map((menuItem, index) => (
						<div key={index} className="item">
							{menuItem.subMenuItems ? (
								<Accordion
									className="!bg-inherit !shadow-none"
									expanded={expanded === `panel-${index}`}
									onChange={handleAccordionChange(`panel-${index}`)}>
									<AccordionSummary
										expandIcon={<FontAwesomeIcon icon={faChevronDown} />}
										className="h-12 btn"
										style={{ minHeight: 0 }}>
										<ListItemIcon className="items-center justify-center me-1" style={{ minWidth: "32px" }}>
											<FontAwesomeIcon icon={menuItem.icon} className="text-base" />
										</ListItemIcon>
										<span className="self-center sm:text-base text-sm">{menuItem.text}</span>
									</AccordionSummary>
									<AccordionDetails style={{ padding: 0 }}>
										<List className="subMenu flex flex-col gap-1" style={{ paddingTop: 0, paddingBottom: 0 }}>
											<Divider variant="middle" className="!border-[1px] !mb-0.5" />
											{menuItem.subMenuItems.map((subMenuItem, subIndex) => (
												<NavLink
													key={subIndex}
													to={subMenuItem.href}
													className="flex items-center ps-8 pe-4 h-10 accordionLink select-none"
													onClick={closeSidebar}>
													<span className="sm:text-base text-sm">{subMenuItem.text}</span>
												</NavLink>
											))}
										</List>
									</AccordionDetails>
								</Accordion>
							) : (
								<NavLink
									to={menuItem.href}
									className="flex py-2 px-4 h-12 btn accordionLink select-none"
									onClick={closeSidebar}>
									<ListItemIcon className="items-center justify-center me-1" style={{ minWidth: "32px" }}>
										<FontAwesomeIcon icon={menuItem.icon} className="text-base" />
									</ListItemIcon>
									<span className="self-center sm:text-base text-sm">{menuItem.text}</span>
								</NavLink>
							)}
						</div>
					))}
				</List>
			</div>
			<div className="text-xs">Copyright © 2023 YuanRong.</div>
		</div>
	);
};

export default Sidebar;
