import { Header } from "@/components/layout/header";
import { ContactTable } from "@/components/contacts/contact-table";
import { listBrevoContacts } from "@/lib/brevo";
import { listSupabaseContacts, isSupabaseConfigured } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Phone, Database } from "lucide-react";
import type { Contact } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const [crm, brevo] = await Promise.all([
    isSupabaseConfigured()
      ? listSupabaseContacts({ limit: 100 })
      : Promise.resolve({
          contacts: [] as Contact[],
          total: 0,
          source: "demo" as const,
          authMode: "none" as const,
          bySource: [],
          needsServiceRole: true,
        }),
    listBrevoContacts({ limit: 50 }),
  ]);

  const preferCrm = crm.source === "supabase" && !crm.needsServiceRole;
  const contacts = preferCrm ? crm.contacts : brevo.contacts;
  const total = preferCrm ? crm.total : brevo.total;
  const withPhone = contacts.filter((c) => Boolean(c.phone)).length;
  const subscribed = contacts.filter((c) => c.status === "subscribed").length;

  const sourceLabel = preferCrm
    ? "Command Center CRM"
    : brevo.source === "brevo"
      ? "Brevo"
      : "Not connected";

  return (
    <>
      <Header
        title="Contacts"
        description={
          preferCrm
            ? "Contacts synced from Reawaken Command Center (Supabase)"
            : "Contacts synced from your Brevo account"
        }
      />
      <div className="p-8 space-y-6 animate-fade-in">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={preferCrm || brevo.source === "brevo" ? "success" : "warning"}>
            {preferCrm ? "From Command Center" : sourceLabel}
          </Badge>
          {crm.source === "supabase" && crm.needsServiceRole && (
            <Badge variant="warning">
              CRM needs SUPABASE_SERVICE_ROLE_KEY
            </Badge>
          )}
          {preferCrm && brevo.source === "brevo" && (
            <Badge variant="secondary">
              Brevo also has {brevo.total.toLocaleString()} contacts
            </Badge>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-sky-100 p-3">
                <Users className="h-5 w-5 text-sky-700" />
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
                <p className="text-sm text-muted-foreground">
                  {preferCrm ? "Active (page)" : "Subscribed (page)"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-slate-100 p-3">
                {preferCrm ? (
                  <Database className="h-5 w-5 text-slate-700" />
                ) : (
                  <Phone className="h-5 w-5 text-slate-700" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {preferCrm
                    ? crm.bySource.filter((s) => s.count > 0).length
                    : withPhone}
                </p>
                <p className="text-sm text-muted-foreground">
                  {preferCrm ? "CRM sources with data" : "With phone (page)"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {preferCrm && crm.bySource.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {crm.bySource.map((source) => (
              <Badge key={source.table} variant="secondary">
                {source.tag}: {source.count.toLocaleString()}
                {source.error ? " (error)" : ""}
              </Badge>
            ))}
          </div>
        )}

        {contacts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <p className="font-medium">No contacts found</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              {crm.needsServiceRole && isSupabaseConfigured()
                ? "Command Center is linked, but Reawaken Communications needs the Supabase service role key to read CRM rows behind RLS."
                : preferCrm
                  ? "Add contacts in Command Center CRM and they will show up here."
                  : "Add contacts in Brevo or connect Command Center CRM."}
            </p>
          </div>
        ) : (
          <ContactTable contacts={contacts} />
        )}
      </div>
    </>
  );
}
