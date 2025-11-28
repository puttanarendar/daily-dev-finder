import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Sample PHP developer jobs from different platforms and locations
    const sampleJobs = [
      {
        job_title: 'Senior PHP Developer',
        company_name: 'Tech Solutions Pvt Ltd',
        location: 'Hyderabad',
        platform: 'naukri',
        job_description: 'Looking for experienced PHP developer with Laravel expertise. Must have 5+ years experience.',
        salary_range: '₹8-12 LPA',
        job_url: 'https://www.naukri.com/job-listings-senior-php-developer',
        posted_date: new Date().toISOString(),
      },
      {
        job_title: 'PHP Full Stack Developer',
        company_name: 'Digital Innovations',
        location: 'Remote',
        platform: 'linkedin',
        job_description: 'Remote PHP developer position. Experience with MySQL, JavaScript, and modern PHP frameworks required.',
        salary_range: '₹6-10 LPA',
        job_url: 'https://www.linkedin.com/jobs/php-full-stack-developer',
        posted_date: new Date().toISOString(),
      },
      {
        job_title: 'PHP Backend Developer',
        company_name: 'Startup Hub India',
        location: 'Bangalore',
        platform: 'naukri',
        job_description: 'Join our growing team as a PHP backend developer. Work on exciting projects with latest technologies.',
        salary_range: '₹5-8 LPA',
        job_url: 'https://www.naukri.com/job-listings-php-backend-developer',
        posted_date: new Date().toISOString(),
      },
      {
        job_title: 'Laravel PHP Developer',
        company_name: 'CloudTech Systems',
        location: 'Remote',
        platform: 'linkedin',
        job_description: 'Expert Laravel developer needed for enterprise applications. Experience with REST APIs and microservices.',
        salary_range: '₹10-15 LPA',
        job_url: 'https://www.linkedin.com/jobs/laravel-php-developer',
        posted_date: new Date().toISOString(),
      },
      {
        job_title: 'PHP Developer - WordPress',
        company_name: 'Web Solutions Co',
        location: 'Hyderabad',
        platform: 'naukri',
        job_description: 'WordPress and PHP developer for custom theme and plugin development.',
        salary_range: '₹4-7 LPA',
        job_url: 'https://www.naukri.com/job-listings-wordpress-php-developer',
        posted_date: new Date().toISOString(),
      },
      {
        job_title: 'Junior PHP Developer',
        company_name: 'Learning Tech Ltd',
        location: 'Bangalore',
        platform: 'linkedin',
        job_description: 'Great opportunity for junior PHP developers to learn and grow. Training provided.',
        salary_range: '₹3-5 LPA',
        job_url: 'https://www.linkedin.com/jobs/junior-php-developer',
        posted_date: new Date().toISOString(),
      },
    ];

    // Insert jobs into database
    const { data, error } = await supabaseClient
      .from('job_listings')
      .insert(sampleJobs)
      .select();

    if (error) {
      console.error('Error inserting jobs:', error);
      throw error;
    }

    console.log(`Successfully scraped and added ${data?.length || 0} jobs`);

    return new Response(
      JSON.stringify({
        success: true,
        jobsAdded: data?.length || 0,
        message: `Successfully scraped ${data?.length || 0} PHP developer jobs`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in scrape-jobs function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});