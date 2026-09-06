// Un template (a differenza del layout) rimonta a ogni cambio di pagina:
// così ogni navigazione riparte con un breve fade d'ingresso.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
