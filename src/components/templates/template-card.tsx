import Link from "next/link";
import { Mail, MessageSquare, Eye, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Template } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  template: Template;
  basePath: string;
}

export function TemplateCard({ template, basePath }: TemplateCardProps) {
  const isEmail = template.channel === "email";

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
      <CardContent className="p-0">
        <div
          className={cn(
            "h-32 p-4 text-xs leading-relaxed overflow-hidden",
            isEmail ? "bg-gradient-to-br from-indigo-50 to-white" : "bg-gradient-to-br from-emerald-50 to-white"
          )}
        >
          {isEmail && template.subject && (
            <p className="font-semibold text-sm mb-2 truncate">{template.subject}</p>
          )}
          <p className="text-muted-foreground line-clamp-4">{template.preview}</p>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                {template.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Updated {template.updatedAt} · Used {template.usageCount.toLocaleString()} times
              </p>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{template.category}</Badge>
              <Badge variant="outline" className="gap-1">
                {isEmail ? (
                  <Mail className="h-3 w-3" />
                ) : (
                  <MessageSquare className="h-3 w-3" />
                )}
                {isEmail ? "Email" : "SMS"}
              </Badge>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`${basePath}/${template.id}`}>
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
