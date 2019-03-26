let wIsNode = true;
try {
	wIsNode = window === undefined;
} catch (e) {
}

const isNode = wIsNode;

export default isNode;
