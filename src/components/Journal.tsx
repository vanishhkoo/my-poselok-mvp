import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { categories } from '@/data/journal';
import { useArticles } from '@/contexts/ArticlesContext';
import ArticleCard from '@/components/journal/ArticleCard';

const Journal = () => {
  const { articles } = useArticles();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string>('Все');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      const byCat = active === 'Все' || a.category === active;
      const byQuery =
        !q || a.title.toLowerCase().includes(q) || a.author.toLowerCase().includes(q);
      return byCat && byQuery;
    });
  }, [articles, active, query]);

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
            <ArticleCard key={a.id} article={a} onClick={() => navigate(`/journal/${a.id}`)} />
          ))}
        </div>
      )}
    </section>
  );
};

export default Journal;
