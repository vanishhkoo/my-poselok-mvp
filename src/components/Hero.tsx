import Icon from '@/components/ui/icon';
import { articles } from '@/data/journal';

interface HeroProps {
  onCreate: () => void;
}

const Hero = ({ onCreate }: HeroProps) => {
  const preview = articles.slice(0, 3);

  const goJournal = () =>
    document.querySelector('#journal')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <section className="flex flex-col overflow-hidden bg-background pt-6 md:pt-10">
      <div className="px-5 text-center md:px-8">
        <span className="soft-accent inline-flex animate-fade-in items-center gap-2 rounded-full px-4 py-2 text-[14px] font-medium [animation-delay:.05s]">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          MVP 1.0 — приём статей открыт
        </span>

        <h1 className="mt-5 animate-fade-in font-head text-[40px] font-extrabold leading-[1.08] tracking-tight sm:text-[48px] lg:hero-title lg:text-[58px] [animation-delay:.12s]">
          Журнал посёлка.
          <br />
          Пишут соседи.
        </h1>

        <p className="mx-auto mt-5 max-w-[560px] animate-fade-in text-[17px] leading-[1.55] text-muted-foreground [animation-delay:.12s]">
          Статьи о доме, участке и жизни за городом. Каждая проходит модерацию перед публикацией.
        </p>

        <div className="mt-7 flex animate-fade-in flex-col justify-center gap-3 sm:flex-row [animation-delay:.19s]">
          <button
            onClick={onCreate}
            className="inline-flex h-[50px] items-center justify-center rounded-full bg-primary px-7 text-[16px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Написать статью
          </button>
          <button
            onClick={goJournal}
            className="soft-accent inline-flex h-[50px] items-center justify-center rounded-full px-7 text-[16px] font-semibold transition-opacity hover:opacity-80"
          >
            Читать журнал
          </button>
        </div>
      </div>

      <div className="mx-4 mt-11 animate-fade-in rounded-t-[26px] bg-[hsl(var(--hero-panel))] px-4 pt-6 md:mx-6 md:px-16 lg:px-44 [animation-delay:.28s]">
        <div className="overflow-hidden rounded-t-xl border border-[hsl(var(--hero-line))] bg-card shadow-[0_8px_26px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 border-b border-[hsl(var(--hero-line))] px-3.5 py-2.5">
            <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Icon name="Sprout" size={13} />
            </span>
            <span className="soft-accent rounded-md px-2.5 py-1.5 text-[12px] font-semibold">Журнал</span>
            <span className="rounded-md px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground">Кабинет</span>
            <span className="hidden rounded-md px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground sm:block">
              Модерация
            </span>
            <span className="flex-1" />
            <span className="h-4 w-4 rounded-[5px] bg-[hsl(var(--hero-chip))]" />
            <span className="h-[22px] w-[22px] rounded-full bg-primary" />
          </div>

          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="font-head text-[20px] font-extrabold tracking-tight">Журнал</div>
              <span className="rounded-lg bg-primary px-3.5 py-2 text-[12px] font-semibold text-primary-foreground">
                Создать статью
              </span>
            </div>

            <div className="mt-3.5 flex gap-2">
              <div className="flex h-[34px] flex-1 items-center rounded-lg border border-[hsl(var(--hero-line))] px-3 text-[12px] text-muted-foreground">
                Поиск статей и авторов
              </div>
              <div className="flex h-[34px] w-[108px] flex-none items-center justify-between rounded-lg border border-[hsl(var(--hero-line))] px-3 text-[12px] text-muted-foreground">
                <span>Все</span>
                <Icon name="ChevronDown" size={13} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {preview.map((a) => (
                <article
                  key={a.id}
                  className="overflow-hidden rounded-[10px] border border-[hsl(var(--hero-line))]"
                >
                  <img src={a.cover} alt="" className="h-[92px] w-full object-cover" />
                  <div className="px-3 pb-3 pt-2.5">
                    <span className="soft-accent inline-block rounded-md px-2 py-1 text-[11px] font-medium">
                      {a.category}
                    </span>
                    <h3 className="mt-2 font-head text-[14px] font-bold leading-[1.3] tracking-tight">
                      {a.title}
                    </h3>
                    <div className="mt-2 flex justify-between text-[12px] text-muted-foreground">
                      <span>{a.author}</span>
                      <span>{a.date}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
