import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const links = [
  { href: '#journal', label: 'Журнал' },
  { href: '#how', label: 'Авторам' },
  { href: '#rules', label: 'Правила' },
  { href: '#about', label: 'О проекте' },
];

interface HeaderProps {
  user: string | null;
  onAuth: () => void;
  onLogout: () => void;
  onCreate: () => void;
}

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
      <Icon name="Sprout" size={19} />
    </div>
    <div className="leading-tight">
      <div className="font-head text-[15px] font-extrabold tracking-tight">Мой посёлок</div>
      <div className="text-[12px] text-muted-foreground">Журнал жителей</div>
    </div>
  </div>
);

const Header = ({ user, onAuth, onLogout, onCreate }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-colors ${
        scrolled ? 'border-b border-border bg-background/85 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-4 md:px-8">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="justify-self-start">
          <Logo />
        </button>

        <nav className="hidden justify-center gap-8 md:flex">
          {links.map((l) => (
            <button
              key={l.href}
              onClick={() => go(l.href)}
              className="story-link text-[15px] font-medium text-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </button>
          ))}
        </nav>
        <span className="md:hidden" />

        <div className="flex items-center justify-end gap-2">
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Button size="sm" className="rounded-full px-5" onClick={onCreate}>
                <Icon name="Plus" size={16} className="mr-1.5" />
                Создать статью
              </Button>
              <button
                onClick={onLogout}
                title="Выйти"
                className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon name="User" size={13} />
                </span>
                {user}
              </button>
            </div>
          ) : (
            <button
              onClick={onAuth}
              className="hidden text-[15px] text-muted-foreground transition-colors hover:text-primary md:block"
            >
              Войти
            </button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Меню">
                <Icon name="Menu" size={22} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[78%] sm:w-80">
              <div className="mt-2 flex flex-col gap-1">
                {links.map((l) => (
                  <button
                    key={l.href}
                    onClick={() => go(l.href)}
                    className="rounded-lg px-3 py-3 text-left text-base font-medium transition-colors hover:bg-muted"
                  >
                    {l.label}
                  </button>
                ))}
                <div className="mt-4 border-t border-border pt-4">
                  {user ? (
                    <div className="flex flex-col gap-2">
                      <Button
                        className="rounded-full"
                        onClick={() => {
                          setOpen(false);
                          onCreate();
                        }}
                      >
                        Создать статью
                      </Button>
                      <Button
                        variant="ghost"
                        className="rounded-full"
                        onClick={() => {
                          setOpen(false);
                          onLogout();
                        }}
                      >
                        Выйти ({user})
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full rounded-full"
                      onClick={() => {
                        setOpen(false);
                        onAuth();
                      }}
                    >
                      Войти
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
