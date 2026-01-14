"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useContexts } from "@/hooks/use-contexts";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { contexts, isLoading, addContext, updateContext, deleteContext } = useContexts();
  const { toast } = useToast();

  const [newContextName, setNewContextName] = useState("");
  const [newContextColor, setNewContextColor] = useState("#3b82f6");
  const [editingContext, setEditingContext] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleAddContext = async () => {
    if (!newContextName.trim()) {
      toast({
        title: "Error",
        description: "Context name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await addContext({
        name: newContextName.trim(),
        color: newContextColor,
      });
      setNewContextName("");
      setNewContextColor("#3b82f6");
      toast({
        title: "Success",
        description: "Context added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add context",
        variant: "destructive",
      });
    }
  };

  const handleStartEdit = (contextName: string, contextColor: string) => {
    setEditingContext(contextName);
    setEditName(contextName);
    setEditColor(contextColor);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editingContext) return;

    try {
      await updateContext(editingContext, {
        name: editName.trim(),
        color: editColor,
      });
      setEditingContext(null);
      toast({
        title: "Success",
        description: "Context updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update context",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingContext(null);
    setEditName("");
    setEditColor("");
  };

  const handleDeleteContext = async (contextName: string) => {
    try {
      await deleteContext(contextName);
      toast({
        title: "Success",
        description: "Context deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete context",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl">
        <header className="mb-12">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-4xl font-headline font-bold text-primary">Settings</h1>
              <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {/* User Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Display Name</Label>
                <p className="text-sm text-muted-foreground mt-1">{user?.displayName || "Not set"}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
              </div>
              <Separator />
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Context Management Section */}
          <Card>
            <CardHeader>
              <CardTitle>Contexts</CardTitle>
              <CardDescription>
                Manage your context tags for organizing tasks by location or situation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Context */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <Label>Add New Context</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Context name (e.g., Work, Home)"
                    value={newContextName}
                    onChange={(e) => setNewContextName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddContext();
                      }
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newContextColor}
                      onChange={(e) => setNewContextColor(e.target.value)}
                      className="h-10 w-14 rounded border cursor-pointer"
                      title="Choose color"
                    />
                    <Button onClick={handleAddContext} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Existing Contexts */}
              <div className="space-y-2">
                <Label>Your Contexts</Label>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : contexts.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No contexts yet. Add your first context above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {contexts.map((context) => (
                      <div
                        key={context.name}
                        className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {editingContext === context.name ? (
                          <>
                            <input
                              type="color"
                              value={editColor}
                              onChange={(e) => setEditColor(e.target.value)}
                              className="h-8 w-12 rounded border cursor-pointer flex-shrink-0"
                            />
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-grow"
                              autoFocus
                            />
                            <Button size="icon" variant="ghost" onClick={handleSaveEdit}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <div
                              className="w-6 h-6 rounded-full flex-shrink-0"
                              style={{ backgroundColor: context.color }}
                            />
                            <span className="flex-grow">{context.name}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleStartEdit(context.name, context.color)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Context?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove "{context.name}" from all tasks. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteContext(context.name)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* App Information */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>Application information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label>Version</Label>
                <p className="text-sm text-muted-foreground mt-1">1.0.0</p>
              </div>
              <div>
                <Label>Build</Label>
                <p className="text-sm text-muted-foreground mt-1">Next.js 15.5.9</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
