/** Projection of a user that is allowed into the admin panel. */
export interface AdminUser {
  id: string;
  email: string;
  supabaseId: string | null;
}

/**
 * Read side of the local user directory for admin authentication: the
 * identity provider proves who the caller is, this repository decides
 * whether that identity holds the `admin` role.
 */
export interface AdminUserRepository {
  findAdminByEmail(email: string): Promise<AdminUser | null>;
  /** Persists the provider id after the first successful login. */
  linkSupabaseId(userId: string, supabaseId: string): Promise<void>;
}
