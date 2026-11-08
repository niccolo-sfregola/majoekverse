import { shortDay, formatTime } from "@/lib/schedule";
import { getDict, getLang } from "@/lib/i18n/server";
import { pulisciPiattaforme, nomiPiattaforme } from "@/lib/piattaforme";
import RigaSchedule from "./rigaSchedule";

type ScheduleRow = {
  id: string | number;
  data: string;
  gioco: string | null;
  orario: string;
  piattaforme: string[] | null;
};

// Schedule della Home: una riga per diretta (giorno, gioco + piattaforma, orario).
// La prima è la prossima e si distingue (.riga-attiva). Ogni riga è un
// piccolo componente client (RigaSchedule) che si apre se il gioco è tagliato.
export default async function ScheduleList({ items }: { items: ScheduleRow[] }) {
  const [t, lang] = await Promise.all([getDict(), getLang()]);

  return (
    <section className="flex flex-col gap-2.5 lg:gap-3">
      <h2 className="titolo-sezione">{t.schedule.title}</h2>
      {items.length === 0 ? (
        <p className="text-brand-lavanda-chiara">{t.schedule.loading}</p>
      ) : (
        <ul className="entra flex flex-col gap-1.5">
          {items.map((item, i) => {
            return (
              <RigaSchedule
                key={item.id}
                giorno={shortDay(item.data, lang)}
                gioco={item.gioco || t.schedule.tbd}
                piattaforme={nomiPiattaforme(pulisciPiattaforme(item.piattaforme))}
                orario={formatTime(item.orario, lang)}
                prossima={i === 0}
              />
            );
          })}
        </ul>
      )}
      {items.length > 0 && t.schedule.timezoneNote ? (
        <p className="text-sm text-brand-lavanda-chiara">{t.schedule.timezoneNote}</p>
      ) : null}
    </section>
  );
}
