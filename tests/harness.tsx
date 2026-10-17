import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/styles/tokens.css';
import { Modal, ConfirmModal } from '../src/components/ui/modal';
import { Sheet } from '../src/components/ui/sheet';
import { ToastProvider, useToast } from '../src/components/ui/toast';
import { Select } from '../src/components/ui/select';
import { FileUpload } from '../src/components/ui/input';
import { Button } from '../src/components/ui/button';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
function Harness() {
  const [modal, setModal] = useState(false),
    [confirm, setConfirm] = useState(false),
    [sheet, setSheet] = useState(false),
    [files, setFiles] = useState<string[]>([]);
  const toast = useToast();
  const auth = useAuth();
  const theme = useTheme();
  return (
    <main className="space-y-4 p-8">
      <p data-testid="auth">
        {auth.isLoading ? 'loading' : auth.user?.username || 'anonymous'}
      </p>
      <Button
        onClick={() =>
          void auth.login({ email: 'alex@example.com', password: 'test-only' })
        }
      >
        Log in
      </Button>
      <Button onClick={() => void auth.logout()}>Log out</Button>
      <Button onClick={() => theme.setTheme('dark')}>Dark theme</Button>
      <Button onClick={() => setModal(true)}>Open modal</Button>
      <Modal
        open={modal}
        onOpenChange={setModal}
        title="Example modal"
        description="A test dialog"
        footer={<Button onClick={() => setModal(false)}>Done</Button>}
      >
        Modal body
      </Modal>
      <Button onClick={() => setConfirm(true)}>Confirm deletion</Button>
      <ConfirmModal
        open={confirm}
        onOpenChange={setConfirm}
        onConfirm={() => {
          setConfirm(false);
          toast({ title: 'Deleted', variant: 'success' });
        }}
      />
      <Button onClick={() => setSheet(true)}>Open sheet</Button>
      <Sheet
        open={sheet}
        onOpenChange={setSheet}
        title="Example sheet"
        side="bottom"
      >
        Sheet body
      </Sheet>
      <Select
        label="Institution"
        options={[
          { value: 'one', label: 'University one' },
          { value: 'two', label: 'University two' },
        ]}
      />
      <FileUpload
        accept=".txt"
        onFiles={(files) => setFiles(files.map((f) => f.name))}
      />
      <p data-testid="files">{files.join(', ')}</p>
      <Button
        onClick={() =>
          toast({ title: 'Saved successfully', variant: 'success' })
        }
      >
        Show toast
      </Button>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <AuthProvider>
      <ToastProvider>
        <Harness />
      </ToastProvider>
    </AuthProvider>
  </ThemeProvider>,
);
