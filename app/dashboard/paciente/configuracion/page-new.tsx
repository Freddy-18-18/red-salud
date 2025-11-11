"use client";

import { useState } from "react";
import { usePreferences } from "@/lib/contexts/preferences-context";
import { useTranslation } from "@/lib/i18n/translations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TimezoneSelect } from "@/components/ui/timezone-select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Monitor,
  Globe,
  Bell,
  MessageSquare,
  Shield,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Sun,
  Moon,
  Laptop,
  Type,
  Clock,
  Calendar,
  Ruler,
  Mail,
  Phone,
  Volume2,
} from "lucide-react";

export default function ConfiguracionMejoradaPage() {
  const { preferences, loading, updatePreference, updatePreferences, resetPreferences } = usePreferences();
  const { t } = useTranslation(preferences.language);
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updatePreferences(preferences);
      showMessage("success", t("preferences.saveSuccess"));
    } catch (error) {
      console.error("Error saving preferences:", error);
      showMessage("error", t("preferences.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm(t("preferences.resetConfirm"))) {
      try {
        setSaving(true);
        await resetPreferences();
        showMessage("success", t("preferences.resetSuccess"));
      } catch (error) {
        c