import { redirect } from "next/navigation";

/** Alias — canonical conversion path is /start. */
export default function SignupAliasPage() {
  redirect("/start");
}
