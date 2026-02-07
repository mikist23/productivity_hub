import { SignupClient } from "./SignupClient"

type SignupPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = (await searchParams) ?? {}
  const nextParam = params.next
  const nextPath = typeof nextParam === "string" ? nextParam : undefined
  return <SignupClient nextPath={nextPath} />
}
