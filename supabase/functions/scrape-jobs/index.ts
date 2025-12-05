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

    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    
    if (!RAPIDAPI_KEY) {
      console.error('RAPIDAPI_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'RAPIDAPI_KEY not configured. Please add your RapidAPI key.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jobs: any[] = [];

    // Fetch from LinkedIn Jobs API (via RapidAPI)
    console.log('Fetching LinkedIn jobs...');
    try {
      const linkedinResponse = await fetch(
        'https://linkedin-jobs-search.p.rapidapi.com/search?keywords=PHP%20Developer&location=India&datePosted=pastWeek&sort=mostRecent',
        {
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'linkedin-jobs-search.p.rapidapi.com'
          }
        }
      );
      
      if (linkedinResponse.ok) {
        const linkedinData = await linkedinResponse.json();
        console.log(`Found ${linkedinData.length || 0} LinkedIn jobs`);
        
        if (Array.isArray(linkedinData)) {
          linkedinData.slice(0, 10).forEach((job: any) => {
            jobs.push({
              job_title: job.title || 'PHP Developer',
              company_name: job.company || 'Unknown Company',
              location: job.location || 'India',
              platform: 'linkedin',
              job_url: job.url || `https://linkedin.com/jobs/view/${job.id}`,
              posted_date: job.postedTime || new Date().toISOString(),
              salary_range: job.salary || null,
              job_description: job.description || null
            });
          });
        }
      } else {
        const errorText = await linkedinResponse.text();
        console.error('LinkedIn API error:', linkedinResponse.status, errorText);
      }
    } catch (err) {
      console.error('LinkedIn fetch error:', err);
    }

    // Fetch from JSearch API (covers Indeed, LinkedIn, Glassdoor etc.)
    console.log('Fetching jobs from JSearch...');
    try {
      const jsearchResponse = await fetch(
        'https://jsearch.p.rapidapi.com/search?query=PHP%20Developer%20in%20India&page=1&num_pages=1',
        {
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
          }
        }
      );
      
      if (jsearchResponse.ok) {
        const jsearchData = await jsearchResponse.json();
        console.log(`Found ${jsearchData.data?.length || 0} JSearch jobs`);
        
        if (jsearchData.data && Array.isArray(jsearchData.data)) {
          jsearchData.data.slice(0, 10).forEach((job: any) => {
            jobs.push({
              job_title: job.job_title || 'PHP Developer',
              company_name: job.employer_name || 'Unknown Company',
              location: job.job_city || job.job_country || 'India',
              platform: 'naukri',
              job_url: job.job_apply_link || job.job_google_link || '#',
              posted_date: job.job_posted_at_datetime_utc || new Date().toISOString(),
              salary_range: job.job_min_salary && job.job_max_salary 
                ? `${job.job_min_salary} - ${job.job_max_salary} ${job.job_salary_currency || 'INR'}`
                : null,
              job_description: job.job_description || null
            });
          });
        }
      } else {
        const errorText = await jsearchResponse.text();
        console.error('JSearch API error:', jsearchResponse.status, errorText);
      }
    } catch (err) {
      console.error('JSearch fetch error:', err);
    }

    if (jobs.length === 0) {
      console.log('No jobs found from APIs');
      return new Response(
        JSON.stringify({ success: false, message: 'No jobs found from APIs', jobsAdded: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Inserting ${jobs.length} jobs into database...`);
    const { data, error } = await supabaseClient
      .from('job_listings')
      .upsert(jobs, { onConflict: 'job_url', ignoreDuplicates: true })
      .select();

    if (error) {
      console.error('Database insert error:', error);
      throw error;
    }

    console.log(`Successfully inserted ${data?.length || 0} jobs`);
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully scraped ${data?.length || 0} PHP developer jobs`,
        jobsAdded: data?.length || 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scrape jobs error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
