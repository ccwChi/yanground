import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faUser } from "@fortawesome/free-solid-svg-icons";
import logoIcon from "../../assets/Logo.png";

const Header = ({ toggleSidebar }) => {
	const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
	const userProfile = JSON.parse(localStorage.getItem("userProfile"));

	const handleMobileMenuOpen = (event) => {
		setMobileMenuAnchor(event.currentTarget);
	};

	const handleMobileMenuClose = () => {
		setMobileMenuAnchor(null);
	};

	return (
		<AppBar position="static" elevation={3} style={{ zIndex: 1024 }}>
			<Toolbar className="justify-between text-primary-800 bg-white">
				<NavLink to="/" className="flex items-center text-1xl select-none">
					{/* Logo */}
					<img src={logoIcon} alt="Logo" className="h-10 me-1" />
					<span className="whitespace-nowrap text-primary-900 font-medium -translate-y-px">元融科技</span>
					<span className="hidden md:block whitespace-nowrap text-primary-900 font-medium -translate-y-px">
						有限公司
					</span>
				</NavLink>

				<div className="flex gap-2">
					{/* Desktop Right */}
					<div className="hidden md:flex ml-4">
						<Button variant="text" color="inherit" onClick={handleMobileMenuOpen} sx={{ textTransform: "none" }}>
							<FontAwesomeIcon icon={faUser} className="mr-2" />
							{userProfile.displayName}
						</Button>
						<Menu anchorEl={mobileMenuAnchor} open={Boolean(mobileMenuAnchor)} onClose={handleMobileMenuClose}>
							<MenuItem>個人資料</MenuItem>
							<MenuItem>設定</MenuItem>
							<MenuItem>登出</MenuItem>
						</Menu>
					</div>

					{/* Mobile Right (Hamburger Menu) */}
					<div className="flex lg:hidden items-center">
						<IconButton color="inherit" onClick={toggleSidebar}>
							<FontAwesomeIcon icon={faBars} />
						</IconButton>
					</div>
				</div>
			</Toolbar>
		</AppBar>
	);
};

export default Header;
