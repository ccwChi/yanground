import React from "react";
import style from "./ErrorPages.module.scss";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

// 403
const Forbidden = () => {
	const navigate = useNavigate();

	return (
		<div className={`${style.body} absolute inset-0`}>
			<div
				className={
					"absolute flex flex-col items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold uppercase text-text opacity-80 select-none z-10 w-full px-5 text-center"
				}>
				<p className="text-3xl">客戶端憑證已過期或無該頁面權限</p>
				<h3 className="leading-tight" style={{ fontSize: "clamp(10rem, 15vw, 20rem)" }}>
					403
				</h3>
				<p className="text-sm">Access Denied. You Do Not Have The Permission To Access This Page On This Server.</p>
				<div className="flex mt-6 gap-4">
					<Button variant="contained" component={NavLink} to={"/"} className="!text-base !h-12 !rounded-full">
						返回首頁
					</Button>
					<Button
						variant="contained"
						color="success"
						className="!text-base !h-12 !rounded-full"
						onClick={() => {
							navigate(-1);
						}}>
						返回上一頁
					</Button>
				</div>
			</div>
			<div className={style.sun}></div>
			<div className={style.clouds}>
				<div></div>
				<div></div>
				<div></div>
			</div>
			<div className={style.birds}></div>
			<div className={style.sea}>
				<div className={`${style.wave} ${style.w_1}`}></div>
				<div className={`${style.wave} ${style.w_2}`}></div>
				<div className={style.fish}>
					<span></span>
					<span></span>
					<span></span>
				</div>
			</div>
			<div className={style.bottom}>
				<div className={style.grass}>
					<span> </span>
					<span> </span>
					<span> </span>
				</div>
				<div className={style.grass}>
					<span> </span>
					<span> </span>
					<span> </span>
				</div>
				<div className={style.grass}>
					<span> </span>
					<span> </span>
					<span> </span>
				</div>
				<div className={style.grass}>
					<span> </span>
					<span> </span>
					<span> </span>
				</div>
				<div className={style.circle}>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</div>
				<div className={style.circle}>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</div>
				<div className={style.circle}>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</div>
				<div className={style.circle}>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</div>
				<div className={style.grass_tw}></div>
				<div className={style.grass_tw}></div>
				<div className={style.grass_tw}></div>
			</div>
		</div>
	);
};

export default Forbidden;
