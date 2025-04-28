import { CalendarIcon } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-card border-t border-border mt-auto p-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {import.meta.env.VITE_APP_NAME} &copy; {currentYear}
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          <span>Version 1.0.0</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
