
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User, GoogleAuthProvider, signInWithRedirect, signOut as firebaseSignOut, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  const [authReady, setAuthReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  console.log('AuthProvider render:', {
    loading,
    authReady,
    user: user?.email,
    pathname,
  });

  useEffect(() => {
    if (!auth || !db) return;

    console.log('Auth provider effect running');

    // This handles the redirect result after signing in
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          console.log('Redirect result obtained:', result.user.email);
          const user = result.user;
          const userRef = doc(db, 'users', user.uid);
          return getDoc(userRef).then(docSnap => {
            if (!docSnap.exists()) {
              console.log('User document does not exist, creating...');
              return setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: new Date(),
              });
            }
            console.log('User document already exists.');
          });
        }
      })
      .catch((error) => {
        console.error("Error getting redirect result:", error);
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('onAuthStateChanged triggered. User:', user?.email);
      setUser(user);
      setLoading(false);
      setAuthReady(true);
    });

    return () => {
      console.log('Unsubscribing from onAuthStateChanged');
      unsubscribe();
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
      setUser(null); // Explicitly set user to null on sign out
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    console.log('Routing effect triggered:', { authReady, user: user?.email, isLoginPage });
    if (authReady) {
      if (!user && !isLoginPage) {
        console.log('Redirecting to /login');
        router.replace('/login');
      }
      if (user && isLoginPage) {
        console.log('Redirecting to /');
        router.replace('/');
      }
    }
  }, [user, authReady, isLoginPage, router]);

  if (!authReady) {
    console.log('Auth not ready, showing loading screen.');
    return <AuthLoading />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {user && !isLoginPage ? (
        <AppLayout>{children}</AppLayout>
      ) : (
        children
      )}
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
