import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const rules = [
  {
    q: 'Что проверяет модерация',
    a: 'Достоверность фактов, отсутствие скрытой рекламы и персональных данных соседей, уважительный тон. Стиль и авторскую интонацию мы не трогаем.',
  },
  {
    q: 'Сколько ждать решения',
    a: 'Обычно до суток. Если материал требует уточнений, редакция вернёт его с комментарием — статью можно доработать и отправить снова.',
  },
  {
    q: 'Что публиковать нельзя',
    a: 'Объявления и коммерческие предложения, персональные конфликты с именами и адресами, политическую агитацию, любой чужой текст без разрешения автора.',
  },
  {
    q: 'Кому принадлежат тексты',
    a: 'Автору. Журнал получает право показывать материал в ленте и категориях. Удалить свою публикацию можно в любой момент из кабинета.',
  },
  {
    q: 'Можно ли редактировать после публикации',
    a: 'Да. Правки уходят на повторную короткую проверку, при этом старая версия остаётся видимой в журнале до одобрения новой.',
  },
];

const Rules = () => (
  <section id="rules" className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
    <div className="grid gap-10 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-20">
      <div>
        <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Правила
        </div>
        <h2 className="mt-2 font-head text-[34px] font-extrabold leading-tight md:text-[42px]">
          Короткие и без мелкого шрифта
        </h2>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {rules.map((r) => (
          <AccordionItem key={r.q} value={r.q} className="border-border">
            <AccordionTrigger className="py-5 text-left font-head text-[19px] font-bold hover:no-underline">
              {r.q}
            </AccordionTrigger>
            <AccordionContent className="pb-6 text-[16px] leading-relaxed text-muted-foreground">
              {r.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default Rules;
