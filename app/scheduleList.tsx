import { shortDay, formatTime } from "@/lib/schedule";
import { getDict, getLang } from "@/lib/i18n/server";

type ScheduleRow = {
  id: string | number;
  data: string;
  gioco: string | null;
  orario: string;
};

// Schedule della Home: una riga per diretta (giorno, gioco, orario).
// La prima è la prossima e si distingue (.riga-attiva).
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
            const prossima = i === 0;
            return (
              <li
                key={item.id}
                className={`riga grid grid-cols-[46px_minmax(0,1fr)_auto] gap-x-2 ${
                  prossima ? "riga-attiva" : ""
                }`}
              >
                <span className={`font-bold ${prossima ? "" : "text-brand-lavanda"}`}>
                  {shortDay(item.data, lang)}
                </span>
                <span className={`truncate ${prossima ? "font-bold" : ""}`}>
                  {item.gioco || t.schedule.tbd}
                </span>
                <span className={`tabular-nums ${prossima ? "" : "text-brand-lavanda-chiara"}`}>
                  {formatTime(item.orario, lang)}
                </span>
              </li>
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
