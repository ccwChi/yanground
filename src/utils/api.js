// api.js
const appUrl = process.env.REACT_APP_URL;

// GET
const getData = async (url = "") => {
	const accessToken = JSON.parse(localStorage.getItem("accessToken"));
	const headers = {
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
	};
	return await fetch(`${appUrl}/${url}`, {
		method: "GET",
		headers,
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
const postData = async (url = "", formData) => {
	const accessToken = JSON.parse(localStorage.getItem("accessToken"));
	const headers = {
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
	};
	const params = new URLSearchParams(formData);
	return await fetch(`${appUrl}/${url}?${params}`, {
		method: "POST",
		headers,
	})
		.then((response) => {
			return response.json().then((res) => {
				if (res.response === 200) return { status: true, result: res };
				else {
					return { status: false, result: res };
				}
			});
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
