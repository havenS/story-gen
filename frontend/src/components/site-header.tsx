export function SiteHeader() {
  return (
    <div className="grid">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <a href="/" className="flex items-center space-x-2">
              <span className="inline-block font-bold">Stories Generator</span>
            </a>
          </div>
        </div>
      </header>
    </div>
  );
}
