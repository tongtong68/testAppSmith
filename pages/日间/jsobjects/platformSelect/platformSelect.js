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
					result = (await zoo_trip.run()).resources
						.filter((resource) => resource.name)  // 先过滤掉 name 为 undefined 或空字符串的资源
						.map((resource) => {
						return {
							name: resource.name,  // 设置 name 为 fullName
							price: resource.displayPrice  // 设置 price 为 displayPrice
						};
					});
					break;

					// 如果有 TRAVELOKA, 可使用以下代码
				case 'TRAVELOKA':
					// 假设一个汇率，1 马来西亚币 (MYR) = 1.5 人民币 (CNY)
					const exchangeRateMYRtoCNY = 1.65;
					// 获取包含 id 和 price 的结果
					const priceDetails = (await zoo_part1_traveloka.run()).data.defaultExperienceTicketIdWithPriceDetails;
					// 获取包含 id 和 name 的结果
					const nameDetails = (await zoo_part2_traveloka.run()).data.ticketTypeDisplays;

					// 构建一个 id 到 name 的映射表
					const idToNameMap = new Map(nameDetails.map((detail) => [detail.experienceTicketId, detail.title]));

					// 合并 id 和 price，根据 id 获取 name，并计算实际价格
					result = priceDetails.map((detail) => {
						const name = idToNameMap.get(detail.experienceTicketId); // 根据 id 获取 name
						const amount = detail.ticketPrice.discountedPrice.currencyValue.amount;
						const actualPrice = amount / Math.pow(10, detail.ticketPrice.discountedPrice.numOfDecimalPoint); // 根据小数点位数计算实际价格

						return {
							name,  // 设置 name
							price: Math.floor(actualPrice * exchangeRateMYRtoCNY) // 设置计算后的实际价格
						};
					}).filter((item) => item.name); // 过滤掉没有 name 的项
					break;

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
