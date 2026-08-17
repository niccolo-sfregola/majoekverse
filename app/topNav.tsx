import Link from "next/link"


export default function TopNav() {
    return(
        <nav className="hidden md:flex sticky top-0 inset-x-0 justify-around items-center py-3 bg-background text-foreground border-b border-brand-lavanda/20">
            <Link href="/">Home</Link>
            <Link href="/eventi">Eventi</Link>
            <Link href="/profilo">Profilo</Link>
            <Link href="/helpdesk">Help Desk</Link>
            
        </nav>
    );
}