import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Calendar, ExternalLink, Sparkles } from "lucide-react";
import { format } from "date-fns";

interface JobCardProps {
  job: {
    id: string;
    job_title: string;
    company_name: string;
    location?: string;
    platform: string;
    posted_date?: string;
    salary_range?: string;
    job_url: string;
  };
  onApply: (jobId: string) => void;
  isApplying?: boolean;
}

export const JobCard = ({ job, onApply, isApplying }: JobCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {job.job_title}
            </CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">{job.company_name}</span>
            </div>
          </div>
          <Badge variant={job.platform === "linkedin" ? "default" : "secondary"}>
            {job.platform}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {job.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
        )}

        {job.posted_date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Posted {format(new Date(job.posted_date), "MMM d, yyyy")}</span>
          </div>
        )}

        {job.salary_range && (
          <div className="text-sm font-medium text-success">
            {job.salary_range}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.open(job.job_url, "_blank")}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Job
        </Button>
        <Button
          className="flex-1"
          onClick={() => onApply(job.id)}
          disabled={isApplying}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isApplying ? "Applying..." : "AI Apply"}
        </Button>
      </CardFooter>
    </Card>
  );
};
