import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, categories, covers } from '@/data/journal';
import { useAuth } from '@/contexts/AuthContext';
import { useArticles } from '@/contexts/ArticlesContext';

const coverLabels = ['Участок', 'Дом', 'Лес'];

const WriteArticlePage = () => {
  const { profile, isAuthenticated } = useAuth();
  const { addArticle } = useArticles();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [cover, setCover] = useState(covers[0]);
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  if (!isAuthenticated || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-lg px-5 py-24 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <Icon name="Lock" size={24} />
          </span>
          <h1 className="mt-5 font-head text-[26px] font-extrabold">Нужен аккаунт</h1>
          <p className="mt-2 text-muted-foreground">
            Войдите или зарегистрируйтесь, чтобы написать статью.
          </p>
          <Button className="mt-6 rounded-full px-7" onClick={() => navigate('/auth')}>
            Войти
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-lg px-5 py-24 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <Icon name="ShieldCheck" size={26} />
          </div>
          <h1 className="mt-5 font-head text-[26px] font-extrabold">Статья на модерации</h1>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
            Материал появился в журнале со статусом «На модерации». Редакция проверит его и
            опубликует — обычно это занимает до суток.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <Button variant="outline" className="rounded-full px-6" onClick={() => navigate('/profile')}>
              Мои публикации
            </Button>
            <Button className="rounded-full px-6" onClick={() => navigate('/')}>
              В журнал
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

    addArticle({
      id: `u${Date.now()}`,
      title: title.trim(),
      excerpt: paragraphs[0].slice(0, 160),
      body: paragraphs,
      category: category as Category,
      authorId: profile.id,
      author: profile.name,
      date: 'сегодня',
      cover,
      views: 0,
      status: 'moderation',
    });
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-5 py-10 md:py-16">
        <h1 className="font-head text-[28px] font-extrabold">Новая публикация</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Автор: {profile.name}. После отправки статья уходит на модерацию.
        </p>

        <div className="mt-8 space-y-5">
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
              {covers.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setCover(src)}
                  className={`overflow-hidden rounded-xl border-2 transition-colors ${
                    cover === src ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={src} alt={coverLabels[i]} className="h-20 w-full object-cover" />
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
              rows={9}
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

          <div className="flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:justify-end">
            <Button variant="ghost" className="rounded-full" onClick={() => navigate(-1)}>
              Отмена
            </Button>
            <Button className="rounded-full px-7" onClick={submit}>
              Отправить на модерацию
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WriteArticlePage;
