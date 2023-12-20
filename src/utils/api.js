// api.js
const appUrl = process.env.REACT_APP_URL;

// GET
const getData = async (url = "", customParam = false, forbiddenFunc, unauthorizedFunc) => {
	const accessToken = JSON.parse(localStorage.getItem("accessToken"));
	const headers = {
		mode: 'no-cors',
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

// POST
const postData = async (url = "", formData) => {
  const accessToken = JSON.parse(localStorage.getItem("accessToken"));
  const headers = {
		mode: 'no-cors',
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

// POST BODY AUTHOR: JEFF
const postBodyData = async (url = "", bodyData, paramsData) => {
  const accessToken = JSON.parse(localStorage.getItem("accessToken"));
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
  const params = new URLSearchParams(paramsData);
  var raw = JSON.stringify(bodyData);
  //console.log(raw);
  return await fetch(`${appUrl}/${url}`, {
    method: "POST",
    headers,
    body: raw,
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

// POST - Delete ver
const deleteData = async (url = "", formData) => {
  const accessToken = JSON.parse(localStorage.getItem("accessToken"));
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
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

export { getData, postData, postBodyData, deleteData };

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
