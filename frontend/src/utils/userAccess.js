import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const ADMIN_ROLE = 'admin';

export async function loadUserAccess(uid) {
    const snapshot = await getDoc(doc(db, 'users', uid));

    if (!snapshot.exists()) {
        return {
            exists: false,
            role: null,
            data: null,
        };
    }

    const data = snapshot.data();

    return {
        exists: true,
        role: data.role ?? null,
        data,
    };
}

export function hasAdminRole(access) {
    return access?.role === ADMIN_ROLE;
}

export function getAdminAccessError(access) {
    if (!access?.exists) {
        return 'This account signed in successfully, but no Firestore user profile was found.';
    }

    if (!hasAdminRole(access)) {
        return 'Access denied. This account is not assigned the admin role.';
    }

    return '';
}
