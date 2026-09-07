import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Article, Category, categories, COVER_FOREST, COVER_HOUSE, COVER_PLOT } from '@/data/journal';

const covers = [
  { src: COVER_PLOT, label: 'Участок' },
  { src: COVER_HOUSE, label: 'Дом' },
  { src: COVER_FOREST, label: 'Лес' },
];

interface CreateArticleDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  author: string | null;
  onSubmit: (a: Article) => void;
}

const CreateArticleDialog = ({ open, onOpenChange, author, onSubmit }: CreateArticleDialogProps) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [cover, setCover] = useState(COVER_PLOT);
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const reset = () => {
    setTitle('');
    setCategory('');
    setText('');
    setCover(COVER_PLOT);
    setErrors({});
    setSent(false);
  };

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) setTimeout(reset, 250);
  };

  const submit = () => {
    const e: Record<string, string> = {};
    if (title.trim().length < 8) e.title = 'Заголовок от 8 символов';
    if (!category) e.category = 'Выберите категорию';
    if (text.trim().length < 80) e.text = 'Текст от 80 символов — это примерно один абзац';
    setErrors(e);
    if (Object.keys(e).length) return;

    const paragraphs = text
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    onSubmit({
      id: `u${Date.now()}`,
      title: title.trim(),
      excerpt: paragraphs[0].slice(0, 160),
      body: paragraphs,
      category: category as Category,
      author: author ?? 'Аноним',
      date: 'сегодня',
      cover,
      views: 0,
      likes: 0,
      comments: 0,
      status: 'moderation',
    });
    setSent(true);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        {sent ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Icon name="ShieldCheck" size={26} />
            </div>
            <h3 className="mt-5 font-head text-[24px] font-extrabold">Статья на модерации</h3>
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              Материал появился в журнале со статусом «На модерации». Редакция проверит его и
              опубликует — обычно это занимает до суток.
            </p>
            <Button className="mt-7 rounded-full px-7" onClick={() => close(false)}>
              Понятно
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-head text-[24px] font-extrabold">Новая публикация</DialogTitle>
              <DialogDescription>
                Автор: {author ?? '—'}. После отправки статья уходит на модерацию.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="t">Заголовок</Label>
                <Input
                  id="t"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Как расчистить заросший участок к зиме"
                  className={`h-11 ${errors.title ? 'border-destructive' : ''}`}
                />
                {errors.title && <p className="text-[13px] text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label>Категория</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger className={`h-11 ${errors.category ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-[13px] text-destructive">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label>Обложка</Label>
                <div className="grid grid-cols-3 gap-3">
                  {covers.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setCover(c.src)}
                      className={`overflow-hidden rounded-xl border-2 transition-colors ${
                        cover === c.src ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={c.src} alt={c.label} className="h-20 w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="b">Текст статьи</Label>
                <Textarea
                  id="b"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={7}
                  placeholder="Абзацы разделяйте переносом строки."
                  className={errors.text ? 'border-destructive' : ''}
                />
                <div className="flex justify-between text-[13px] text-muted-foreground">
                  <span className={errors.text ? 'text-destructive' : ''}>
                    {errors.text ?? 'Пишите просто и по делу'}
                  </span>
                  <span>{text.trim().length} симв.</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button variant="ghost" className="rounded-full" onClick={() => close(false)}>
                  Отмена
                </Button>
                <Button className="rounded-full px-7" onClick={submit}>
                  Отправить на модерацию
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateArticleDialog;
