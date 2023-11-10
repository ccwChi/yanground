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

const LoadingTwo = ({ size = 160, classNames = "", textSize = "text-xl sm:text-2xl" }) => {
	return (
		<div className={`loader h-full flex flex-col justify-center items-center gap-5 ${classNames} ${textSize}`}>
			<div className="doughnut-container">
				<div className="doughnut-wrapper">
					<img className="doughnut-svg" src={loadingImgOne} width={size} />
				</div>
				<div className="doughnut-shadow"></div>
				<p className="mt-4 tracking-wider">
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
			<p className="mt-4 tracking-wider">
				載入中<span className="dotting"></span>
			</p>
		</div>
	);
};

const LoadingFour = ({ classNames = "", textSize = "text-lg sm:text-xl" }) => {
	return (
		<div className={`loader h-full flex flex-col justify-center items-center gap-5 ${classNames} ${textSize}`}>
			<div className="rocket">
				<div className="rocket__body">
					<div className="rocket__body__window">
						<div className="shadow"></div>
					</div>
					<div className="rocket__body__inner">
						<div className="shadow"></div>
					</div>
				</div>
				<div className="rocket__wing rocket__wing--left"></div>
				<div className="rocket__wing rocket__wing--right">
					<div className="shadow shadow--full"></div>
				</div>
				<div className="rocket__smoke rocket__smoke--left">
					<div className="rocket__smoke__inner">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div className="rocket__smoke rocket__smoke--left">
					<div className="rocket__smoke__inner">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div className="rocket__smoke rocket__smoke--left">
					<div className="rocket__smoke__inner">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div className="rocket__smoke rocket__smoke--left">
					<div className="rocket__smoke__inner">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div className="rocket__smoke rocket__smoke--left">
					<div className="rocket__smoke__inner">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div className="rocket__smoke rocket__smoke--right">
					<div className="rocket__smoke__inner">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div className="rocket__smoke rocket__smoke--right">
					<div className="rocket__smoke__inner">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div className="rocket__smoke rocket__smoke--right">
					<div className="rocket__smoke__inner">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div className="rocket__smoke rocket__smoke--right">
					<div className="rocket__smoke__inner">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div className="rocket__smoke rocket__smoke--right">
					<div className="rocket__smoke__inner">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div className="rocket__fire"></div>
			</div>
			<p className="mt-9 tracking-wider">
				處理中，請稍候<span className="dotting"></span>
			</p>
		</div>
	);
};

export { Loading, LoadingTwo, LoadingThree, LoadingFour };
