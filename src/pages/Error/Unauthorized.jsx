import React from "react";
import style from "./ErrorPages.module.scss";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

// 401
const Unauthorized = () => {
	const navigate = useNavigate();

	return (
		<div className={`${style.body} absolute inset-0`}>
			<div
				className={
					"absolute flex flex-col items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold uppercase text-text opacity-80 select-none z-10 w-full px-5 text-center"
				}>
				<p className="text-3xl">此頁面需經過授權才能瀏覽</p>
				<h3 className="leading-tight" style={{ fontSize: "clamp(10rem, 15vw, 20rem)" }}>
					401
				</h3>
				<p className="text-sm">This page is meant to only be accessed by certain people.</p>
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

export default Unauthorized;
