import { LoginClient } from "./LoginClient"

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {}
  const nextParam = params.next
  const nextPath = typeof nextParam === "string" ? nextParam : undefined
  return <LoginClient nextPath={nextPath} />
}
