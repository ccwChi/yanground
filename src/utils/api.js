// api.js

const accessToken =
	"eyJhbGciOiJIUzI1NiJ9.wImX6r-sy6D1pTEcWlvnjJv5KfOCupE19JZk7toqRnweNNVR36RtuUOCmNohAPUGtlOYAz-ASKKo9pkFT9WRxbBKdqbGR4JKj3P2UqR9mKFMMF4Z1MckUbFHAoS4HMGF330814xK2p4vGuhWpbSH1hk_ACagwwzKMi1qEYKmuJQ.YL69XPHzlb5Oz1TDznkuREI7zPceg1vdClSq928IKOI";
const headers = {
	Authorization: `Bearer ${accessToken}`,
	"Content-Type": "application/json",
};

// GET
const getData = (url) => {
	return fetch(url, {
		method: "GET",
		headers: headers,
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error(`Network response was not ok: ${response.status}`);
			}
			return response.json();
		})
		.catch((error) => {
			console.error("Error:", error);
			throw error;
		});
};

// POST
const postData = (url, data) => {
	return fetch(url, {
		method: "POST",
		headers: headers,
		body: JSON.stringify(data),
	})
		.then((response) => {
			return response.json();
		})
		.catch((error) => {
			throw error;
		});
};

export { getData, postData };
