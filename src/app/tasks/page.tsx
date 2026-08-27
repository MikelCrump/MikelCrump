"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTasksStore } from "@/lib/tasks-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function TasksPage() {
  const tasks = useTasksStore((s) => s.tasks);
  const addTask = useTasksStore((s) => s.addTask);
  const toggleTask = useTasksStore((s) => s.toggleTask);
  const removeTask = useTasksStore((s) => s.removeTask);
  const [title, setTitle] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title);
    setTitle("");
  };

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10">
      <header className="animate-steward-rise mb-8">
        <p className="text-sm font-medium text-[var(--accent)]">Productivity</p>
        <h1 className="font-display mt-2 text-4xl text-[var(--ink)]">Tasks</h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]/75">
          Capture what needs doing. We’ll layer reminders and sync later.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="widget-panel animate-steward-rise delay-1 mb-6 flex gap-2 p-3"
      >
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add something to take care of…"
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        <Button
          type="submit"
          className="bg-[var(--accent)] hover:bg-[var(--accent-deep)]"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </form>

      <section className="widget-panel animate-steward-rise delay-2 p-5">
        <h2 className="mb-4 text-sm font-semibold text-[var(--ink)]">
          Open · {open.length}
        </h2>
        <ul className="space-y-1">
          {open.map((task) => (
            <li
              key={task.id}
              className="group flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/60"
            >
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                className="h-5 w-5 rounded border border-[var(--line)] bg-white"
                aria-label={`Complete ${task.title}`}
              />
              <span className="flex-1 text-sm text-[var(--ink)]">
                {task.title}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-[var(--ink-soft)]/50">
                {task.tag}
              </span>
              <button
                type="button"
                onClick={() => removeTask(task.id)}
                className="opacity-0 transition group-hover:opacity-100"
                aria-label={`Delete ${task.title}`}
              >
                <Trash2 className="h-3.5 w-3.5 text-[var(--danger)]" />
              </button>
            </li>
          ))}
          {open.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--ink-soft)]/60">
              All clear for now.
            </p>
          ) : null}
        </ul>
      </section>

      {done.length > 0 ? (
        <section className="widget-panel animate-steward-rise delay-3 mt-4 p-5">
          <h2 className="mb-4 text-sm font-semibold text-[var(--ink)]">
            Done · {done.length}
          </h2>
          <ul className="space-y-1">
            {done.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-3 rounded-xl px-2 py-2"
              >
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className="flex h-5 w-5 items-center justify-center rounded border border-[var(--accent)] bg-[var(--accent)]"
                  aria-label={`Reopen ${task.title}`}
                >
                  <span className="block h-1.5 w-1.5 rounded-sm bg-white" />
                </button>
                <span
                  className={cn(
                    "flex-1 text-sm text-[var(--ink-soft)]/50 line-through"
                  )}
                >
                  {task.title}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
