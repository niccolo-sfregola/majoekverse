import Link from "next/link"

export default function BottomNav() {
    return(
        <nav>
            <Link href="/helpdesk">HelpDesk</Link>
            <Link href="/eventi">Eventi</Link>
            <Link href="/">Home</Link>
            <Link href="/profilo">Profilo</Link>
            
        </nav>
    );
}