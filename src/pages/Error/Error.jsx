import React from "react";
import style from "./ErrorPages.module.scss";
import { useLocation } from "react-router-dom";

const errorMsg = [
	{
		title: "unauthorized",
		httpcode: "401",
		content: "此頁面需經過授權才能瀏覽",
		content_en: "This page is meant to only be accessed by certain people.",
	},
	{
		title: "forbidden",
		httpcode: "403",
		content: "客戶端憑證已過期或無該頁面權限",
		content_en: "Access Denied. You Do Not Have The Permission To Access This Page On This Server.",
	},
	{
		title: "internalservererror",
		httpcode: "500",
		content: "內部伺服器錯誤",
		content_en: "That's an error. Please try again later. That's all we know.",
	},
];

const Error = () => {
	const location = useLocation();
	const pathnames = location.pathname.split("/").filter((x) => x);
	const data = errorMsg.find((obj) => obj.title === pathnames[0]);

	return (
		<div className={`${style.body} absolute inset-0`}>
			<div
				className={
					"absolute flex flex-col items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold uppercase text-text opacity-80 select-none z-10 w-full px-5 text-center"
				}>
				<p className="text-3xl">{data.content}</p>
				<h3 className="leading-tight" style={{ fontSize: "clamp(10rem, 15vw, 20rem)" }}>
					{data.httpcode}
				</h3>
				<p className="text-sm">{data.content_en}</p>
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

export default Error;
