// api.js
const appUrl = process.env.REACT_APP_URL;

// GET
const getData = async (url = "", customParam = false, forbiddenFunc, unauthorizedFunc, internalservererrorFunc) => {
	const accessToken = JSON.parse(localStorage.getItem("accessToken"));
	const headers = {
		mode: "no-cors",
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
	};

	return await fetch(`${appUrl}/${url}`, {
		method: "GET",
		headers,
	})
		.then((response) => {
			if (!response.ok) {
				const statusCode = response.status;
				console.error("HTTP Error: Status Code", statusCode);
				if (statusCode === 403) {
					if (customParam) {
						forbiddenFunc();
					} else {
						window.location.href = "/forbidden";
					}
				} else if (statusCode === 401) {
					if (customParam) {
						unauthorizedFunc();
					} else {
						window.location.href = "/unauthorized";
					}
				} else if (statusCode === 500) {
					if (customParam) {
						internalservererrorFunc();
					} else {
						window.location.href = "/internalservererror";
					}
				}
			}
			return response.json();
		})
		.catch((error) => {
			console.error("System Error：", error);
			// throw error;
			return error.message;
		});
};

// GET (File)
const getDownloadData = async (
	url = "",
	customParam = false,
	forbiddenFunc,
	unauthorizedFunc,
	internalservererrorFunc
) => {
	const accessToken = JSON.parse(localStorage.getItem("accessToken"));
	const headers = {
		mode: "no-cors",
		Authorization: `Bearer ${accessToken}`,
	};

	return await fetch(`${appUrl}/${url}`, {
		method: "GET",
		headers,
	})
		.then((response) => {
			if (!response.ok) {
				const statusCode = response.status;
				console.error("HTTP Error: Status Code", statusCode);
			}

			if (response.headers.get("Content-Disposition")) {
				const match = response.headers.get("Content-Disposition").match(/filename\*?=utf-8''([^;]+)/);
				const filename = match ? decodeURIComponent(match[1]) : null;
				response.blob().then((blob) => {
					let url = window.URL.createObjectURL(blob);
					let a = document.createElement("a");
					a.href = url;
					a.download = filename;
					a.click();
				});
			} else {
				return response.json();
			}
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
		mode: "no-cors",
		Authorization: `Bearer ${accessToken}`,
	};
	const params = new URLSearchParams(formData);
	return await fetch(`${appUrl}/${url}?${params}`, {
		method: "POST",
		headers,
	})
		.then((response) => {
			return response.json().then((res) => {
				if (res.response === 200) return { status: true, result: res };
				else if (res.status === 500) {
					return { status: false, result: "回傳 500 錯誤" };
				} else {
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

// POST: Body & Params
const postBodyData = async (url = "", bodyData, paramsData) => {
	const accessToken = JSON.parse(localStorage.getItem("accessToken"));
	const headers = {
		mode: "no-cors",
		Authorization: `Bearer ${accessToken}`,
	};
	const params = new URLSearchParams(paramsData);
	var raw = JSON.stringify(bodyData);
	// console.log(raw);
	return await fetch(`${appUrl}/${url}?${params}`, {
		method: "POST",
		headers,
		body: raw,
	})
		.then((response) => {
			return response.json().then((res) => {
				if (res.response === 200) return { status: true, result: res };
				else if (res.status === 500) {
					return { status: false, result: "回傳 500 錯誤" };
				} else {
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

// POST: Body & Params - without JSON.stringify
const postBPData = async (url = "", bodyData, paramsData) => {
	const accessToken = JSON.parse(localStorage.getItem("accessToken"));
	const headers = {
		mode: "no-cors",
		Authorization: `Bearer ${accessToken}`,
	};
	const params = new URLSearchParams(paramsData);
	return await fetch(`${appUrl}/${url}?${params}`, {
		method: "POST",
		headers,
		body: bodyData,
	})
		.then((response) => {
			return response.json().then((res) => {
				if (res.response === 200) return { status: true, result: res };
				else if (res.status === 500) {
					return { status: false, result: "回傳 500 錯誤" };
				} else {
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

// DELETE
const deleteData = async (url = "", formData) => {
	const accessToken = JSON.parse(localStorage.getItem("accessToken"));
	const headers = {
		Authorization: `Bearer ${accessToken}`,
	};
	const params = new URLSearchParams(formData);
	return await fetch(`${appUrl}/${url}?${params}`, {
		method: "DELETE",
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

// PUT
const putData = async (url = "", customParam = false, forbiddenFunc, unauthorizedFunc, internalservererrorFunc) => {
	const accessToken = JSON.parse(localStorage.getItem("accessToken"));
	const headers = {
		Authorization: `Bearer ${accessToken}`,
	};
	return await fetch(`${appUrl}/${url}`, {
		method: "PUT",
		headers,
	})
		.then((response) => {
			return response.json().then((res) => {
				if (res.response === 200) return { status: true, result: res };
				else {
					return { status: false, result: res };
				}
			});
		})
		.catch((error) => {
			console.error("System Error：", error);
			// throw error;
			return { status: false, result: error.message };
		});
};

export { getData, getDownloadData, postData, postBodyData, postBPData, deleteData, putData };

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
