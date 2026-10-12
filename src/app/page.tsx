import { redirect } from "next/navigation";

/** Life Ops is the public home for mikelcrump.com; studio stays under /projects. */
export default function HomePage() {
  redirect("/life");
}
