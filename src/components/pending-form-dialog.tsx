"use client";

import { useId, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createPending, updatePending } from "@/app/actions";
import { pendingSchema, type PendingFormValues } from "@/lib/validation";
import { toDateInputValue } from "@/lib/dates";
import type { Owner, Importance, Pending } from "@/generated/prisma/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OWNER_LABELS: Record<Owner, string> = { JAVIER: "Javier", ANDY: "Andy" };
const IMPORTANCE_LABELS: Record<Importance, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};
const ownerItems = Object.entries(OWNER_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const importanceItems = Object.entries(IMPORTANCE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

type Props =
  | {
      mode: "create";
      currentUser: Owner;
      topics: string[];
      trigger: React.ReactNode;
    }
  | {
      mode: "edit";
      pending: Pending;
      topics: string[];
      trigger: React.ReactNode;
    };

export function PendingFormDialog(props: Props) {
  const [open, setOpen] = useState(false);
  const topicListId = useId();

  const defaultValues: PendingFormValues =
    props.mode === "edit"
      ? {
          title: props.pending.title,
          description: props.pending.description,
          topic: props.pending.topic,
          dueDate: toDateInputValue(new Date(props.pending.dueDate)),
          importance: props.pending.importance,
          owner: props.pending.owner,
        }
      : {
          title: "",
          description: "",
          topic: "",
          dueDate: toDateInputValue(new Date()),
          importance: "MEDIUM",
          owner: props.currentUser,
        };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PendingFormValues>({
    resolver: zodResolver(pendingSchema),
    defaultValues,
  });

  async function onSubmit(values: PendingFormValues) {
    const result =
      props.mode === "edit"
        ? await updatePending(props.pending.id, values)
        : await createPending(values);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(props.mode === "edit" ? "Pending updated" : "Pending added");
    setOpen(false);
    if (props.mode === "create") reset(defaultValues);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) reset(defaultValues);
      }}
    >
      <DialogTrigger render={props.trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {props.mode === "edit" ? "Edit pending" : "New pending"}
          </DialogTitle>
          <DialogDescription>
            {props.mode === "edit"
              ? "Update the details for this card."
              : "Add something that needs to get done."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Renew car insurance" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              list={topicListId}
              placeholder="Home, Finances, Errands…"
              autoComplete="off"
              {...register("topic")}
            />
            <datalist id={topicListId}>
              {props.topics.map((topic) => (
                <option key={topic} value={topic} />
              ))}
            </datalist>
            {errors.topic && (
              <p className="text-xs text-destructive">{errors.topic.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Any details worth remembering"
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueDate">Due date</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
              {errors.dueDate && (
                <p className="text-xs text-destructive">{errors.dueDate.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Importance</Label>
              <Controller
                control={control}
                name="importance"
                render={({ field }) => (
                  <Select
                    items={importanceItems}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? field.value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(IMPORTANCE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Owner</Label>
            <Controller
              control={control}
              name="owner"
              render={({ field }) => (
                <Select
                  items={ownerItems}
                  value={field.value}
                  onValueChange={(value) => field.onChange(value ?? field.value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(OWNER_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {props.mode === "edit" ? "Save changes" : "Add pending"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
