/**
 * Cookie names get the `__Host-` prefix in production so they can only be
 * set over HTTPS, with Path=/ and no Domain (no subdomain overwrites). The
 * info cookie is intentionally readable by client-side JS and carries no
 * sensitive data.
 */
const hostPrefix = process.env.NODE_ENV === 'production' ? '__Host-' : '';

export const ADMIN_ACCESS_COOKIE = `${hostPrefix}agentrepo_admin_session`;
export const ADMIN_REFRESH_COOKIE = `${hostPrefix}agentrepo_admin_refresh`;
export const ADMIN_INFO_COOKIE = 'agentrepo_admin_info';
