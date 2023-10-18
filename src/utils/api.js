// api.js
const appUrl = process.env.REACT_APP_URL;
const accessToken = JSON.parse(localStorage.getItem("accessToken"));
const headers = {
	Authorization: `Bearer ${accessToken}`,
	"Content-Type": "application/json",
};

// GET
const getData = (url = "") => {
	return fetch(`${appUrl}/${url}`, {
		method: "GET",
		headers: headers,
	})
		.then((response) => {
			return response.json();
		})
		.catch((error) => {
			console.error("System Error：", error);
			// throw error;
			return error.message;
		});
};

// POST
const postData = (url = "", data) => {
	return fetch(`${appUrl}/${url}`, {
		method: "POST",
		headers: headers,
		body: JSON.stringify(data),
	})
		.then((response) => {
			if (response.status === 200) {
				return { status: true };
			} else if (response.status === 400) {
				return response.json().then((json) => {
					return { status: false, result: json };
				});
			} else {
				return { status: false, result: response.status };
			}
			// return response.json();
		})
		.catch((error) => {
			console.error("System Error：", error);
			// throw error;
			return { status: false, result: error.message };
		});
};

export { getData, postData };

//****** How To Use ? ******//

// GET
// getData(url).then((result) => setGetDataResult(result));

// POST
// e.g. url = "project/7044555410912577110";
// 			const data = {
// 				name: "AAAB",
// 				administrativeDivision: "",
// 				street: "AAAB",
// 				businessRepresentative: "7030915114245031340",
// 			};
//
// postData(url, data).then((result) => {
// 	if (result.status) {
// 		// ok message
// 	} else {
// 		// error message
// 	}
// });
