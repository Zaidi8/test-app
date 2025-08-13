export type UserRole = "admin" | "tester" | "user"
export type User = {
  id: string
  role: UserRole
}

export function getUser() {
  return { id: "a", role: "user" } as User
}