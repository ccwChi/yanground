import React from "react";
import { CircularProgress } from "@mui/material";
import loadingImgOne from "../../assets/images/loading.svg";
import "./loading.scss";

const Loading = ({ size = 80, classNames = "" }) => {
	return (
		<div className={`h-full flex flex-col justify-center items-center gap-5 ${classNames}`}>
			<CircularProgress color="inherit" size={size} />
			<p>
				載入中<span className="dotting"></span>{" "}
			</p>
		</div>
	);
};

const LoadingTwo = ({ size = 160, classNames = "", textSize = "text-2xl" }) => {
	return (
		<div className={`loader h-full flex flex-col justify-center items-center gap-5 ${classNames} ${textSize}`}>
			<div className="doughnut-container">
				<div className="doughnut-wrapper">
					<img className="doughnut-svg" src={loadingImgOne} width={size} />
				</div>
				<div className="doughnut-shadow"></div>
				<p className="mt-4">
					載入中<span className="dotting"></span>
				</p>
			</div>
		</div>
	);
};

const LoadingThree = ({
	classNames = "",
	textSize = "text-2xl", // tailwindCSS text Size
	pinwheelSize = "base", // xs, sm, base(default), md, lg
	stickHeight = "80px",
	pinwheelSpacingBottom = "0px", // when stickHeight = 0 選擇時最佳
}) => {
	return (
		<div className={`loader h-full flex flex-col justify-center items-center gap-5 ${classNames} ${textSize}`}>
			<div
				className={"pinwheel-container"}
				style={{
					"--size":
						pinwheelSize === "xs"
							? "0.7"
							: pinwheelSize === "sm"
							? "0.875"
							: pinwheelSize === "md"
							? "1.25"
							: pinwheelSize === "lg"
							? "1.5"
							: "1",
					marginBottom: `calc(30px + ${pinwheelSpacingBottom})`,
				}}>
				<div className="pin-1">
					<div className="pin-base"></div>
					<div className="pin-big-triangle"></div>
				</div>
				<div className="pin-2">
					<div className="pin-base"></div>
					<div className="pin-big-triangle"></div>
				</div>
				<div className="pin-3">
					<div className="pin-base"></div>
					<div className="pin-big-triangle"></div>
				</div>
				<div className="pin-4">
					<div className="pin-base"></div>
					<div className="pin-big-triangle"></div>
				</div>
				<div className="pinwheel-center-circle"></div>
			</div>
			<div className="pinwheel-stick" style={{ height: stickHeight }}></div>
			<p className="mt-4">
				載入中<span className="dotting"></span>
			</p>
		</div>
	);
};

export { Loading, LoadingTwo, LoadingThree };
