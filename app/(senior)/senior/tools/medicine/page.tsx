"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Pill,
  Plus,
  Clock,
  Trash2,
  Bell,
  BellOff,
  Check,
  X,
  Sun,
  Moon,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getReminders,
  addReminder,
  deleteReminder,
  type Reminder,
} from "@/app/actions/reminders";

// Validation Schema
const reminderSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is required").max(100),
  dosage: z.string().optional(),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  days: z.array(z.string()).min(1, "Select at least one day"),
});

type ReminderForm = z.infer<typeof reminderSchema>;

const DAYS = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
];

const QUICK_TIMES = [
  { time: "08:00", label: "Morning", icon: Sun },
  { time: "13:00", label: "Afternoon", icon: Coffee },
  { time: "21:00", label: "Night", icon: Moon },
];

export default function MedicineReminderPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ReminderForm>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      medicineName: "",
      dosage: "",
      time: "08:00",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    },
  });

  const watchedDays = watch("days");
  const watchedTime = watch("time");

  // Load reminders on mount
  useEffect(() => {
    const loadReminders = async () => {
      const data = await getReminders();
      setReminders(data);
    };
    loadReminders();
  }, []);

  // Request notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  // Check for reminders every minute
  useEffect(() => {
    if (!notificationsEnabled) return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const currentDay = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

      reminders.forEach((reminder) => {
        if (
          reminder.time === currentTime &&
          reminder.days.includes(currentDay) &&
          reminder.is_active
        ) {
          // Show notification
          new Notification("Medicine Reminder 💊", {
            body: `Time to take: ${reminder.medicine_name}${reminder.dosage ? ` (${reminder.dosage})` : ""}`,
            icon: "/pill-icon.png",
            tag: reminder.id,
          });

          // Speak the reminder
          if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(
              `Time to take your medicine: ${reminder.medicine_name}`
            );
            utterance.rate = 0.85;
            window.speechSynthesis.speak(utterance);
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [reminders, notificationsEnabled]);

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");

      if (permission === "granted" && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(
          "Notifications enabled! You'll receive reminders when it's time to take your medicine."
        );
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const onSubmit = async (data: ReminderForm) => {
    startTransition(async () => {
      const result = await addReminder(
        data.medicineName,
        data.time,
        data.days,
        data.dosage
      );

      if (result.success) {
        const updatedReminders = await getReminders();
        setReminders(updatedReminders);
        setIsDialogOpen(false);
        reset();

        // Speak confirmation
        if (window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(
            `Reminder added for ${data.medicineName}`
          );
          utterance.rate = 0.85;
          window.speechSynthesis.speak(utterance);
        }
      }
    });
  };

  const handleDelete = (reminderId: string, medicineName: string) => {
    startTransition(async () => {
      const result = await deleteReminder(reminderId);
      if (result.success) {
        setReminders((prev) => prev.filter((r) => r.id !== reminderId));

        if (window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(
            `Reminder for ${medicineName} removed`
          );
          utterance.rate = 0.85;
          window.speechSynthesis.speak(utterance);
        }
      }
    });
  };

  const toggleDay = (day: string) => {
    const current = watchedDays || [];
    if (current.includes(day)) {
      setValue(
        "days",
        current.filter((d) => d !== day)
      );
    } else {
      setValue("days", [...current, day]);
    }
  };

  const getTimeOfDay = (time: string) => {
    const hour = parseInt(time.split(":")[0]);
    if (hour < 12) return { label: "Morning", icon: Sun, color: "amber" };
    if (hour < 17) return { label: "Afternoon", icon: Coffee, color: "blue" };
    return { label: "Night", icon: Moon, color: "indigo" };
  };

  return (
    <div className="max-w-2xl mx-auto pb-32">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/senior/dashboard">
          <Button variant="ghost" size="icon" className="h-12 w-12">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Medicine Reminders</h1>
          <p className="text-stone-600">Never miss a dose</p>
        </div>
      </div>

      {/* Notification Permission Banner */}
      {!notificationsEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BellOff className="h-6 w-6 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-800">
                      Enable Notifications
                    </p>
                    <p className="text-sm text-amber-700">
                      Get reminded when it's time
                    </p>
                  </div>
                </div>
                <Button
                  onClick={requestNotificationPermission}
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  <Bell className="mr-2 h-5 w-5" />
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Add Reminder Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="w-full h-16 text-xl mb-8 bg-green-500 hover:bg-green-600 scale-hover"
          >
            <Plus className="mr-3 h-6 w-6" />
            Add New Reminder
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Pill className="h-6 w-6 text-green-500" />
              Add Medicine
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* Medicine Name */}
            <div>
              <Label className="text-lg">Medicine Name *</Label>
              <Input
                {...register("medicineName")}
                placeholder="e.g., Blood Pressure Tablet"
                className="h-14 text-lg mt-2"
              />
              {errors.medicineName && (
                <p className="text-red-500 mt-1">{errors.medicineName.message}</p>
              )}
            </div>

            {/* Dosage (Optional) */}
            <div>
              <Label className="text-lg">Dosage (Optional)</Label>
              <Input
                {...register("dosage")}
                placeholder="e.g., 1 tablet, 5ml"
                className="h-14 text-lg mt-2"
              />
            </div>

            {/* Quick Time Selection */}
            <div>
              <Label className="text-lg">Time *</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {QUICK_TIMES.map((qt) => {
                  const Icon = qt.icon;
                  return (
                    <Button
                      key={qt.time}
                      type="button"
                      variant={watchedTime === qt.time ? "default" : "outline"}
                      className="h-14 flex flex-col"
                      onClick={() => setValue("time", qt.time)}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-sm">{qt.label}</span>
                    </Button>
                  );
                })}
              </div>
              <Input
                {...register("time")}
                type="time"
                className="h-14 text-lg mt-3"
              />
              {errors.time && (
                <p className="text-red-500 mt-1">{errors.time.message}</p>
              )}
            </div>

            {/* Days Selection */}
            <div>
              <Label className="text-lg">Days *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DAYS.map((day) => (
                  <Button
                    key={day.key}
                    type="button"
                    variant={watchedDays?.includes(day.key) ? "default" : "outline"}
                    className="h-12 w-12"
                    onClick={() => toggleDay(day.key)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
              {errors.days && (
                <p className="text-red-500 mt-1">{errors.days.message}</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-14"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-14 bg-green-500 hover:bg-green-600"
                disabled={isPending}
              >
                {isPending ? "Adding..." : "Add Reminder"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reminders List */}
      <div className="space-y-4">
        <AnimatePresence>
          {reminders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Pill className="h-16 w-16 text-stone-300 mx-auto mb-4" />
              <p className="text-xl text-stone-500">No reminders yet</p>
              <p className="text-stone-400">Add your first medicine reminder above</p>
            </motion.div>
          ) : (
            reminders.map((reminder, index) => {
              const timeInfo = getTimeOfDay(reminder.time);
              const Icon = timeInfo.icon;

              return (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-stretch">
                        {/* Time Indicator */}
                        <div
                          className={`w-24 flex flex-col items-center justify-center p-4 bg-${timeInfo.color}-100`}
                        >
                          <Icon className={`h-8 w-8 text-${timeInfo.color}-600 mb-1`} />
                          <span className="text-2xl font-bold text-stone-800">
                            {reminder.time}
                          </span>
                          <span className="text-xs text-stone-600">
                            {timeInfo.label}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold text-stone-800">
                                {reminder.medicine_name}
                              </h3>
                              {reminder.dosage && (
                                <p className="text-stone-600">{reminder.dosage}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {DAYS.filter((d) =>
                                  reminder.days.includes(d.key)
                                ).map((d) => (
                                  <span
                                    key={d.key}
                                    className="px-2 py-1 bg-stone-100 rounded text-xs text-stone-600"
                                  >
                                    {d.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() =>
                                handleDelete(reminder.id, reminder.medicine_name)
                              }
                              disabled={isPending}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start gap-3">
          <Bell className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-blue-800">How it works</p>
            <p className="text-blue-700 text-sm">
              You'll get a notification and voice alert when it's time to take your
              medicine. Make sure notifications are enabled!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
