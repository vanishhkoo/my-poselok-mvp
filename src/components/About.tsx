import Icon from '@/components/ui/icon';
import { COVER_FOREST } from '@/data/journal';

const facts = [
  { value: '6', label: 'категорий журнала' },
  { value: '1', label: 'проверка перед выходом' },
  { value: '0 ₽', label: 'стоимость публикации' },
];

const About = () => (
  <section id="about" className="border-t border-border bg-card">
    <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="overflow-hidden rounded-3xl">
          <img
            src={COVER_FOREST}
            alt="Лес рядом с посёлком"
            className="h-[380px] w-full object-cover md:h-[460px]"
          />
        </div>

        <div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            О проекте
          </div>
          <h2 className="mt-2 font-head text-[34px] font-extrabold leading-tight md:text-[42px]">
            Журнал, который ведут сами жители
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">
            «Мой посёлок» — площадка для тех, кто живёт за городом и хочет делиться практикой:
            как расчистить участок, где искать мастера, куда пойти с детьми в выходные.
            Никакой ленты новостей и никаких споров — только полезные материалы соседей.
          </p>

          <div className="mt-9 grid grid-cols-3 gap-5 border-t border-border pt-8">
            {facts.map((f) => (
              <div key={f.label}>
                <div className="font-head text-[32px] font-extrabold text-primary md:text-[38px]">
                  {f.value}
                </div>
                <div className="mt-1 text-[14px] leading-snug text-muted-foreground">{f.label}</div>
              </div>
            ))}
          </div>

          <ul className="mt-9 space-y-3">
            {[
              'Профиль автора с подписью под каждой статьёй',
              'Категории и поиск по заголовкам и авторам',
              'Прозрачная модерация со статусом публикации',
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-[16px]">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <Icon name="Check" size={13} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

export default About;
