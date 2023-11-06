import React, { useEffect, useState } from "react";
import { useRouteError } from "react-router-dom";
import "./ErrorMessage.scss";

const ErrorMessage = () => {
	const error = useRouteError();
	console.error('EM:' + error);
	const initialContent = `> <span>ERROR CODE</span>: "<i>${error.status} ${
		error.statusText || error.message
	}</i>"<br/> > <span>ERROR DESCRIPTION</span>: "<i>${error.data}</i>"<br/> > <span>HAVE A NICE DAY :-)</span>`;
	const [content, setContent] = useState("");
	const [showCursor, setShowCursor] = useState(false);

	useEffect(() => {
		const displayContent = () => {
			let i = 0;
			const se = setInterval(() => {
				i++;
				setContent(initialContent.slice(0, i));
				if (i === initialContent.length) {
					clearInterval(se);
					setShowCursor(true);
				}
			}, 10);
		};

		displayContent();
	}, []);

	return (
		<div className="body">
			<h1>{error.status}</h1>
			<div dangerouslySetInnerHTML={{ __html: content }} />
			{showCursor}
		</div>
	);

	// return (
	// <div>
	// 	<h1>Oops!</h1>
	// 	<p>Sorry, an unexpected error has occurred.</p>
	// 	<p>{error.status}</p>
	// 	<p>
	// 		<i>{error.statusText || error.message}</i>
	// 	</p>
	// 	<p>{error.data}</p>
	// </div>
	// );
};

export default ErrorMessage;
