
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
            const result = await getRedirectResult(auth);
            if (result && result.user) {
                console.log('Redirect result obtained:', result.user.email);
                const user = result.user;
                const userRef = doc(db, 'users', user.uid);
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
                }
                // The onAuthStateChanged listener below will handle setting the user state
                // and we don't need to manually set it here.
            }
        } catch (error) {
            console.error("Error processing redirect result:", error);
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('onAuthStateChanged triggered. User:', user?.email);
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    };

    const unsubscribePromise = processAuth();

    return () => {
        unsubscribePromise.then(unsubscribe => {
            if (unsubscribe) {
                console.log('Unsubscribing from onAuthStateChanged');
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
      await firebaseSignOut(auth);
      // No need to explicitly set user to null, onAuthStateChanged will handle it
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    // This effect should run whenever loading or user state changes.
    console.log('Routing effect triggered:', { user: user?.email, isLoginPage });
    if (loading) {
      return; // Don't do anything until auth state is resolved
    }

    if (user && isLoginPage) {
      console.log('User is logged in on login page, redirecting to /');
      router.replace('/');
    } else if (!user && !isLoginPage) {
      console.log('User is not logged in, redirecting to /login');
      router.replace('/login');
    }
  }, [user, isLoginPage, loading, router]);


  const contextValue = { user, loading, signInWithGoogle, signOut };

  if (loading) {
    console.log('Auth not ready, showing loading screen.');
    return <AuthLoading />;
  }

  if (user && !isLoginPage) {
    return (
        <AuthContext.Provider value={contextValue}>
            <AppLayout>{children}</AppLayout>
        </AuthContext.Provider>
    );
  }

  if (!user && isLoginPage) {
      return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
  }
  
  // This handles the transitional state where redirects are about to happen.
  // Showing the loading screen prevents content flashing.
  return <AuthLoading />;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
