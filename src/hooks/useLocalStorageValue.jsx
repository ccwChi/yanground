import React, { useState, useEffect } from "react";

const useLocalStorageValue = (key) => {
	const [value, setValue] = useState(null);

	useEffect(() => {
		const checkLocalStorage = () => {
			const storedValue = JSON.parse(localStorage.getItem(key));

			if (storedValue) {
				setValue(storedValue);
				clearInterval(intervalId);
			}
		};

		const intervalId = setInterval(checkLocalStorage, 1000);

		return () => {
			clearInterval(intervalId);
		};
	}, [key]);

	return value;
};

export default useLocalStorageValue;

// How to Use
// const XXXXX(變數名稱) = useLocalStorageValue("LocalStorageKey");