"use client";

import { useState } from "react";
import { Mail, UserPlus, Shield, Trash2, MoreHorizontal } from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  type MemberRole,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

export default function TeamPage() {
  const team = useAppStore((s) => s.team);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const inviteMember = useAppStore((s) => s.inviteMember);
  const updateMemberRole = useAppStore((s) => s.updateMemberRole);
  const removeMember = useAppStore((s) => s.removeMember);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("editor");

  const handleInvite = () => {
    if (!inviteEmail.trim() || !inviteName.trim()) return;
    inviteMember(inviteEmail.trim(), inviteName.trim(), inviteRole);
    setInviteEmail("");
    setInviteName("");
    setInviteRole("editor");
    setShowInvite(false);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="border-b border-slate-200 bg-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Team</h1>
            <p className="mt-1 text-slate-500">
              Manage who has access to your workspace and what they can do.
            </p>
          </div>
          <Button onClick={() => setShowInvite(true)}>
            <UserPlus className="h-4 w-4" />
            Invite member
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-8 py-8">
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-3">
            <p className="text-sm font-medium text-slate-500">
              {team.length} member{team.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {team.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 px-5 py-4"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback style={{ backgroundColor: member.avatarColor }}>
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900">{member.name}</p>
                    {member.status === "pending" && (
                      <Badge variant="warning">Pending</Badge>
                    )}
                    {member.id === currentUserId && (
                      <Badge variant="secondary">You</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{member.email}</p>
                </div>

                {member.role === "owner" ? (
                  <Badge className="shrink-0">
                    <Shield className="mr-1 h-3 w-3" />
                    Owner
                  </Badge>
                ) : (
                  <div className="flex items-center gap-2">
                    <Select
                      value={member.role}
                      onValueChange={(v) =>
                        updateMemberRole(member.id, v as MemberRole)
                      }
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["admin", "editor", "commenter", "viewer"] as const).map(
                          (role) => (
                            <SelectItem key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded p-1 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4 text-slate-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => removeMember(member.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Role permissions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              ["owner", "admin", "editor", "commenter", "viewer"] as MemberRole[]
            ).map((role) => (
              <div
                key={role}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <p className="font-medium text-slate-900">{ROLE_LABELS[role]}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {ROLE_DESCRIPTIONS[role]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite team member</DialogTitle>
            <DialogDescription>
              They&apos;ll receive an email invitation to join your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Name</Label>
              <Input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Full name"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as MemberRole)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["admin", "editor", "commenter", "viewer"] as const).map(
                    (role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInvite(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite}>Send invite</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
