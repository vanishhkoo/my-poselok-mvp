import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useArticles } from '@/contexts/ArticlesContext';
import { toast } from '@/hooks/use-toast';

const statusLabel: Record<string, string> = {
  published: 'Опубликована',
  moderation: 'На модерации',
  draft: 'Черновик',
};

const statusClass: Record<string, string> = {
  published: 'bg-accent text-accent-foreground',
  moderation: 'bg-muted text-muted-foreground',
  draft: 'bg-secondary text-secondary-foreground',
};

const ProfilePage = () => {
  const { profile, isAuthenticated, updateProfile } = useAuth();
  const { articles } = useArticles();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [saved, setSaved] = useState(false);

  if (!isAuthenticated || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-lg px-5 py-24 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <Icon name="UserCircle2" size={26} />
          </span>
          <h1 className="mt-5 font-head text-[26px] font-extrabold">Ваш профиль</h1>
          <p className="mt-2 text-muted-foreground">
            Войдите, чтобы управлять профилем и своими публикациями.
          </p>
          <Button className="mt-6 rounded-full px-7" onClick={() => navigate('/auth')}>
            Войти или зарегистрироваться
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const myArticles = articles.filter((a) => a.authorId === profile.id || a.author === profile.name);

  const save = () => {
    updateProfile({ name: name.trim() || profile.name, bio: bio.trim() });
    setSaved(true);
    toast({ title: 'Профиль обновлён' });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[900px] px-5 py-12 md:py-16">
        <h1 className="font-head text-[28px] font-extrabold">Профиль</h1>

        <div className="mt-8 grid gap-10 lg:grid-cols-[320px_1fr]">
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon name="User" size={24} />
              </span>
              <div>
                <div className="font-head text-[17px] font-bold">{profile.name}</div>
                <div className="text-[13px] text-muted-foreground">{profile.email}</div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя и фамилия</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">О себе</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Пара слов о себе — это будет видно под статьями"
                />
              </div>
              <Button className="w-full rounded-full" onClick={save}>
                {saved ? (
                  <>
                    <Icon name="Check" size={16} className="mr-1.5" />
                    Сохранено
                  </>
                ) : (
                  'Сохранить'
                )}
              </Button>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-head text-[20px] font-bold">Мои публикации</h2>
              <Button size="sm" className="rounded-full" onClick={() => navigate('/write')}>
                <Icon name="Plus" size={15} className="mr-1.5" />
                Новая статья
              </Button>
            </div>

            {myArticles.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">
                <Icon name="PenLine" size={28} className="mx-auto text-muted-foreground" />
                <p className="mt-3 text-muted-foreground">Вы ещё не опубликовали ни одной статьи.</p>
                <Button className="mt-5 rounded-full px-6" onClick={() => navigate('/write')}>
                  Написать первую статью
                </Button>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {myArticles.map((a) => (
                  <Link
                    key={a.id}
                    to={`/journal/${a.id}`}
                    className="flex items-center gap-4 rounded-xl border border-border p-3 transition-colors hover:border-primary"
                  >
                    <img src={a.cover} alt="" className="h-16 w-16 flex-none rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-1 text-[15px] font-bold">{a.title}</div>
                      <div className="mt-1 text-[13px] text-muted-foreground">{a.date} · {a.category}</div>
                    </div>
                    <span className={`flex-none rounded-md px-2.5 py-1 text-[12px] font-medium ${statusClass[a.status]}`}>
                      {statusLabel[a.status]}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
