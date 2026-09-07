import Icon from '@/components/ui/icon';

const columns = [
  {
    title: 'Журнал',
    items: ['Лента статей', 'Категории', 'Популярное', 'Новинки'],
  },
  {
    title: 'Авторам',
    items: ['Как опубликоваться', 'Правила модерации', 'Профиль автора'],
  },
  {
    title: 'Документы',
    items: ['Пользовательское соглашение', 'Политика конфиденциальности', 'Контакты редакции'],
  },
];

const Footer = () => (
  <footer className="border-t border-border bg-background">
    <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-8">
      <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
              <Icon name="Sprout" size={19} />
            </div>
            <div className="leading-tight">
              <div className="font-head text-[15px] font-extrabold">Мой посёлок</div>
              <div className="text-[12px] text-muted-foreground">Журнал жителей</div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-muted-foreground">
            Онлайн-журнал с публикациями соседей. MVP 1.0 — приём статей открыт.
          </p>
        </div>

        {columns.map((c) => (
          <div key={c.title}>
            <div className="font-head text-[14px] font-bold">{c.title}</div>
            <ul className="mt-4 space-y-2.5">
              {c.items.map((i) => (
                <li key={i}>
                  <span className="cursor-default text-[14px] text-muted-foreground transition-colors hover:text-primary">
                    {i}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-3 border-t border-border pt-7 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 «Мой посёлок»</span>
        <span>Материалы принадлежат их авторам</span>
      </div>
    </div>
  </footer>
);

export default Footer;
