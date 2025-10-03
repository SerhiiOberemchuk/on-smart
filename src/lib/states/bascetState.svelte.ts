export const BASCET_LOCAL = 'BASCET_STORAGE';
export type Bascet = {
	id: string;
	qnt: number;
};
class StateBascet {
	bascet = $state<Bascet[] | []>([]);
	constructor() {
		if (typeof window === 'undefined') return;
		const store = localStorage.getItem(BASCET_LOCAL);
		if (store) this.bascet = JSON.parse(store!);
	}
	private setToLocal = () => localStorage.setItem(BASCET_LOCAL, JSON.stringify(this.bascet));

	setProduct({ id, qnt }: Bascet) {
		if (typeof window === 'undefined') return;
		if (!this.bascet) {
			this.bascet = [{ id, qnt }];
			this.setToLocal();
		} else {
			const index = this.bascet.findIndex((i) => i.id === id);
			if (index === -1) {
				this.bascet = [...this.bascet, { id, qnt }];
				this.setToLocal();
			} else {
				if (this.bascet[index].qnt === qnt) return;
				this.bascet[index].qnt = qnt;
				this.setToLocal();
			}
		}
	}
	delProduct({ id }: Bascet) {
		if (typeof window === 'undefined') return;
		const filtered = this.bascet?.filter((i) => i.id !== id);
		this.bascet = [...filtered];
		this.setToLocal();
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
