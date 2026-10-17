import { InstitutionPicker, type Institution } from './institution-picker';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { PasswordInput } from './password-input';
import { Selection } from './selection';
import { Button, ActionError, useAction } from './common';
import { api, UserFacingError } from './api';
import './signup.css';
type Faculty = {
  id: string;
  name: string;
  programmes: {
    id: string;
    name: string;
  }[];
};
const titles = [
  'Choose your institution',
  'Your faculty',
  'Your programme',
  'Student ID (optional)',
  'Create your account',
];
function RegistrationProgress({ step }: { step: number }) {
  return (
    <ol
      className="signup-progress"
      aria-label={`Registration step ${step + 1} of 5`}
    >
      {titles.map((title, index) => (
        <li
          key={title}
          aria-current={index === step ? 'step' : undefined}
          className={index <= step ? 'completed' : ''}
        >
          <span aria-hidden="true">{index < step ? '✓' : index + 1}</span>
          <span className="sr-only">
            {title}
            {index < step ? ', complete' : ''}
          </span>
        </li>
      ))}
    </ol>
  );
}
export function SignupWizard() {
  const navigate = useNavigate(),
    action = useAction(),
    heading = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(0),
    [kind, setKind] = useState('student');
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [manualInstitution, setManualInstitution] = useState(false),
    [institutionName, setInstitutionName] = useState(''),
    [institutionType, setInstitutionType] = useState('university');
  const [faculties, setFaculties] = useState<Faculty[]>([]),
    [facultyId, setFacultyId] = useState(''),
    [facultyName, setFacultyName] = useState('');
  const [programmeId, setProgrammeId] = useState(''),
    [programmeName, setProgrammeName] = useState(''),
    [studentId, setStudentId] = useState('');
  const [lookupError, setLookupError] = useState(false),
    [retry, setRetry] = useState(0);
  const [displayName, setDisplayName] = useState(''),
    [username, setUsername] = useState(''),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [confirm, setConfirm] = useState('');
  const faculty = faculties.find((f) => f.id === facultyId);
  useEffect(() => {
    let active = true;
    setFaculties([]);
    if (institution)
      api('/academics?institution_id=' + institution.id)
        .then((r) => {
          if (active) setFaculties(r.faculties);
        })
        .catch(() => {
          if (active) setLookupError(true);
        });
    return () => {
      active = false;
    };
  }, [institution, retry]);
  useEffect(() => {
    heading.current?.focus();
    action.clear();
  }, [step]);
  function resetAcademic() {
    setFacultyId('');
    setFacultyName('');
    setProgrammeId('');
    setProgrammeName('');
  }
  async function next(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    action.clear();
    if (step < 4) {
      if (step === 0 && !manualInstitution && !institution) {
        await action.run(async () => {
          throw new UserFacingError(
            'Select an institution or submit a missing institution.',
          );
        });
        return;
      }
      if (
        (step === 1 && !facultyId && !facultyName.trim()) ||
        (step === 2 && !programmeId && !programmeName.trim())
      ) {
        await action.run(async () => {
          throw new UserFacingError(
            'Select an option or enter the missing academic name.',
          );
        });
        return;
      }
      setStep(step + 1);
      return;
    }
    const result = await action.run(async () => {
      if (password !== confirm)
        throw new UserFacingError('Passwords do not match.');
      if (new TextEncoder().encode(password).length > 72)
        throw new UserFacingError(
          'Password must be no more than 72 UTF-8 bytes.',
        );
      return api('/auth/register', 'POST', {
        account_type: kind,
        display_name: displayName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim(),
        password,
        ...(kind === 'student' && studentId.trim()
          ? { student_id: studentId.trim() }
          : {}),
        academic_context: {
          ...(manualInstitution
            ? {
                institution_name: institutionName.trim(),
                institution_type: institutionType,
              }
            : { institution_id: institution!.id }),
          ...(facultyId
            ? { faculty_id: facultyId }
            : { faculty_name: facultyName.trim() }),
          ...(programmeId
            ? { programme_id: programmeId }
            : { programme_name: programmeName.trim() }),
        },
      });
    });
    if (result)
      navigate('/verify-email', {
        state: {
          email: result.email,
          catalogueStatus: result.catalogue_status,
          registrationAccountType: kind,
        },
      });
  }
  return (
    <form className="signup-wizard" onSubmit={(e) => void next(e)}>
      <RegistrationProgress step={step} />
      <h3 ref={heading} tabIndex={-1}>
        {titles[step]}
      </h3>
      {step === 0 && (
        <>
          <p>
            Find your Nigerian university, polytechnic or college of education.
          </p>
          <label>
            Join CONXEE as
            <Selection
              aria-label="Account type"
              value={kind}
              onChange={(e) => {
                setKind(e.target.value);
                setStudentId('');
              }}
            >
              <option value="student">Student</option>
              <option value="aspirant">Aspirant — seeking admission</option>
            </Selection>
          </label>
          {!manualInstitution ? (
            <>
              <InstitutionPicker
                value={institution}
                onChange={(selected) => {
                  if (institution?.id !== selected.id) resetAcademic();
                  setInstitution(selected);
                }}
              />
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setManualInstitution(true);
                  setInstitution(null);
                  resetAcademic();
                }}
              >
                My institution is missing
              </Button>
            </>
          ) : (
            <>
              <label>
                Institution name
                <Input
                  required
                  minLength={3}
                  maxLength={200}
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                />
              </label>
              <label>
                Institution type
                <Selection
                  value={institutionType}
                  onChange={(e) => setInstitutionType(e.target.value)}
                >
                  <option value="university">University</option>
                  <option value="polytechnic">Polytechnic</option>
                  <option value="college_of_education">
                    College of education
                  </option>
                </Selection>
              </label>
              <p>
                Your submission will be reviewed before it enters the catalogue.
              </p>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setManualInstitution(false);
                  resetAcademic();
                }}
              >
                Search listed institutions
              </Button>
            </>
          )}
        </>
      )}
      {(step === 1 || step === 2) && (
        <>
          <p>
            {kind === 'aspirant' ? 'Choose your intended' : 'Choose your'}{' '}
            {step === 1 ? 'faculty or school' : 'department or programme'}.
            Missing names are sent for catalogue review.
          </p>
          {step === 1 ? (
            <>
              <label>
                Faculty
                <Selection
                  aria-label="Faculty"
                  value={facultyId}
                  onChange={(e) => {
                    setFacultyId(e.target.value);
                    setFacultyName('');
                    setProgrammeId('');
                    setProgrammeName('');
                  }}
                >
                  <option value="">Enter a missing faculty below</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </Selection>
              </label>
              {!facultyId && (
                <label>
                  Missing faculty / school name
                  <Input
                    required
                    minLength={3}
                    maxLength={150}
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                  />
                </label>
              )}
            </>
          ) : (
            <>
              <label>
                Department / programme
                <Selection
                  aria-label="Department / programme"
                  value={programmeId}
                  onChange={(e) => {
                    setProgrammeId(e.target.value);
                    setProgrammeName('');
                  }}
                >
                  <option value="">Enter a missing programme below</option>
                  {faculty?.programmes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Selection>
              </label>
              {!programmeId && (
                <label>
                  Missing department / programme name
                  <Input
                    required
                    minLength={3}
                    maxLength={150}
                    value={programmeName}
                    onChange={(e) => setProgrammeName(e.target.value)}
                  />
                </label>
              )}
            </>
          )}
        </>
      )}
      {step === 3 && (
        <>
          {kind === 'student' ? (
            <>
              <p>You can register without a student ID.</p>
              <label>
                Student ID (optional)
                <Input
                  aria-label="Student ID"
                  maxLength={100}
                  autoComplete="off"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </label>
              <p className="signup-policy">
                Your ID stays private. Providing it does not verify student
                eligibility. An independent eligibility approval is required for
                the verified-student badge.
              </p>
            </>
          ) : (
            <p>
              Aspirants do not need a student ID. Your aspirant account
              permissions remain separate from student accounts.
            </p>
          )}
        </>
      )}
      {step === 4 && (
        <>
          <div className="signup-summary">
            <strong>
              {manualInstitution ? institutionName : institution?.name}
            </strong>
            <span>
              {faculty?.name || facultyName} ·{' '}
              {faculty?.programmes.find((p) => p.id === programmeId)?.name ||
                programmeName}
            </span>
            <span>
              {kind === 'student'
                ? 'Student · eligibility unverified'
                : 'Aspirant'}
            </span>
          </div>
          <label>
            Display name
            <Input
              required
              minLength={2}
              maxLength={50}
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </label>
          <label>
            Username
            <Input
              aria-label="Username"
              aria-describedby="signup-username-hint"
              required
              minLength={3}
              maxLength={30}
              autoCapitalize="none"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <small id="signup-username-hint">
              3–30 letters, numbers or punctuation. No spaces or emoji.
            </small>
          </label>
          <label>
            Email
            <Input
              required
              type="email"
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <PasswordInput
              aria-label="Password"
              aria-describedby="signup-password-hint"
              required
              minLength={12}
              maxLength={72}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <small id="signup-password-hint">
              At least 12 characters; no more than 72 UTF-8 bytes.
            </small>
          </label>
          <label>
            Confirm password
            <PasswordInput
              aria-label="Confirm password"
              required
              minLength={12}
              maxLength={72}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                action.clear();
              }}
            />
          </label>
          <p>
            Email confirmation secures your account. It does not establish
            student eligibility.
          </p>
        </>
      )}
      {lookupError && step < 3 && (
        <p role="status">
          The catalogue could not load. Enter missing names or{' '}
          <button type="button" onClick={() => setRetry(retry + 1)}>
            retry
          </button>
          .
        </p>
      )}
      <ActionError error={action.error} />
      <div className="signup-actions">
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            disabled={action.busy}
            onClick={() => setStep(step - 1)}
          >
            Back
          </Button>
        )}
        <Button disabled={action.busy} type="submit">
          {action.busy
            ? 'Creating account…'
            : step === 4
              ? 'Create account'
              : step === 3 && !studentId
                ? 'Continue without ID'
                : 'Continue'}
        </Button>
      </div>
    </form>
  );
}
