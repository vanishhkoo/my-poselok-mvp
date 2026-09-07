import Icon from '@/components/ui/icon';

const steps = [
  {
    icon: 'BookOpen',
    title: 'Читаете журнал',
    text: 'Лента, категории и поиск открыты всем без регистрации.',
  },
  {
    icon: 'UserPlus',
    title: 'Регистрируетесь',
    text: 'Почта и пароль. Никаких анкет и подтверждений документами.',
  },
  {
    icon: 'IdCard',
    title: 'Заполняете профиль',
    text: 'Имя, посёлок и пара слов о себе — это подпись под статьёй.',
  },
  {
    icon: 'PenLine',
    title: 'Пишете публикацию',
    text: 'Заголовок, категория, текст и обложка. Черновик сохраняется.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Проходите модерацию',
    text: 'Редакция проверяет факты, рекламу и тон. Обычно до суток.',
  },
  {
    icon: 'Newspaper',
    title: 'Статья в журнале',
    text: 'После одобрения материал появляется в ленте и в категории.',
  },
];

interface HowItWorksProps {
  onCreate: () => void;
}

const HowItWorks = ({ onCreate }: HowItWorksProps) => (
  <section id="how" className="border-y border-border bg-card">
    <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-20">
        <div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Авторам
          </div>
          <h2 className="mt-2 font-head text-[34px] font-extrabold leading-tight md:text-[42px]">
            Путь публикации — шесть шагов
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">
            Мы не берём плату, не требуем портфолио и не редактируем текст без вашего ведома.
            Единственное условие — материал полезен соседям.
          </p>
          <button
            onClick={onCreate}
            className="mt-7 inline-flex h-[50px] items-center justify-center rounded-full bg-primary px-7 text-[16px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Начать публикацию
          </button>
        </div>

        <ol className="grid gap-x-8 gap-y-9 sm:grid-cols-2">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <Icon name={s.icon} size={20} />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-muted-foreground">
                  0{i + 1}
                </div>
                <h3 className="mt-1 font-head text-[18px] font-bold">{s.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </section>
);

export default HowItWorks;
