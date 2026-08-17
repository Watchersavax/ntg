export interface StoredUserData {
  userId?: number;
  agentId?: number;
  roleId?: number;
  displayName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isAgent?: boolean;
  isCorporate?: boolean;
  courtId?: number;
  authenticationToken?: string;
}

export function readUserData(): StoredUserData {
  try {
    return JSON.parse(localStorage.getItem("userdata")) || {};
  } catch (error) {
    return {};
  }
}

export function readUserId(): number {
  const userData = readUserData();
  return userData.userId;
}

export function readIsAgent(): boolean {
  return !!readUserData().isAgent;
}
