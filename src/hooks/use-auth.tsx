
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User, GoogleAuthProvider, signInWithRedirect, signOut as firebaseSignOut, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/components/firebase-provider';
import AppLayout from '@/components/app-layout';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthLoading() {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, db } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  console.log('AuthProvider render:', {
    loading,
    user: user?.email,
    pathname,
  });

  useEffect(() => {
    if (!auth || !db) return;

    // This combined effect handles both the redirect result and auth state changes.
    const processAuth = async () => {
        console.log('Starting auth processing...');
        try {
            console.log('Calling getRedirectResult...');
            const result = await getRedirectResult(auth);
            if (result && result.user) {
                console.log('Redirect result obtained:', result.user.email);
                const user = result.user;
                const userRef = doc(db, 'users', user.uid);
                console.log('Checking for user document...');
                const docSnap = await getDoc(userRef);
                if (!docSnap.exists()) {
                    console.log('User document does not exist, creating...');
                    await setDoc(userRef, {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        createdAt: serverTimestamp(),
                    });
                     console.log('User document created.');
                } else {
                    console.log('User document already exists.');
                }
            } else {
                console.log('No redirect result or no user in result.');
            }
        } catch (error) {
            console.error("Error processing redirect result:", error);
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('onAuthStateChanged triggered. User:', user?.email);
            setUser(user);
            setLoading(false);
            console.log('State updated: user set, loading set to false.');
        });

        return () => {
             console.log('Unsubscribing from onAuthStateChanged');
             unsubscribe();
        };
    };

    const unsubscribePromise = processAuth();

    return () => {
        unsubscribePromise.then(unsubscribe => {
            if (unsubscribe) {
                unsubscribe();
            }
        });
    };
  }, [auth, db]);

  const signInWithGoogle = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      console.log('Initiating signInWithRedirect...');
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      console.log('Signing out...');
      await firebaseSignOut(auth);
      console.log('Sign out successful.');
      // No need to explicitly set user to null, onAuthStateChanged will handle it
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    console.log('Routing effect triggered:', { user, isLoginPage, loading });
    if (loading) {
      console.log('Routing effect: loading, so doing nothing.');
      return; // Don't do anything until auth state is resolved
    }

    if (user && isLoginPage) {
      console.log('Routing effect: User is logged in on login page, redirecting to /');
      router.replace('/');
    } else if (!user && !isLoginPage) {
      console.log('Routing effect: User is not logged in, redirecting to /login');
      router.replace('/login');
    } else {
      console.log('Routing effect: No redirect condition met.');
    }
  }, [user, isLoginPage, loading, router]);


  if (loading) {
    console.log('Auth not ready, showing loading screen.');
    return <AuthLoading />;
  }
  
  if (!user && !isLoginPage) {
    console.log('Not logged in and not on login page, showing loading screen to wait for redirect.');
    return <AuthLoading />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {user && !isLoginPage ? <AppLayout>{children}</AppLayout> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
