import { LoginClient } from "./LoginClient"

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {}
  const nextParam = params.next
  const nextPath = typeof nextParam === "string" ? nextParam : undefined
  const emailParam = params.email
  const initialEmail = typeof emailParam === "string" ? emailParam : undefined
  return <LoginClient nextPath={nextPath} initialEmail={initialEmail} />
}
