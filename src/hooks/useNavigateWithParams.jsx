import { useNavigate } from "react-router-dom";

const useNavigateWithParams = () => {
	const navigate = useNavigate();

	const navigateWithParams = (newPage, rowsPerPage, additionalParams = {}, havePage = true) => {
		// 獲取現有的查詢參數
		const currentParams = new URLSearchParams(window.location.search);

		if (havePage) {
			// 設置新的查詢參數
			currentParams.set("p", `${newPage}`);
			currentParams.set("s", `${rowsPerPage}`);
		}

		// 添加額外的查詢參數
		for (const param in additionalParams) {
			currentParams.set(param, additionalParams[param]);
		}

		// 將新的查詢參數添加到URL中並導航
		navigate(`?${currentParams.toString()}`);
	};

	return navigateWithParams;
};

export default useNavigateWithParams;

//****** How To Use ? ******//

// const YourComponent = () => {
//     const navigateWithParams = useNavigateWithParams();

//     useEffect(() => {
//       // 在 useEffect 中使用自定義 hook
//       navigateWithParams(1, 10, { filter: 'example' });
//     }, [navigateWithParams]);

//     return (
//       // 其他內容
//     );
//   };
