import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { romeToday } from "@/lib/games";
import { JOB_NAMES, jobsForNow, runJob, type JobName } from "@/lib/push-jobs";

// Chiamata da pg_cron (Supabase) una volta all'ora. Decide da sola cosa
// mandare in base all'ora italiana; se non c'è niente, non fa niente.
//
// Protetta da CRON_SECRET: senza, chiunque conosca l'indirizzo potrebbe
// mandare notifiche a tutti.
//
// Per provare a mano: ?job=zip-morning (ecc.) forza quell'invio subito.

export const maxDuration = 60;

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "non autorizzato" }, { status: 401 });
  }

  const forced = new URL(request.url).searchParams.get("job");
  if (forced && !JOB_NAMES.includes(forced as JobName)) {
    return NextResponse.json({ error: "job sconosciuto" }, { status: 400 });
  }
  const jobs = forced ? [forced as JobName] : jobsForNow();

  const db = createAdminClient();
  const today = romeToday();
  const results: Record<string, unknown> = {};

  for (const job of jobs) {
    // Ogni invio una volta sola al giorno: se pg_cron ripete la chiamata, la
    // riga (job, giorno) c'è già e saltiamo. Le prove forzate non contano.
    if (!forced) {
      const { data: claimed, error } = await db
        .from("push_jobs")
        .upsert({ job, giorno: today }, { ignoreDuplicates: true })
        .select("job");
      if (error) {
        results[job] = `errore: ${error.message}`;
        continue;
      }
      if (!claimed?.length) {
        results[job] = "già fatto oggi";
        continue;
      }
    }
    try {
      results[job] = await runJob(job);
    } catch (e) {
      results[job] = `errore: ${(e as Error).message}`;
    }
  }

  return NextResponse.json({ today, jobs: results });
}
