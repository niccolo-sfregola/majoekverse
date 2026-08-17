import Link from "next/link"


export default function TopNav() {
    return(
        <nav className="hidden md:flex">
            <Link href="/">Home</Link>
            <Link href="/eventi">Eventi</Link>
            <Link href="/profilo">Profilo</Link>
            <Link href="/helpdesk">Help Desk</Link>
            
        </nav>
    );
}