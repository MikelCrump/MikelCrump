"use client";

import { QRCodeSVG } from "qrcode.react";
import type { Attendee } from "@/lib/types";
import { cn } from "@/lib/utils";

export function QrBadge({
  attendee,
  eventTitle,
  className,
  size = 148,
}: {
  attendee: Attendee;
  eventTitle?: string;
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-line bg-cloud p-5 shadow-[0_18px_40px_-28px_rgba(19,42,62,0.45)]",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-sea via-sea-bright to-star" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sea">
        {eventTitle ?? "Northstar"}
      </p>
      <p className="mt-2 font-display text-2xl leading-tight text-ink">
        {attendee.firstName} {attendee.lastName}
      </p>
      <p className="mt-1 text-sm text-ink-soft">
        {attendee.title} · {attendee.company}
      </p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-soft">Guest</p>
          <p className="text-sm font-semibold capitalize text-ink">
            {attendee.guestType}
          </p>
          <p className="mt-3 font-mono text-xs text-ink-soft">
            {attendee.confirmationCode}
          </p>
        </div>
        <div className="rounded-xl bg-paper p-2">
          <QRCodeSVG
            value={attendee.qrPayload}
            size={size}
            bgColor="transparent"
            fgColor="#132a3e"
            level="M"
          />
        </div>
      </div>
    </div>
  );
}
