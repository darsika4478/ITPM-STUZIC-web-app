/**
 * Email domain validation utility
 *
 * Prevents users from entering fake/non-existent email domains
 * (e.g. gmail.lk, yahoo.lk, hf.lk) by checking against a list
 * of known, real email provider domains.
 */

// Trusted email domains — covers 95%+ of real student emails
const ALLOWED_DOMAINS = [
    // Google
    'gmail.com',
    // Microsoft
    'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
    // Yahoo
    'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in', 'ymail.com',
    // Apple
    'icloud.com', 'me.com', 'mac.com',
    // Other popular
    'protonmail.com', 'proton.me', 'zoho.com', 'aol.com', 'mail.com',
    'gmx.com', 'gmx.net', 'yandex.com', 'tutanota.com',
    // Sri Lankan providers (for STUZIC's user base)
    'sltnet.lk', 'dialog.lk', 'mobitel.lk',
];

// Well-known provider names — if the domain *contains* one of these
// but isn't in the allow-list, it's almost certainly fake (e.g. gmail.lk)
const KNOWN_PROVIDER_NAMES = [
    'gmail', 'yahoo', 'outlook', 'hotmail', 'icloud',
    'protonmail', 'proton', 'zoho', 'aol', 'yandex',
    'live', 'msn', 'mail',
];

/**
 * Validate that an email domain is real / allowed.
 *
 * @param {string} email — full email address (already trimmed + lowercased)
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateEmailDomain(email) {
    if (!email || !email.includes('@')) {
        return { valid: false, message: 'Please enter a valid email address.' };
    }

    const domain = email.split('@')[1];

    if (!domain || domain.length < 3 || !domain.includes('.')) {
        return { valid: false, message: 'Please enter a valid email domain.' };
    }

    // 1 — Check if it's a known provider name with wrong TLD (e.g. gmail.lk)
    const domainBase = domain.split('.')[0]; // e.g. "gmail" from "gmail.lk"
    for (const provider of KNOWN_PROVIDER_NAMES) {
        if (domainBase === provider && !ALLOWED_DOMAINS.includes(domain)) {
            return {
                valid: false,
                message: `"${domain}" is not a valid email provider. Did you mean ${provider}.com?`,
            };
        }
    }

    // 2 — Check TLD is reasonable (at least 2 chars, common ones)
    const tld = domain.substring(domain.lastIndexOf('.') + 1);
    const VALID_TLDS = [
        'com', 'net', 'org', 'edu', 'gov', 'io', 'co', 'me', 'info', 'biz',
        'lk', 'uk', 'us', 'in', 'au', 'ca', 'de', 'fr', 'jp', 'kr', 'cn',
        'sg', 'nz', 'za', 'br', 'it', 'es', 'nl', 'se', 'no', 'fi', 'dk',
        'ie', 'at', 'ch', 'be', 'pt', 'pl', 'ru', 'mx', 'ae', 'pk', 'bd',
    ];

    if (!VALID_TLDS.includes(tld)) {
        return { valid: false, message: 'Please enter an email with a valid domain.' };
    }

    // 3 — If domain has only 1-2 char base before TLD (e.g. hf.lk) → suspicious
    if (domainBase.length < 3 && !ALLOWED_DOMAINS.includes(domain)) {
        return {
            valid: false,
            message: 'Please enter a valid email provider domain.',
        };
    }

    return { valid: true };
}
