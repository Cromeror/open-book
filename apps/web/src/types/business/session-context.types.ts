/**
 * Session Context Business Type
 *
 * Flat object with resolved user context data.
 * Assembled by the API from User, UserState, and Condominium entities.
 */
export interface SessionContext {
  // User entity fields
  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  isSuperAdmin: boolean;

  // Condominium fields (resolved from UserState.selectedCondominiumId)
  condominiumId: string;
  condominiumName: string;

  // UserState preferences
  userStateTheme: string;
  userStateLanguage: string;
  userStateSidebarCollapsed: boolean;
}
