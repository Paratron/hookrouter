let wIsNode = true;
try {
	wIsNode = window === undefined;
} catch (e) {
}

export default wIsNode;
