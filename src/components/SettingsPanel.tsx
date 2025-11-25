import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, Settings } from "lucide-react";

export const SettingsPanel = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    keywords: "php, developer",
    locations: "Remote, Bangalore",
    minExperience: 0,
    maxExperience: 10,
    autoApplyEnabled: false,
    dailyLimit: 10,
    linkedinEmail: "",
    naukriEmail: "",
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data) {
      setPreferences({
        keywords: data.keywords?.join(", ") || "",
        locations: data.location_preferences?.join(", ") || "",
        minExperience: data.min_experience || 0,
        maxExperience: data.max_experience || 10,
        autoApplyEnabled: data.auto_apply_enabled || false,
        dailyLimit: data.daily_apply_limit || 10,
        linkedinEmail: data.linkedin_email || "",
        naukriEmail: data.naukri_email || "",
      });
    }
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);

    const { error } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: user.id,
        keywords: preferences.keywords.split(",").map((k) => k.trim()),
        location_preferences: preferences.locations.split(",").map((l) => l.trim()),
        min_experience: preferences.minExperience,
        max_experience: preferences.maxExperience,
        auto_apply_enabled: preferences.autoApplyEnabled,
        daily_apply_limit: preferences.dailyLimit,
        linkedin_email: preferences.linkedinEmail,
        naukri_email: preferences.naukriEmail,
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Your preferences have been saved",
      });
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <CardTitle>Job Search Preferences</CardTitle>
        </div>
        <CardDescription>
          Configure your job search criteria and automation settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords (comma-separated)</Label>
          <Input
            id="keywords"
            placeholder="php, developer, backend"
            value={preferences.keywords}
            onChange={(e) => setPreferences({ ...preferences, keywords: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="locations">Preferred Locations (comma-separated)</Label>
          <Input
            id="locations"
            placeholder="Remote, Bangalore, Mumbai"
            value={preferences.locations}
            onChange={(e) => setPreferences({ ...preferences, locations: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minExp">Min Experience (years)</Label>
            <Input
              id="minExp"
              type="number"
              min="0"
              value={preferences.minExperience}
              onChange={(e) =>
                setPreferences({ ...preferences, minExperience: parseInt(e.target.value) || 0 })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxExp">Max Experience (years)</Label>
            <Input
              id="maxExp"
              type="number"
              min="0"
              value={preferences.maxExperience}
              onChange={(e) =>
                setPreferences({ ...preferences, maxExperience: parseInt(e.target.value) || 10 })
              }
            />
          </div>
        </div>

        <div className="space-y-4 p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Apply</Label>
              <p className="text-sm text-muted-foreground">
                Automatically apply to matching jobs daily
              </p>
            </div>
            <Switch
              checked={preferences.autoApplyEnabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, autoApplyEnabled: checked })
              }
            />
          </div>

          {preferences.autoApplyEnabled && (
            <div className="space-y-2">
              <Label htmlFor="dailyLimit">Daily Application Limit</Label>
              <Input
                id="dailyLimit"
                type="number"
                min="1"
                max="50"
                value={preferences.dailyLimit}
                onChange={(e) =>
                  setPreferences({ ...preferences, dailyLimit: parseInt(e.target.value) || 10 })
                }
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Platform Credentials</h4>
          <div className="space-y-2">
            <Label htmlFor="linkedinEmail">LinkedIn Email</Label>
            <Input
              id="linkedinEmail"
              type="email"
              placeholder="your.email@example.com"
              value={preferences.linkedinEmail}
              onChange={(e) => setPreferences({ ...preferences, linkedinEmail: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="naukriEmail">Naukri Email</Label>
            <Input
              id="naukriEmail"
              type="email"
              placeholder="your.email@example.com"
              value={preferences.naukriEmail}
              onChange={(e) => setPreferences({ ...preferences, naukriEmail: e.target.value })}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
};
