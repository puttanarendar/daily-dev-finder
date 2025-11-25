import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle, TrendingUp } from "lucide-react";

interface Stats {
  total: number;
  pending: number;
  applied: number;
  failed: number;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    applied: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("applications")
      .select("status")
      .eq("user_id", user.id);

    if (!error && data) {
      const stats = data.reduce(
        (acc, app) => {
          acc.total++;
          if (app.status === "pending") acc.pending++;
          if (app.status === "applied" || app.status === "success") acc.applied++;
          if (app.status === "failed") acc.failed++;
          return acc;
        },
        { total: 0, pending: 0, applied: 0, failed: 0 }
      );
      setStats(stats);
    }
    setLoading(false);
  };

  const statCards = [
    {
      title: "Total Applications",
      value: stats.total,
      icon: TrendingUp,
      color: "from-primary to-secondary",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "from-warning to-warning/80",
    },
    {
      title: "Successfully Applied",
      value: stats.applied,
      icon: CheckCircle2,
      color: "from-success to-success/80",
    },
    {
      title: "Failed",
      value: stats.failed,
      icon: XCircle,
      color: "from-destructive to-destructive/80",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300"
          >
            <CardHeader className={`bg-gradient-to-br ${stat.color} pb-2`}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-white/90">
                  {stat.title}
                </CardTitle>
                <Icon className="w-4 h-4 text-white/70" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
