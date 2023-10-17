import React from "react";
import {useRouteError} from "react-router-dom";

const ErrorMessage = () => {
	const error = useRouteError();
	console.error(error);

	return (
		<div>
			<h1>Oops!</h1>
			<p>Sorry, an unexpected error has occurred.</p>
			<p>{error.status}</p>
			<p>
				<i>{error.statusText || error.message}</i>
			</p>
			<p>{error.data}</p>
		</div>
	);
};

export default ErrorMessage;
