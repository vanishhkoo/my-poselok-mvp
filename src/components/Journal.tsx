import { useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Article, articles as seed, categories } from '@/data/journal';

interface JournalProps {
  extra: Article[];
}

const Journal = ({ extra }: JournalProps) => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string>('Все');
  const [open, setOpen] = useState<Article | null>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const all = useMemo(() => [...extra, ...seed], [extra]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((a) => {
      const byCat = active === 'Все' || a.category === active;
      const byQuery =
        !q || a.title.toLowerCase().includes(q) || a.author.toLowerCase().includes(q);
      return byCat && byQuery;
    });
  }, [all, active, query]);

  const toggleLike = (id: string) => setLiked((p) => ({ ...p, [id]: !p[id] }));

  return (
    <section id="journal" className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
      <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Лента публикаций
          </div>
          <h2 className="mt-2 font-head text-[34px] font-extrabold leading-tight md:text-[42px]">
            Журнал
          </h2>
        </div>
        <div className="relative w-full md:w-[380px]">
          <Icon
            name="Search"
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск статей и авторов"
            className="h-12 rounded-full border-border bg-card pl-11 text-[15px]"
          />
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        {['Все', ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${
              active === c
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-border py-20 text-center">
          <Icon name="SearchX" size={30} className="mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Ничего не нашли. Попробуйте другой запрос.</p>
        </div>
      ) : (
        <div className="mt-9 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <article
              key={a.id}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-[0_12px_34px_rgba(0,0,0,0.07)]"
              onClick={() => setOpen(a)}
            >
              <div className="overflow-hidden">
                <img
                  src={a.cover}
                  alt=""
                  className="h-[210px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2">
                  <span className="soft-accent rounded-md px-2.5 py-1 text-[12px] font-medium">
                    {a.category}
                  </span>
                  {a.status === 'moderation' && (
                    <span className="rounded-md bg-muted px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
                      На модерации
                    </span>
                  )}
                </div>
                <h3 className="mt-3 font-head text-[20px] font-bold leading-[1.28]">{a.title}</h3>
                <p className="mt-2.5 line-clamp-3 text-[15px] leading-relaxed text-muted-foreground">
                  {a.excerpt}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-[13px] text-muted-foreground">
                  <span className="font-medium text-foreground">{a.author}</span>
                  <div className="flex items-center gap-3.5">
                    <span className="flex items-center gap-1.5">
                      <Icon name="Eye" size={15} />
                      {a.views}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(a.id);
                      }}
                      className={`flex items-center gap-1.5 transition-colors ${
                        liked[a.id] ? 'text-destructive' : 'hover:text-destructive'
                      }`}
                      aria-label="Нравится"
                    >
                      <Icon name="Heart" size={15} />
                      {a.likes + (liked[a.id] ? 1 : 0)}
                    </button>
                    <span className="flex items-center gap-1.5">
                      <Icon name="MessageCircle" size={15} />
                      {a.comments}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
          {open && (
            <>
              <img src={open.cover} alt="" className="h-56 w-full rounded-xl object-cover" />
              <DialogHeader>
                <span className="soft-accent w-fit rounded-md px-2.5 py-1 text-[12px] font-medium">
                  {open.category}
                </span>
                <DialogTitle className="text-left font-head text-[26px] font-extrabold leading-tight">
                  {open.title}
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-3 text-[14px] text-muted-foreground">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon name="User" size={15} />
                </span>
                <span className="font-medium text-foreground">{open.author}</span>
                <span>·</span>
                <span>{open.date}</span>
              </div>
              <div className="space-y-4 text-[16px] leading-[1.7] text-foreground">
                {open.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Journal;
