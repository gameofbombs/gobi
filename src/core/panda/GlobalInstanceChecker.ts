namespace GlobalInstanceChecker {
	export type ItemType = {getIsValid:()=>boolean, getName:()=>string, uniqId:number};
	var set:{[key:number]:ItemType} = {};
	
	export function watch(item:ItemType) {
		set[item.uniqId] = item;
	}
	
	export function unWatch(item:ItemType) {
		delete set[item.uniqId];
	}

	export function check():void {
		for (let itemId in set) {
			let item = set[itemId];
			if (item && item.getIsValid()) {
				console.warn(new Error('Valid leaked iterator ' + item.getName()));
			}
		}
		set = {};
	}
}