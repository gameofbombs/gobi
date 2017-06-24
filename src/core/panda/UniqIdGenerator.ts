namespace UniqIdGenerator {
	let counter:number = 0;
	export function getUniq():number {
		counter++;
		return counter;
	}
}