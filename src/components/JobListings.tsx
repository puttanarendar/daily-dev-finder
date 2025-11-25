import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { JobCard } from "./JobCard";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Job {
  id: string;
  job_title: string;
  company_name: string;
  location?: string;
  platform: string;
  posted_date?: string;
  salary_range?: string;
  job_url: string;
}

export const JobListings = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingJob, setApplyingJob] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("job_listings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setJobs(data);
    }
    setLoading(false);
  };

  const handleApply = async (jobId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setApplyingJob(jobId);

    try {
      const job = jobs.find((j) => j.id === jobId);
      if (!job) return;

      // Call edge function for AI-powered application
      const { data, error } = await supabase.functions.invoke("apply-to-job", {
        body: { jobId, jobTitle: job.job_title, companyName: job.company_name },
      });

      if (error) throw error;

      toast({
        title: "Application submitted!",
        description: `Successfully applied to ${job.job_title} at ${job.company_name}`,
      });

      // Record application
      await supabase.from("applications").insert([{
        user_id: user.id,
        job_id: jobId,
        platform: job.platform as "linkedin" | "naukri",
        status: "applied" as const,
        cover_letter: data?.coverLetter,
      }]);
    } catch (error: any) {
      toast({
        title: "Application failed",
        description: error.message || "Failed to apply to this job",
        variant: "destructive",
      });
    } finally {
      setApplyingJob(null);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Available Jobs</h2>
        <Button variant="outline" onClick={fetchJobs} size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No jobs found. Check back later or adjust your preferences.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApply={handleApply}
              isApplying={applyingJob === job.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};
