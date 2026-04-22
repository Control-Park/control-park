import type { UserProfile } from "../api/user";

export function getProfileDisplayName(profile: UserProfile | null): string {
  if (!profile) {
    return "Guest";
  }

  const legalName = `${profile.first_name} ${profile.last_name}`.trim();

  switch (profile.host_display_name) {
    case "last":
      return profile.last_name.trim() || legalName || "Guest";
    case "legal":
      return legalName || "Guest";
    case "first":
    default:
      return profile.first_name.trim() || legalName || "Guest";
  }
}

export function getProfileInitial(profile: UserProfile | null): string {
  const displayName = getProfileDisplayName(profile);
  return (displayName[0] ?? "?").toUpperCase();
}
