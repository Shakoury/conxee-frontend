import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
export interface RegistrationData {
  account_type: 'student' | 'aspirant';
  institution_id: string;
  institution_name: string;
  institution_source_id: string;
  faculty: string;
  department: string;
  display_name: string;
  username: string;
  email: string;
  password: string;
  student_id: string;
  emailVerified: boolean;
  codeSent: boolean;
  resendAt: number;
}
const empty: RegistrationData = {
  account_type: 'student',
  institution_id: '',
  institution_name: '',
  institution_source_id: '',
  faculty: '',
  department: '',
  display_name: '',
  username: '',
  email: '',
  password: '',
  student_id: '',
  emailVerified: false,
  codeSent: false,
  resendAt: 0,
};
interface Registration {
  data: RegistrationData;
  update: (patch: Partial<RegistrationData>) => void;
  reset: () => void;
}
const Context = createContext<Registration | null>(null);
export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RegistrationData>(empty);
  const update = useCallback((patch: Partial<RegistrationData>) => {
    setData((current) => ({ ...current, ...patch }));
  }, []);
  const reset = useCallback(() => setData({ ...empty }), []);
  return (
    <Context.Provider value={{ data, update, reset }}>
      {children}
    </Context.Provider>
  );
}
export function useRegistration() {
  const value = useContext(Context);
  if (!value) throw Error('RegistrationProvider is required');
  return value;
}
