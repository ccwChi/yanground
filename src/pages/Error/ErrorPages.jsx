import React from "react";
import style from "./ErrorPages.module.scss";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

// 404
const ErrorPages = () => {
	const navigate = useNavigate();

	return (
		<div
			className={`absolute inset-0 ${style.errorpages} flex items-center sm:justify-center text-center m-auto px-4 sm:pt-4 pt-[40%] sm:pb-4 pb-28 overflow-y-auto`}>
			<div className="absolute inset-0 bg-[#E6E6E6] z-0"></div>
			<div className="flex flex-col items-center z-10">
				<img
					src="https://i.imgur.com/qIufhof.png"
					alt="Error Illustrations"
					className="w-full max-w-[256px] max-h-[225px]"
				/>
				<h1 className="mt-2 text-3xl">
					<span className="text-6xl">404</span> <br />
					這個頁面不存在
				</h1>
				<p className="mt-4">The page you are looking for doesn't exist.</p>
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
						返回上頁
					</Button>
				</div>
			</div>
		</div>
		// 1
		// <div className={`${style.body} absolute inset-0`}>
		// 	<div
		// 		className={
		// 			"absolute flex flex-col items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold uppercase text-text opacity-80 select-none z-10 w-full px-5"
		// 		}>
		// 		<p className="text-3xl">這個頁面不存在</p>
		// 		<h3 className="leading-tight" style={{ fontSize: "clamp(10rem, 15vw, 20rem)" }}>
		// 			404
		// 		</h3>
		// 		<p className="text-sm">The page you are looking for doesn't exist.</p>
		// 		<div className="flex mt-6 gap-4">
		// 			<Button variant="contained" component={NavLink} to={"/"} className="!text-base !h-12 !rounded-full">
		// 				返回首頁
		// 			</Button>
		// 			<Button
		// 				variant="contained"
		// 				color="success"
		// 				className="!text-base !h-12 !rounded-full"
		// 				onClick={() => {
		// 					navigate(-1);
		// 				}}>
		// 				返回上一頁
		// 			</Button>
		// 		</div>
		// 	</div>
		// 	<div className={style.sun}></div>
		// 	<div className={style.clouds}>
		// 		<div></div>
		// 		<div></div>
		// 		<div></div>
		// 	</div>
		// 	<div className={style.birds}></div>
		// 	<div className={style.sea}>
		// 		<div className={`${style.wave} ${style.w_1}`}></div>
		// 		<div className={`${style.wave} ${style.w_2}`}></div>
		// 		<div className={style.fish}>
		// 			<span></span>
		// 			<span></span>
		// 			<span></span>
		// 		</div>
		// 	</div>
		// 	<div className={style.bottom}>
		// 		<div className={style.grass}>
		// 			<span> </span>
		// 			<span> </span>
		// 			<span> </span>
		// 		</div>
		// 		<div className={style.grass}>
		// 			<span> </span>
		// 			<span> </span>
		// 			<span> </span>
		// 		</div>
		// 		<div className={style.grass}>
		// 			<span> </span>
		// 			<span> </span>
		// 			<span> </span>
		// 		</div>
		// 		<div className={style.grass}>
		// 			<span> </span>
		// 			<span> </span>
		// 			<span> </span>
		// 		</div>
		// 		<div className={style.circle}>
		// 			<span></span>
		// 			<span></span>
		// 			<span></span>
		// 			<span></span>
		// 			<span></span>
		// 		</div>
		// 		<div className={style.circle}>
		// 			<span></span>
		// 			<span></span>
		// 			<span></span>
		// 			<span></span>
		// 			<span></span>
		// 		</div>
		// 		<div className={style.circle}>
		// 			<span></span>
		// 			<span></span>
		// 			<span></span>
		// 			<span></span>
		// 			<span></span>
		// 		</div>
		// 		<div className={style.circle}>
		// 			<span></span>
		// 			<span></span>
		// 			<span></span>
		// 			<span></span>
		// 			<span></span>
		// 		</div>
		// 		<div className={style.grass_tw}></div>
		// 		<div className={style.grass_tw}></div>
		// 		<div className={style.grass_tw}></div>
		// 	</div>
		// </div>
		// 2
		// <div className="flex flex-col items-center justify-between flex-1 -mb-4">
		// 	<div className="flex-1 inline-flex flex-col items-center justify-center text-neutral-400 text-center font-bold px-4">
		// 		<h3 className="leading-tight" style={{ fontSize: "clamp(10rem, 15vw, 20rem)" }}>
		// 			404
		// 		</h3>
		// 		<p className="text-lg">這個頁面不存在</p>
		// 		<p className="text-normal">The page you are looking for doesn't exist.</p>
		// 		<div className="flex mt-6 gap-4">
		// 			<Button variant="" component={NavLink} to={"/"} className="!text-base !h-12 !rounded-full">
		// 				返回首頁
		// 			</Button>
		// 			<Button
		// 				variant=""
		// 				className="!text-base !h-12 !rounded-full"
		// 				onClick={() => {
		// 					navigate(-1);
		// 				}}>
		// 				返回上一頁
		// 			</Button>
		// 		</div>
		// 	</div>
		// </div>
		// 3
		// <div className="flex flex-col items-center justify-between flex-1 -mb-4">
		// 	<div className="flex-1 inline-flex flex-col items-center justify-center text-text text-center font-bold px-4">
		// 		<div class={style.scene}>
		// 			<div class={style.box}>
		// 				<div class={`${style.box__face} ${style.front}`}>4</div>
		// 				<div class={`${style.box__face} ${style.back}`}>0</div>
		// 				<div class={`${style.box__face} ${style.right}`}>4</div>
		// 				<div class={`${style.box__face} ${style.left}`}>0</div>
		// 				<div class={`${style.box__face} ${style.top}`}>0</div>
		// 				<div class={`${style.box__face} ${style.bottom}`}>0</div>
		// 			</div>
		// 			<div class={style.shadow}></div>
		// 		</div>
		// 		<p className="text-lg">這個頁面不存在</p>
		// 		<p className="text-normal">The page you are looking for doesn't exist.</p>
		// 		<div className="flex mt-6 gap-4">
		// 			<Button
		// 				variant="contained"
		// 				color="dark"
		// 				component={NavLink}
		// 				to={"/"}
		// 				className="!text-base !h-12 !rounded-full">
		// 				返回首頁
		// 			</Button>
		// 			<Button
		// 				variant="outlined"
		// 				color="dark"
		// 				className="!text-base !h-12 !rounded-full"
		// 				onClick={() => {
		// 					navigate(-1);
		// 				}}>
		// 				返回上一頁
		// 			</Button>
		// 		</div>
		// 	</div>
		// </div>
	);
};

export default ErrorPages;
