import { Shield, UploadCloud } from "lucide-react";

export function Header() {
  return (
    <header className="w-full bg-card border-b border-border sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-3 md:p-4">
        <div className="flex items-center gap-2">
          <div className="hidden md:flex bg-primary/10 p-2 rounded-full">
            <UploadCloud className="h-8 w-8 text-primary" />
          </div>

          <div>
            <h1 className="text-lg font-semibold leading-none">
              {import.meta.env.VITE_APP_NAME}
            </h1>
            <p className="text-xs text-muted-foreground hidden md:block">
              Securely upload patient forms and medication lists
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-sm text-muted-foreground ml-2 hidden md:block">
            Secure
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
