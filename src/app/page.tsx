import { redirect } from "next/navigation";
import { PRODUCT_START } from "@/lib/site";

/** Product root — conversion lives at /start. */
export default function ProductRootPage() {
  redirect(PRODUCT_START);
}
