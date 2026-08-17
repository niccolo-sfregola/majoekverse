import Link from "next/link"

export default function BottomNav() {
    return(
        <nav className="flex md:hidden">
            <Link href="/helpdesk">Help Desk</Link>
            <Link href="/eventi">Eventi</Link>
            <Link href="/">Home</Link>
            <Link href="/profilo">Profilo</Link>
            
        </nav>
    );
}