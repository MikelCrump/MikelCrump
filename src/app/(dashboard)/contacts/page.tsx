import { Header } from "@/components/layout/header";
import { ContactTable } from "@/components/contacts/contact-table";
import { listBrevoContacts } from "@/lib/brevo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const { contacts, total, source } = await listBrevoContacts({ limit: 50 });
  const subscribed = contacts.filter((c) => c.status === "subscribed").length;
  const unsubscribed = contacts.filter((c) => c.status === "unsubscribed").length;

  return (
    <>
      <Header
        title="Contacts"
        description="Contacts synced from your Brevo account"
      />
      <div className="p-8 space-y-6 animate-fade-in">
        <div className="flex items-center gap-2">
          <Badge variant={source === "brevo" ? "success" : "warning"}>
            {source === "brevo" ? "From Brevo" : "Not connected"}
          </Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-violet-100 p-3">
                <Users className="h-5 w-5 text-violet-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{total.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total contacts</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-emerald-100 p-3">
                <UserCheck className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{subscribed.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Subscribed (page)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-slate-100 p-3">
                <UserX className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unsubscribed.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Unsubscribed (page)</p>
              </div>
            </CardContent>
          </Card>
        </div>
        {contacts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <p className="font-medium">No contacts found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add contacts in Brevo and they will show up here.
            </p>
          </div>
        ) : (
          <ContactTable contacts={contacts} />
        )}
      </div>
    </>
  );
}
