import { Header } from "@/components/layout/header";
import { ContactTable } from "@/components/contacts/contact-table";
import { contacts } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserPlus, MessageCircle } from "lucide-react";

export default function ContactsPage() {
  const manyChatCount = contacts.filter((c) => c.source === "ManyChat").length;
  const crmCount = contacts.filter((c) => c.source === "CRM").length;

  return (
    <>
      <Header
        title="Contacts"
        description="Manage leads and customers from ManyChat, CRM, and imports"
        action={{ label: "Add Contact", href: "/contacts/new" }}
      />
      <div className="p-8 space-y-6 animate-fade-in">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-violet-100 p-3">
                <Users className="h-5 w-5 text-violet-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">12,480</p>
                <p className="text-sm text-muted-foreground">Total contacts</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-purple-100 p-3">
                <MessageCircle className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{manyChatCount}</p>
                <p className="text-sm text-muted-foreground">From ManyChat</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-blue-100 p-3">
                <UserPlus className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{crmCount}</p>
                <p className="text-sm text-muted-foreground">From CRM</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <ContactTable contacts={contacts} />
      </div>
    </>
  );
}
