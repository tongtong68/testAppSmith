export default {
	async fetchZooData(selectedPlatform) {
		let result = [];  // 初始化 result 为一个空数组
		try {
			switch (selectedPlatform) {
				case 'CTRIP':
					result = (await zoo_ctrip.run()).resources.map((resource) => {
						return {
							name: resource.fullName,  // 设置 name 为 fullName
							price: resource.displayPrice  // 设置 price 为 displayPrice
						};
					});
					break;

				case 'KLOOK':
					result = (await zoo_klook.run()).result.packages.map((pkg) => { // 使用 'pkg' 代替 'package'
						return {
							name: pkg.package_name,  // 设置 name 为 package_name
							price: pkg.sell_price  // 设置 price 为 sell_price
						};
					});
					break;

				case 'KKDAY':
					result = (await zoo_kkday.run()).data.packages.map((pkg) => { // 使用 'pkg' 代替 'package'
						return {
							price: pkg.max_price_info.display_max_price, // 设置 name 为 display_max_price
							name: pkg.name  // 设置 price 为 package_desc
						};
					});
					break;

				case 'TRIP':
					result = (await zoo_trip.run()).resources.map((resource) => {
						return {
							name: resource.name,  // 设置 name 为 fullName
							price: resource.displayPrice  // 设置 price 为 displayPrice
						};
					});
					break;

					// 如果有 TRAVELOKA, 可使用以下代码
					// case 'TRAVELOKA':
					//   result = await queryTraveloka.run();
					//   break;

				default:
					showAlert("No matching query found for the selected platform", "error");
					return;
			}

			// 检查返回的结果
			if (!result || result.length === 0) {
				showAlert("No data returned for the selected platform", "warning");
				return;
			}

			// 将查询结果存储到全局变量
			await storeValue('tableData', result);

		} catch (error) {
			showAlert(`Error occurred: ${error.message}`, "danger");
		}
	}
}
