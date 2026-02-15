export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-12 w-full max-w-7xl items-center justify-center px-4 text-xs text-slate-600 sm:text-sm">
        <p>&copy; {new Date().getFullYear()} Mahmoud Al Jarad</p>
      </div>
    </footer>
  )
}
