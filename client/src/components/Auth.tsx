import { useState } from 'react';
import { api } from '../axios';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import useAuthStore from '../stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';


type UserDataType = {
  firstName: string;
  lastName: string;
  userName: string;
  emailAddress: string;
  password: string;
};

type LoginDataType = {
  identifier: string;
  password: string;
};

// Register mutation
const registerUser = async (data: UserDataType) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

// Login mutation
const loginUser = async (data: LoginDataType) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export default function Auth() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  
  // Form states
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Register mutation
  const registerMutation = useMutation({
    mutationKey: ["register"],
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Signup successful!");
      setActiveTab('signin');
      setLoginIdentifier(emailAddress);
      // Clear form
      setFirstName('');
      setLastName('');
      setUserName('');
      setEmailAddress('');
      setPassword('');
      setConfirmPassword('');
      setPasswordError('');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Registration failed");
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationKey: ["login"],
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Login successful!");
        setUser(data.user);
        navigate('/dashboard');
      } else {
        toast.error(data.message || "Login failed");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Login failed");
    },
  });

  // Handle register
  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError('');
    
    // Validation
    if (!firstName || !lastName || !emailAddress || !password || !confirmPassword) {
      return toast.error("All fields are required");
    }
    
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return toast.error("Passwords do not match");
    }

    const userData: UserDataType = {
      firstName,
      lastName,
      userName: userName || `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      emailAddress,
      password, // Use password, not registerPassword
    };

    registerMutation.mutate(userData);
  };

  // Handle login
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!loginIdentifier || !loginPassword) {
      return toast.error("Please enter email/username and password");
    }

    const loginData: LoginDataType = {
      identifier: loginIdentifier,
      password: loginPassword,
    };

    loginMutation.mutate(loginData);
  };

  const { user } = useAuthStore();
  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <h1 className="font-bold text-4xl bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            Welcome to Notely
          </h1>
          <p className="text-gray-600">
            Your personal space for ideas and inspiration
          </p>
        </div>

        <Card className="border-gray-200 shadow-lg">
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')} 
            className="w-full"
          >
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>

            {/* Login Form */}
            <TabsContent value="signin">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="identifier">Email or Username</Label>
                    <Input
                      id="identifier"
                      placeholder="example@gmail.com or username"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      required
                      disabled={loginMutation.isPending}
                      className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loginPassword">Password</Label>
                    <Input
                      id="loginPassword"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={loginMutation.isPending}
                      className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </CardContent>
              </form>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="signup">
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Kibet"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        disabled={registerMutation.isPending}
                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Dennis"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        disabled={registerMutation.isPending}
                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="userName">Username (optional)</Label>
                    <Input
                      id="userName"
                      type="text"
                      placeholder="kibet1"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      disabled={registerMutation.isPending}
                      className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emailAddress">Email</Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      placeholder="email@example.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      required
                      disabled={registerMutation.isPending}
                      className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={registerMutation.isPending}
                      className={`border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
                        passwordError ? 'border-red-500' : ''
                      }`}
                    />
                    <p className="text-xs text-gray-500">
                      Must be at least 6 characters long
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      required
                      disabled={registerMutation.isPending}
                      className={`border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
                        passwordError ? 'border-red-500' : ''
                      }`}
                    />
                    {passwordError && (
                      <p className="text-xs text-red-500">{passwordError}</p>
                    )}
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </CardContent>
              </form>
            </TabsContent>
          </Tabs>
          
          
        </Card>
      </div>
    </div>
  );
}