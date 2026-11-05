export type User = {
  name: string
}

export const greet = (user: User) => `Привет, ${user.name}`
