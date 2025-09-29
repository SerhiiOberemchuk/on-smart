class StateBascet {
	qnt = $state<number>(5);
	setQnt(value: number) {
		this.qnt = value;
	}
	up1() {
		this.qnt += 1;
	}
}
export const stateBascet = new StateBascet();

// export function stateBascetFn() {
// 	let qnt = $state(11);
// 	function setQnt(value: number) {
// 		qnt = value;
// 	}
// 	return {
// 		get qnt() {
// 			return qnt;
// 		},
// 		set qnt(value) {
// 			qnt = value;
// 		},
// 		setQnt
// 	};
// }
