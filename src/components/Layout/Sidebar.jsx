import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import useLocalStorageValue from "../../hooks/useLocalStorageValue";
import { Avatar, Accordion, AccordionSummary, AccordionDetails, ListItemText, ListItemIcon, List } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import "./Layout.scss";

const Sidebar = ({ menuItems, closeSidebar }) => {
	const [expanded, setExpanded] = useState(null);
	const userProfile = useLocalStorageValue("userProfile");

	const handleAccordionChange = (panel) => (event, isExpanded) => {
		setExpanded(isExpanded ? panel : null);
	};

	return (
		<>
			<div
				className={
					"flex lg:hidden justify-start text-primary-900 font-medium mx-6 mb-3 py-4 border-b-4 border-b-neutral-300 select-none"
				}
				style={{ wordBreak: "break-word" }}>
				{/* <img
					src={
						"https://images.unsplash.com/photo-1696962536357-faf73d8fd16b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80"
					}
					alt="Logo"
					className="h-16 sm:h-20 aspect-square rounded-full object-cover me-3"
				/> */}
				{userProfile && (
					<>
						<Avatar
							alt={userProfile.displayName}
							src={userProfile.pictureUrl}
							sx={{ width: 56, height: 56, bgcolor: "#547db7" }}
						/>
						<div className="inline-flex flex-col ms-3">
							<p className="font-bold text-1xl">{userProfile.displayName}</p>
							<span className="opacity-90">{userProfile.department && userProfile.department.name}</span>

							<NavLink to="/userinfo" className={"pt-1"} onClick={closeSidebar}>
								檢視你的帳戶
							</NavLink>
						</div>
					</>
				)}
			</div>
			<List className="mainMenu">
				{menuItems.map((menuItem, index) => (
					<div key={index} className="item">
						{menuItem.subMenuItems ? (
							<Accordion expanded={expanded === `panel-${index}`} onChange={handleAccordionChange(`panel-${index}`)}>
								<AccordionSummary
									expandIcon={<FontAwesomeIcon icon={faChevronDown} />}
									className="h-12 sm:h-15 btn"
									style={{ minHeight: 0 }}>
									<ListItemIcon
										className="items-center justify-center md:me-3 sm:me-2 me-1"
										style={{ minWidth: "32px" }}>
										<FontAwesomeIcon icon={menuItem.icon} className="text-base sm:text-xl" />
									</ListItemIcon>
									<span className="self-center text-base sm:text-xl font-bold">{menuItem.text}</span>
								</AccordionSummary>
								<AccordionDetails style={{ padding: 0 }}>
									<List className="subMenu" style={{ paddingTop: 0, paddingBottom: 0 }}>
										{menuItem.subMenuItems.map((subMenuItem, subIndex) => (
											<NavLink
												key={subIndex}
												to={subMenuItem.href}
												className="block ps-8 pe-4 font-bold text-sm sm:text-lg accordionLink select-none"
												onClick={closeSidebar}>
												<span className="text-base sm:text-lg">{subMenuItem.text}</span>
											</NavLink>
										))}
									</List>
								</AccordionDetails>
							</Accordion>
						) : (
							<NavLink
								to={menuItem.href}
								className="flex py-2 h-12 sm:h-15 btn accordionLink select-none"
								onClick={closeSidebar}>
								<ListItemIcon className="items-center justify-center md:me-3 sm:me-2 me-1" style={{ minWidth: "32px" }}>
									<FontAwesomeIcon icon={menuItem.icon} className="text-base sm:text-xl" />
								</ListItemIcon>
								<span className="self-center text-base sm:text-xl font-bold">{menuItem.text}</span>
							</NavLink>
						)}
					</div>
				))}
			</List>
		</>
	);
};

export default Sidebar;
