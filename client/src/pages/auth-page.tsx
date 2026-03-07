import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff, Copy, CheckCircle2 } from "lucide-react";
import { BANGLADESH_BOARDS, HSC_GROUPS } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";

const SSC_GROUPS = ["Science", "Business Studies", "Humanities"] as const;

export default function AuthPage() {
  const { user } = useAuth();
  useSEO({ title: "Login / Register", description: "Sign in or create your Crack-CU account to access courses, mock tests, and study resources for CU admission preparation.", path: "/auth" });
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8" data-testid="page-auth">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Welcome to Crack-CU</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in or create your account</p>
        </div>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
            <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function LoginForm() {
  const { loginMutation } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState<"username" | "whatsapp">("username");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    loginMutation.mutate({ identifier: identifier.trim(), password, loginType });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 mb-2">
            <Button type="button" variant={loginType === "username" ? "default" : "outline"} size="sm" onClick={() => setLoginType("username")} data-testid="button-login-username">
              Username
            </Button>
            <Button type="button" variant={loginType === "whatsapp" ? "default" : "outline"} size="sm" onClick={() => setLoginType("whatsapp")} data-testid="button-login-whatsapp">
              WhatsApp
            </Button>
          </div>
          <div>
            <Label htmlFor="login-identifier">{loginType === "username" ? "Username" : "WhatsApp Number"}</Label>
            <Input
              id="login-identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={loginType === "username" ? "e.g., S25123456" : "01XXXXXXXXX"}
              data-testid="input-login-identifier"
            />
          </div>
          <div>
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                data-testid="input-login-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loginMutation.isPending} data-testid="button-login-submit">
            {loginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RegisterForm() {
  const { registerMutation } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [generatedUsername, setGeneratedUsername] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    whatsapp: "",
    email: "",
    hscRoll: "",
    hscReg: "",
    hscYear: "",
    hscGroup: "",
    hscBoard: "",
    sscRoll: "",
    sscReg: "",
    sscYear: "",
    sscGroup: "",
    sscBoard: "",
    password: "",
    confirmPassword: "",
  });

  function updateField(key: string, value: string) {
    setForm({ ...form, [key]: value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    const { confirmPassword, ...data } = form;
    registerMutation.mutate(data, {
      onSuccess: (res) => {
        setGeneratedUsername(res.username);
        toast({ title: `Account created! Your username is: ${res.username}` });
      },
    });
  }

  function copyUsername() {
    if (generatedUsername) {
      navigator.clipboard.writeText(generatedUsername);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (generatedUsername) {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
          <h3 className="text-lg font-semibold">Registration Successful!</h3>
          <p className="text-sm text-muted-foreground">Your auto-generated username is:</p>
          <div className="flex items-center justify-center gap-2">
            <code className="text-lg font-mono bg-muted px-3 py-1.5 rounded-md" data-testid="text-generated-username">{generatedUsername}</code>
            <Button size="icon" variant="outline" onClick={copyUsername} data-testid="button-copy-username">
              {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Save this username. You'll use it to sign in.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name *</Label>
            <Input value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} placeholder="Your full name" required data-testid="input-fullname" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>WhatsApp *</Label>
              <Input value={form.whatsapp} onChange={(e) => updateField("whatsapp", e.target.value)} placeholder="01XXXXXXXXX" required data-testid="input-whatsapp" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="your@email.com" required data-testid="input-email" />
            </div>
          </div>

          <fieldset className="border rounded-md p-3 space-y-3">
            <legend className="text-sm font-medium px-1">HSC Information</legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>HSC Roll *</Label>
                <Input value={form.hscRoll} onChange={(e) => updateField("hscRoll", e.target.value)} placeholder="Roll" required data-testid="input-hsc-roll" />
              </div>
              <div>
                <Label>HSC Reg *</Label>
                <Input value={form.hscReg} onChange={(e) => updateField("hscReg", e.target.value)} placeholder="Registration" required data-testid="input-hsc-reg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>HSC Year *</Label>
                <Select value={form.hscYear} onValueChange={(v) => updateField("hscYear", v)}>
                  <SelectTrigger data-testid="select-hsc-year"><SelectValue placeholder="Year" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 9 }, (_, i) => String(2022 + i)).map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>HSC Group *</Label>
                <Select value={form.hscGroup} onValueChange={(v) => updateField("hscGroup", v)}>
                  <SelectTrigger data-testid="select-hsc-group"><SelectValue placeholder="Group" /></SelectTrigger>
                  <SelectContent>
                    {HSC_GROUPS.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>HSC Board *</Label>
              <Select value={form.hscBoard} onValueChange={(v) => updateField("hscBoard", v)}>
                <SelectTrigger data-testid="select-hsc-board"><SelectValue placeholder="Board" /></SelectTrigger>
                <SelectContent>
                  {BANGLADESH_BOARDS.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </fieldset>

          <fieldset className="border rounded-md p-3 space-y-3">
            <legend className="text-sm font-medium px-1">SSC Information</legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>SSC Roll *</Label>
                <Input value={form.sscRoll} onChange={(e) => updateField("sscRoll", e.target.value)} placeholder="Roll" required data-testid="input-ssc-roll" />
              </div>
              <div>
                <Label>SSC Reg *</Label>
                <Input value={form.sscReg} onChange={(e) => updateField("sscReg", e.target.value)} placeholder="Registration" required data-testid="input-ssc-reg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>SSC Year *</Label>
                <Select value={form.sscYear} onValueChange={(v) => updateField("sscYear", v)}>
                  <SelectTrigger data-testid="select-ssc-year"><SelectValue placeholder="Year" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 9 }, (_, i) => String(2022 + i)).map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>SSC Group *</Label>
                <Select value={form.sscGroup} onValueChange={(v) => updateField("sscGroup", v)}>
                  <SelectTrigger data-testid="select-ssc-group"><SelectValue placeholder="Group" /></SelectTrigger>
                  <SelectContent>
                    {SSC_GROUPS.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>SSC Board *</Label>
              <Select value={form.sscBoard} onValueChange={(v) => updateField("sscBoard", v)}>
                <SelectTrigger data-testid="select-ssc-board"><SelectValue placeholder="Board" /></SelectTrigger>
                <SelectContent>
                  {BANGLADESH_BOARDS.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </fieldset>

          <div>
            <Label>Password *</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="Min 6 characters"
                required
                data-testid="input-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div>
            <Label>Confirm Password *</Label>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              placeholder="Re-enter password"
              required
              data-testid="input-confirm-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={registerMutation.isPending} data-testid="button-register-submit">
            {registerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Account
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
