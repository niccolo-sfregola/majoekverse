import Link from "next/link"

export default function BottomNav() {
    return(
        <nav className="flex md:hidden fixed bottom-0 inset-x-0 justify-around items-center py-3 bg-background text-foreground border-t border-brand-lavanda/20">
            <Link href="/helpdesk">Help Desk</Link>
            <Link href="/eventi">Eventi</Link>
            <Link href="/">Home</Link>
            <Link href="/profilo">Profilo</Link>
            
        </nav>
    );
}