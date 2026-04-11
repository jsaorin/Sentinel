export type DecodedPermissions = {
	initiate: boolean;
	vote: boolean;
	execute: boolean;
};

export function decodePermissionsMask(mask: number): DecodedPermissions {
	return {
		initiate: (mask & 1) !== 0,
		vote: (mask & 2) !== 0,
		execute: (mask & 4) !== 0,
	};
}
