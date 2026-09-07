import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (mode: 'login' | 'signup') => {
    const e: Record<string, string> = {};
    if (mode === 'signup' && name.trim().length < 2) e.name = 'Укажите имя — оно станет подписью';
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Проверьте адрес почты';
    if (password.length < 6) e.password = 'Не короче 6 символов';
    setErrors(e);
    if (Object.keys(e).length) return;

    if (mode === 'signup') {
      register(name.trim(), email);
    } else {
      login(email);
    }
    toast({
      title: `Здравствуйте${mode === 'signup' ? `, ${name.trim()}` : ''}`,
      description: mode === 'signup' ? 'Профиль создан, можно публиковать статьи.' : 'Вы вошли в журнал.',
    });
    navigate('/');
  };

  const field = (
    id: string,
    label: string,
    type: string,
    value: string,
    set: (v: string) => void,
    error?: string,
    placeholder?: string,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(ev) => set(ev.target.value)}
        className={`h-11 ${error ? 'border-destructive' : ''}`}
      />
      {error && <p className="text-[13px] text-destructive">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-md flex-col px-5 py-16 md:py-24">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Icon name="Sprout" size={22} />
          </div>
          <h1 className="mt-4 font-head text-[28px] font-extrabold">Вход в журнал</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Читать можно без регистрации. Аккаунт нужен, чтобы публиковать статьи.
          </p>
        </div>

        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="signup">Регистрация</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-5 space-y-4">
            {field('l-email', 'Почта', 'email', email, setEmail, errors.email, 'ivan@example.ru')}
            {field('l-pass', 'Пароль', 'password', password, setPassword, errors.password)}
            <Button className="h-11 w-full rounded-full" onClick={() => submit('login')}>
              Войти
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="mt-5 space-y-4">
            {field('s-name', 'Имя и фамилия', 'text', name, setName, errors.name, 'Иван Воробьёв')}
            {field('s-email', 'Почта', 'email', email, setEmail, errors.email, 'ivan@example.ru')}
            {field('s-pass', 'Пароль', 'password', password, setPassword, errors.password)}
            <Button className="h-11 w-full rounded-full" onClick={() => submit('signup')}>
              Создать аккаунт
            </Button>
            <p className="flex items-start gap-2 text-[13px] leading-relaxed text-muted-foreground">
              <Icon name="Info" size={15} className="mt-0.5 flex-none" />
              Регистрируясь, вы соглашаетесь с правилами журнала.
            </p>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AuthPage;
