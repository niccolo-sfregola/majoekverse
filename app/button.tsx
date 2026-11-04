import { TransLink } from "./transizione";

// Bottone principale dell'app (vedi DESIGN.md): lavanda, angoli tagliati e
// lampo che lo attraversa. Lo stile vive in .btn (globals.css), qui si sceglie
// solo il tag giusto:
// - href interno ("/giochi") → <TransLink>, cambio pagina con le strisce
// - href esterno ("https://…") → <a> che si apre in una nuova scheda
// - niente href → <button> (onClick, o type="submit" dentro un form)
type Props = {
  children: React.ReactNode;
  className?: string;
} & (
  | { href: string }
  | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
);

export default function Button(props: Props) {
  const className = props.className ? `btn ${props.className}` : "btn";

  if (props.href !== undefined) {
    const { href, children } = props;
    if (href.startsWith("/")) {
      return (
        <TransLink href={href} className={className}>
          {children}
        </TransLink>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  const { children, type = "button", ...rest } = props;
  return (
    <button {...rest} type={type} className={className}>
      {children}
    </button>
  );
}
