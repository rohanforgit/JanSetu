import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit3,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Phone,
  UserCheck,
  Cpu,
  Type,
  ImageIcon
} from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Textarea } from '../../shared/components/Textarea';
import { FileUpload } from '../../shared/components/FileUpload';
import { Modal } from '../../shared/components/Modal';
import { speechService } from '../../services/speech/speechService';
import { locationService } from '../../services/location/locationService';
import { issuesApi } from '../../services/api/issuesApi';
import { authApi } from '../../services/api/authApi';
import { useAuth } from '../../services/auth/AuthProvider';
import { useTranslation } from '../../shared/i18n/LanguageContext';
import confetti from 'canvas-confetti';
import { LeafletMapPicker } from '../../shared/components/LeafletMapPicker';

export const ReportIssue = ({ onNavigate }) => {
  const { t, currentLang } = useTranslation();
  const { user, isAuthenticated, login, loginWithToken } = useAuth();

  // Step 1: Photo & Description Input
  // Step 2: Listening / Recording
  // Step 3: AI Multimodal Processing
  // Step 4: Severity & Department Review (What AI Understood + Edit Details)
  // Step 5: Mobile Number OTP Request
  // Step 6: Enter OTP
  // Step 7: New User Name Entry
  // Step 8: Success (Persisted in MongoDB)
  const [step, setStep] = useState(1);

  // Draft Data State
  const [images, setImages] = useState([]);
  const [voiceText, setVoiceText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [useTextInput, setUseTextInput] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState(null);

  // Location State
  const [location, setLocation] = useState({
    latitude: 28.5355,
    longitude: 77.3910,
    area: 'University Sector',
    landmark: 'Main Entrance Gate',
    address: '📍 University Sector, Main Gate'
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // AI Structured Output State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Auth & OTP State
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [serverHint, setServerHint] = useState(null);

  // New User Name State
  const [fullName, setFullName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [createdIssueId, setCreatedIssueId] = useState(null);

  // Trigger AI Vision & Description Processing when entering Step 3
  useEffect(() => {
    if (step === 3) {
      processAiAndLocation();
    }
  }, [step]);

  // Confetti trigger on success screen
  useEffect(() => {
    if (step === 8) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [step]);

  // Multilingual Voice Recording Handler
  useEffect(() => {
    if (step === 3 && !isAnalyzing) {
      processAiAndLocation();
    }
  }, [step]);

  const handleStartRecording = () => {
    setRecordingError(null);
    setIsRecording(true);
    setInterimText('');
    setStep(2);

    const started = speechService.startListening({
      lang: currentLang || 'en',
      onResult: ({ fullText, interimTranscript }) => {
        setVoiceText(fullText);
        setInterimText(interimTranscript);
      },
      onError: (err) => {
        console.warn('[SPEECH RECORDING WARN]', err);
        setRecordingError(err.message || 'Speech recognition failed. Please allow microphone access or use text input.');
        setIsRecording(false);
      },
      onEnd: (finalText) => {
        setIsRecording(false);
        if (finalText) {
          setVoiceText(finalText);
        }
      }
    });

    if (!started) {
      setIsRecording(false);
      setUseTextInput(true);
      setStep(1);
    }
  };

  const handleStopRecording = () => {
    const finalSpeechText = speechService.stopListening() || voiceText || '';
    if (finalSpeechText) {
      setVoiceText(finalSpeechText);
    }
    setIsRecording(false);
    setInterimText('');

    if (images.length > 0) {
      setStep(3);
      processAiAndLocation(finalSpeechText);
    } else {
      setStep(1); // Return to Step 1 to prompt user to capture a mandatory photo!
    }
  };

  // AI Multimodal Vision & Description Processing
  const processAiAndLocation = async (overrideText) => {
    setIsAnalyzing(true);
    setLocationLoading(true);

    const textToProcess = (overrideText !== undefined && overrideText !== null ? overrideText : voiceText).trim() || 'Civic problem requiring municipal attention.';

    // 1. Resolve GPS Location
    try {
      const loc = await locationService.getCurrentLocation();
      setLocation(loc);
    } catch (locErr) {
      console.warn('[LOCATION PROCESS WARN]', locErr);
      setLocationError('Geolocation unavailable. Defaulting to University Sector.');
    } finally {
      setLocationLoading(false);
    }

    // 2. Call AI Vision & Description Analysis API
    try {
      const payload = {
        title: textToProcess.slice(0, 60),
        description: textToProcess,
        evidence: images,
        location
      };
      const res = await issuesApi.previewAnalyze(payload);
      setAiAnalysis(res);
      setStep(4); // Move to Severity & Review Screen
    } catch (aiErr) {
      console.error('[AI PROCESS ERROR]', aiErr);

      // Safe fallback when AI network call fails: require visual re-verification instead of assuming emergency
      setAiAnalysis({
        isCivicIssue: false,
        confidence: 0.1,
        evidenceStatus: 'INVALID_EVIDENCE',
        consistency: 'UNKNOWN',
        category: 'UNCONFIRMED',
        department: 'NOT ASSIGNED',
        severity: 'N/A',
        priority: 0,
        summary: textToProcess.slice(0, 60) || 'Unverified Report',
        description: 'AI vision service was temporarily unavailable to verify the uploaded photo. Please retake photo or enter details manually.',
        reasoning: 'Visual verification could not be completed. Manual confirmation or photo re-take is required before routing.'
      });
      setStep(4);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Review Confirmed -> Force OTP Login if citizen is not authenticated
  const handleReviewConfirmed = async () => {
    if (user && user.id && (user.role === 'CITIZEN' || user.role === 'USER' || !user.role)) {
      await finalizeIssueCreation(user);
    } else {
      // Force OTP login flow (Step 5) - Do not allow reporting without logging in!
      setStep(5);
    }
  };

  // Request Mobile OTP
  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    setServerHint(null);
    try {
      const res = await authApi.requestOtp(mobileNumber);
      if (res.devNote) setServerHint(res.devNote);
      setOtpSent(true);
      setStep(6);
    } catch (err) {
      console.error('[OTP REQUEST ERROR]', err);
      setOtpError(err.message || 'Failed to send OTP code.');
      setStep(6);
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP & Proceed
  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    setOtpError(null);
    try {
      const authRes = await authApi.verifyOtp(mobileNumber, otpCode);
      const authUser = authRes.user;

      if (authRes.token) {
        if (loginWithToken) loginWithToken(authRes.token, authUser);
        else if (login) login(authUser, authRes.token);
      }

      if (!authUser.name || authUser.name.startsWith('Citizen (') || authUser.name === 'Citizen') {
        setIsNewUser(true);
        setStep(7); // Prompt for Name
      } else {
        await finalizeIssueCreation(authUser);
      }
    } catch (err) {
      console.error('[OTP VERIFY ERROR]', err);
      setOtpError(err.message || 'Invalid OTP code. Please check your phone or WhatsApp for the code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Save New User Name & Submit
  const handleNewUserSubmit = async () => {
    if (!fullName.trim()) return;
    const updatedUser = { ...user, name: fullName.trim() };
    await finalizeIssueCreation(updatedUser);
  };

  // Finalize MongoDB Issue Creation
  const finalizeIssueCreation = async (reporterUser) => {
    setIsSubmitting(true);
    setSubmissionError(null);

    const description = voiceText.trim() || 'Civic problem described by citizen.';
    const category = aiAnalysis?.category || 'Road Damage';
    const department = aiAnalysis?.department || 'Roads & Infrastructure';

    try {
      const created = await issuesApi.createIssue({
        title: aiAnalysis?.summary || description.slice(0, 60),
        description,
        category,
        department,
        severity: aiAnalysis?.severity || 'HIGH',
        priority: aiAnalysis?.priority || 85,
        location: {
          area: location.area,
          landmark: location.landmark,
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address
        },
        evidence: images.length > 0 ? images : ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'],
        reporter: {
          userId: reporterUser?.id || reporterUser?._id || user?.id || user?._id || (mobileNumber ? `user-${mobileNumber}` : 'demo-citizen-001'),
          name: reporterUser?.name || user?.name || fullName || 'Citizen',
          mobile: reporterUser?.mobile || user?.mobile || mobileNumber || ''
        }
      });

      setCreatedIssueId(created.issueId || created.id);
      setStep(8); // Success Screen
    } catch (err) {
      console.error('[FINAL SUBMIT ERROR]', err);
      setSubmissionError(err.message || 'Could not persist report to MongoDB right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current language display label
  const getLanguageName = (code) => {
    switch (code) {
      case 'ta': return 'Tamil (தமிழ்)';
      case 'te': return 'Telugu (తెలుగు)';
      case 'kn': return 'Kannada (ಕನ್ನಡ)';
      case 'hi': return 'Hindi (हिन्दी)';
      case 'mr': return 'Marathi (मराठी)';
      case 'bn': return 'Bengali (বাংলা)';
      case 'gu': return 'Gujarati (ગુજરાતી)';
      case 'ml': return 'Malayalam (മലയാളം)';
      default: return 'English';
    }
  };

  // -------------------------------------------------------------
  // RENDER FLOW STEPS (1 - 8)
  // ------------------------------  // SCREEN 8: SUCCESS SCREEN (CIVIC ACTION RECEIPT)
  if (step === 8) {
    return (
      <div className="container animate-slide-up" style={{ maxWidth: '560px', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
        <div style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          textAlign: 'center'
        }}>
          {/* Success Check Badge */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-resolved-bg)',
            color: 'var(--status-resolved)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-6)',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>
            Your report is now helping improve the community
          </h2>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 auto var(--space-6)', maxWidth: '400px' }}>
            Thank you, <strong>{user?.name || fullName || 'Citizen'}</strong>. Your report is now filed and assigned to the municipal queue.
          </p>

          {/* Receipt Info Panel */}
          <div style={{
            margin: 'var(--space-6) 0',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-surface-hover)',
            border: '1px dashed var(--color-border-default)',
            textAlign: 'left'
          }}>
            <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
              CIVIC TRACKING RECEIPT ID
            </span>
            <h3 style={{ fontSize: 'var(--font-xl)', fontFamily: 'monospace', fontWeight: 900, color: 'var(--color-brand-primary)', marginTop: '4px', marginBottom: 'var(--space-3)' }}>
              {createdIssueId}
            </h3>
            
            <div style={{ borderTop: '1px solid var(--color-border-default)', paddingTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
              <div>Assigned Department: <strong style={{ color: 'var(--color-text-primary)' }}>{aiAnalysis?.department || 'Assigned'}</strong></div>
              <div>Severity Rating: <strong style={{ color: 'var(--color-brand-primary)' }}>{aiAnalysis?.severity || 'HIGH'} (Priority Score: {aiAnalysis?.priority || 85})</strong></div>
              <div>Location Pin: <strong style={{ color: 'var(--color-text-primary)' }}>{location.area}</strong></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate ? onNavigate(`/track/${createdIssueId}`) : (window.location.hash = `/track/${createdIssueId}`)}
              style={{ width: '100%' }}
            >
              TRACK RESOLUTION PROGRESS
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => onNavigate ? onNavigate('/') : (window.location.hash = '/')}
              style={{ width: '100%' }}
            >
              RETURN TO HOME
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 7: NEW USER NAME ENTRY
  if (step === 7) {
    return (
      <div className="container animate-slide-up" style={{ maxWidth: '440px', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
        <div className="card-container" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-brand-subtle)',
            color: 'var(--color-brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4)'
          }}>
            <UserCheck size={24} />
          </div>
          <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
            Tell us your name
          </h2>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)', marginBottom: 'var(--space-6)' }}>
            We need a name to credit your account with civic engagement points.
          </p>

          <Input
            label="Full Name"
            placeholder="e.g. Rahul Verma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ marginBottom: 'var(--space-6)' }}
          />

          <Button
            variant="primary"
            size="lg"
            onClick={handleNewUserSubmit}
            disabled={isSubmitting || !fullName.trim()}
            style={{ width: '100%' }}
          >
            {isSubmitting ? 'SUBMITTING REPORT...' : 'SUBMIT REPORT'}
          </Button>
        </div>
      </div>
    );
  }

  // SCREEN 6: ENTER OTP
  if (step === 6) {
    return (
      <div className="container animate-slide-up" style={{ maxWidth: '440px', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
        <div className="card-container" style={{ padding: 'var(--space-8)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Security Verification
            </h2>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
              Enter the 6-digit OTP code sent to <strong>+91 {mobileNumber}</strong>
            </p>
          </div>

          {otpError && (
            <div style={{
              backgroundColor: 'var(--status-reopened-bg)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-4)',
              fontSize: 'var(--font-xs)',
              color: 'var(--status-reopened)'
            }}>
              {otpError}
            </div>
          )}

          <Input
            label="Verification Code"
            placeholder="000 000"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            maxLength={6}
            style={{ fontSize: 'var(--font-xl)', letterSpacing: '0.25em', textAlign: 'center', marginBottom: 'var(--space-6)' }}
          />

          <Button
            variant="primary"
            size="lg"
            onClick={handleVerifyOtp}
            disabled={otpLoading || otpCode.length < 6}
            style={{ width: '100%', marginBottom: 'var(--space-4)' }}
          >
            {otpLoading ? 'VERIFYING CODE...' : 'VERIFY & SUBMIT'}
          </Button>

          {serverHint && (
            <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-brand-primary)', marginTop: '8px', padding: '6px', backgroundColor: 'var(--color-brand-subtle)', borderRadius: 'var(--radius-xs)' }}>
              💡 {serverHint}
            </div>
          )}
        </div>
      </div>
    );
  }

  // SCREEN 5: VERIFY YOUR MOBILE / MANDATORY CITIZEN OTP LOGIN
  if (step === 5) {
    return (
      <div className="container animate-slide-up" style={{ maxWidth: '480px', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
        <div className="card-container" style={{ padding: 'var(--space-8)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-brand-subtle)',
              color: 'var(--color-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)'
            }}>
              <Phone size={24} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-brand-primary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em' }}>
              🔒 MANDATORY CITIZEN LOGIN
            </span>
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>
              Citizen Mobile Verify
            </h2>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
              You must log in to submit a complaint. Enter your 10-digit mobile number to receive an OTP and authorize submission to <strong>{aiAnalysis?.department || 'Department'}</strong>.
            </p>
          </div>

          {otpError && (
            <div style={{
              backgroundColor: 'var(--status-reopened-bg)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-4)',
              fontSize: 'var(--font-xs)',
              color: 'var(--status-reopened)',
              fontWeight: 700
            }}>
              ⚠️ {otpError}
            </div>
          )}

          <Input
            label="10-Digit Mobile Number"
            placeholder="e.g. 9876543210"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            maxLength={10}
            style={{ marginBottom: 'var(--space-6)' }}
          />

          <Button
            variant="primary"
            size="lg"
            onClick={handleSendOtp}
            disabled={otpLoading || mobileNumber.length < 10}
            style={{ width: '100%' }}
          >
            {otpLoading ? 'SENDING OTP CODE...' : 'SEND OTP CODE & LOGIN ➔'}
          </Button>
        </div>
      </div>
    );
  }

  // SCREEN 4: SEVERITY BASED ON DESCRIPTION & SELECT/EDIT DETAILS
  if (step === 4) {
    const isNonCivic = aiAnalysis?.isCivicIssue === false || aiAnalysis?.category === 'UNKNOWN' || aiAnalysis?.category === 'OUT OF CONTEXT' || aiAnalysis?.category === 'UNCONFIRMED' || aiAnalysis?.evidenceStatus === 'CONTRADICTORY' || aiAnalysis?.evidenceStatus === 'INVALID_EVIDENCE' || aiAnalysis?.evidenceStatus === 'NEEDS_BETTER_PHOTO';
    const isCriticalOrHigh = aiAnalysis?.severity === 'CRITICAL' || aiAnalysis?.severity === 'HIGH';

    if (isNonCivic) {
      const displayTitle = aiAnalysis?.issueTitle || (aiAnalysis?.evidenceStatus === 'CONTRADICTORY' ? 'CLAIM NOT VISUALLY VERIFIED' : 'EVIDENCE NOT VERIFIED');
      return (
        <div className="container" style={{ maxWidth: '640px', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-status-danger)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em' }}>
              STEP 3 OF 4: AI CIVIC EVIDENCE VALIDATION
            </span>
            <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--color-status-danger)', marginTop: '4px' }}>
              ⚠️ {displayTitle}
            </h1>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              The uploaded image does not provide sufficient visual evidence of a public municipal civic issue.
            </p>
          </div>

          <div className="card-container" style={{ padding: 'var(--space-8)', textAlign: 'center', border: '1px solid var(--color-status-danger)' }}>
            {images.length > 0 && (
              <img src={images[0]} alt="Uploaded Photo" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)', border: '1px solid var(--color-border-default)' }} />
            )}

            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)', textAlign: 'left' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-status-danger)', marginBottom: '4px' }}>
                ⚠️ AI Stage 1 Diagnostic Result: {aiAnalysis?.evidenceStatus || 'EVIDENCE NOT VERIFIED'}
              </div>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.5 }}>
                {aiAnalysis?.reasoning || aiAnalysis?.description || "The uploaded image does not provide sufficient visual evidence of the claimed civic issue."}
              </p>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                Category: <strong>{aiAnalysis?.category || 'UNCONFIRMED'}</strong> • Department: <strong>{aiAnalysis?.department || 'NOT ASSIGNED'}</strong> • Severity: <strong>{aiAnalysis?.severity || 'N/A'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="primary" icon={Camera} onClick={() => setStep(1)}>
                📷 RETAKE / UPLOAD NEW PHOTO
              </Button>
              <Button variant="secondary" icon={Edit3} onClick={() => setEditModalOpen(true)}>
                ✍️ ENTER DETAILS MANUALLY
              </Button>
            </div>
          </div>

          {/* Edit Modal to allow manual entry */}
          <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Enter Issue Details Manually">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Input
                label="Issue Summary Title"
                placeholder="e.g. Broken streetlight on main road"
                value={aiAnalysis?.summary === 'UNKNOWN' ? '' : aiAnalysis?.summary || ''}
                onChange={(e) => setAiAnalysis({ ...aiAnalysis, isCivicIssue: true, summary: e.target.value, category: aiAnalysis.category === 'UNKNOWN' ? 'Road Damage' : aiAnalysis.category })}
              />

              <Textarea
                label="Detailed Description"
                placeholder="Describe the civic problem in detail..."
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
                rows={4}
              />

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                  Target Department
                </label>
                <select
                  value={aiAnalysis?.department === 'UNKNOWN' ? 'Roads & Infrastructure' : aiAnalysis?.department}
                  onChange={(e) => setAiAnalysis({ ...aiAnalysis, department: e.target.value })}
                  style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)', fontSize: 'var(--font-sm)' }}
                >
                  <option value="Fire & Emergency Services">Fire & Emergency Services</option>
                  <option value="Electricity & Power Board">Electricity & Power Board</option>
                  <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                  <option value="Solid Waste Management">Solid Waste Management</option>
                  <option value="Jal Board / Water Works">Jal Board / Water Works</option>
                  <option value="Drainage & Sewerage Board">Drainage & Sewerage Board</option>
                  <option value="Public Safety & Municipal Traffic">Public Safety & Municipal Traffic</option>
                  <option value="Municipal Services">Municipal Services</option>
                </select>
              </div>

              <Button variant="primary" onClick={() => { setAiAnalysis({ ...aiAnalysis, isCivicIssue: true, category: aiAnalysis.category === 'UNKNOWN' ? 'Road Damage' : aiAnalysis.category, department: aiAnalysis.department === 'UNKNOWN' ? 'Roads & Infrastructure' : aiAnalysis.department }); setEditModalOpen(false); }}>
                SAVE & PROCEED TO SUBMIT
              </Button>
            </div>
          </Modal>
        </div>
      );
    }

    return (
      <div className="container animate-slide-up" style={{ maxWidth: '880px', paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <span className="badge" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', border: '1px solid var(--color-brand-border)', marginBottom: 'var(--space-2)' }}>
            <Sparkles size={12} style={{ marginRight: '4px' }} /> STEP 2 OF 3: AI DIAGNOSTIC REVIEW
          </span>
          <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            Verify AI Analysis
          </h1>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Check auto-generated parameters before final dispatch to municipal authorities.
          </p>
        </div>

        {/* Dynamic Duplicate Detection UI from AI Response */}
        {aiAnalysis?.possibleDuplicates && aiAnalysis.possibleDuplicates.length > 0 && (
          <div style={{
            backgroundColor: 'var(--status-verification-bg)',
            border: '1.5px solid var(--status-verification)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4) var(--space-5)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            textAlign: 'left'
          }}>
            {aiAnalysis.possibleDuplicates.map((dupItem) => (
              <div key={dupItem.issueId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>💡</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: 'var(--font-sm)', color: 'var(--color-text-primary)' }}>
                      Similar Issue Found Nearby ({(dupItem.similarity * 100).toFixed(0)}% Match)
                    </strong>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                      "{dupItem.title}" • ID: <strong style={{ fontFamily: 'monospace' }}>{dupItem.issueId}</strong>
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button
                    onClick={() => (window.location.hash = `#/track/${dupItem.issueId}`)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 14px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    View Existing Issue
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Diagnostic Results Card Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          
          {/* Photo & Exact Voice Message Recorded */}
          <div className="card-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-brand-primary)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
              🎙️ EXACT VOICE MESSAGE RECORDED
            </div>

            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-primary)', fontStyle: 'italic', lineHeight: 1.6, backgroundColor: 'var(--color-bg-surface-hover)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-brand-primary)', marginBottom: 'var(--space-4)' }}>
              "{voiceText || 'Voice message recorded by citizen.'}"
            </p>

            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
              📷 ATTACHED PHOTO EVIDENCE & VISUAL DIAGNOSTIC
            </div>

            {images.length > 0 ? (
              <img
                src={images[0]}
                alt="Uploaded Evidence"
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)' }}
              />
            ) : (
              <div style={{ height: '200px', backgroundColor: 'var(--color-bg-surface-hover)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-xs)', border: '1px dashed var(--color-border-default)' }}>
                No photo evidence uploaded
              </div>
            )}

            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.5, backgroundColor: 'var(--color-bg-surface-hover)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-2)', border: '1px solid var(--color-border-subtle)' }}>
              <strong>Visual Findings from Photo:</strong> {aiAnalysis?.photoDescription || aiAnalysis?.description || aiAnalysis?.reasoning || 'Pothole and road surface defect confirmed from camera capture.'}
            </div>
          </div>

          {/* AI Calculated Severity & Department */}
          <div className="card-container" style={{
            borderLeft: `6px solid ${isCriticalOrHigh ? 'var(--status-reopened)' : 'var(--color-brand-primary)'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyStyle: 'space-between' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-brand-primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.05em' }}>
                <Sparkles size={14} /> JANSETU AI CALCULATIONS
              </div>
              <span className="badge" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', fontWeight: 800 }}>
                Score {aiAnalysis?.priority || 85}/100
              </span>
            </div>

            {/* Severity Panel */}
            <div style={{
              backgroundColor: isCriticalOrHigh ? 'var(--status-reopened-bg)' : 'var(--color-brand-subtle)',
              border: `1px solid ${isCriticalOrHigh ? 'rgba(220, 38, 38, 0.2)' : 'var(--color-brand-border)'}`,
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: isCriticalOrHigh ? 'var(--status-reopened)' : 'var(--color-brand-primary)', textTransform: 'uppercase' }}>
                Severity Rating:
              </span>
              <span style={{ fontSize: 'var(--font-sm)', fontWeight: 900, color: isCriticalOrHigh ? 'var(--status-reopened)' : 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={14} /> {aiAnalysis?.severity || 'HIGH'}
              </span>
            </div>

            {/* AI Diagnostics details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '6px' }}>
                <span>Assigned Dept:</span>
                <strong style={{ color: 'var(--color-brand-primary)' }}>{aiAnalysis?.department || 'Roads & Infrastructure'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '6px' }}>
                <span>Issue Category:</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{aiAnalysis?.category || 'Road Damage'}</strong>
              </div>
            </div>

            {/* OpenStreetMap Leaflet Map Picker */}
            <LeafletMapPicker
              initialLocation={location}
              onChange={(newLoc) => setLocation(newLoc)}
            />

            <div style={{
              marginTop: 'auto',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg-surface-hover)',
              fontSize: '11px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
              border: '1px solid var(--color-border-subtle)'
            }}>
              <strong>AI Reasoning:</strong> {aiAnalysis?.reasoning}
            </div>
          </div>
        </div>

        {/* Submission Error Banner if any */}
        {submissionError && (
          <div style={{ backgroundColor: 'var(--status-reopened-bg)', border: '1px solid rgba(220, 38, 38, 0.25)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--status-reopened)', fontWeight: 700, textAlign: 'center' }}>
            ⚠️ {submissionError}
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={Edit3} onClick={() => setEditModalOpen(true)} disabled={isSubmitting}>
            EDIT DETAILS & DEPARTMENT
          </Button>
          <Button
            variant="primary"
            size="lg"
            icon={CheckCircle}
            disabled={isSubmitting}
            onClick={handleReviewConfirmed}
          >
            {isSubmitting ? 'SUBMITTING REPORT TO DEPARTMENT...' : 'CONFIRM & SUBMIT REPORT ➔'}
          </Button>
        </div>

        {/* Edit Modal */}
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Modify AI Calculations">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              label="Issue Summary Title"
              value={aiAnalysis?.summary || ''}
              onChange={(e) => setAiAnalysis({ ...aiAnalysis, summary: e.target.value })}
            />

            <Textarea
              label="Detailed Description"
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              rows={4}
            />

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                Target Department
              </label>
              <select
                value={aiAnalysis?.department || 'Roads & Infrastructure'}
                onChange={(e) => setAiAnalysis({ ...aiAnalysis, department: e.target.value })}
                className="form-select"
              >
                <option value="Fire & Emergency Services">Fire & Emergency Services</option>
                <option value="Electricity & Power Board">Electricity & Power Board</option>
                <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                <option value="Solid Waste Management">Solid Waste Management</option>
                <option value="Jal Board / Water Works">Jal Board / Water Works</option>
                <option value="Drainage & Sewerage Board">Drainage & Sewerage Board</option>
                <option value="Public Safety & Municipal Traffic">Public Safety & Municipal Traffic</option>
                <option value="Municipal Services">Municipal Services</option>
              </select>
            </div>

            <Input
              label="Location Landmark / Area"
              value={location.area}
              onChange={(e) => setLocation({ ...location, area: e.target.value, address: `📍 ${e.target.value}` })}
            />

            <Button variant="primary" onClick={() => setEditModalOpen(false)} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
              SAVE & CONTINUE
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  // SCREEN 3: AI SCANNING (Google Lens scanning vector view)
  if (step === 3) {
    return (
      <div className="container animate-fade-in" style={{ maxWidth: '440px', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
        <div className="card-container" style={{ padding: 'var(--space-8)', textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
          
          {/* Scanning Line overlay decoration */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, transparent, var(--color-brand-primary), transparent)',
            animation: 'pulseGlow 2s infinite ease-in-out',
            boxShadow: '0 0 12px var(--color-brand-primary)'
          }} />

          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-brand-subtle)',
            color: 'var(--color-brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-6)',
            animation: 'pulseGlow 2s infinite ease-in-out'
          }}>
            <Cpu size={32} />
          </div>

          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)' }}>
            Lens diagnostics scanning...
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', textAlign: 'left', fontSize: 'var(--font-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--status-resolved)', fontWeight: 700 }}>
              <CheckCircle2 size={16} />
              <span>Analyzing visual features of uploaded photo</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: isAnalyzing ? 'var(--color-brand-primary)' : 'var(--status-resolved)', fontWeight: 700 }}>
              {isAnalyzing ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>Processing voice transcriptions</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: locationLoading ? 'var(--color-brand-primary)' : 'var(--status-resolved)', fontWeight: 700 }}>
              {locationLoading ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>Resolving GPS location coordinate mapping</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 2: MULTILINGUAL LISTENING STATE
  if (step === 2) {
    const liveText = (voiceText + (interimText ? ' ' + interimText : '')).trim();

    return (
      <div className="container animate-fade-in" style={{ maxWidth: '460px', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
        <div className="card-container" style={{
          padding: 'var(--space-8)',
          textAlign: 'center',
          border: '1.5px solid var(--color-brand-primary)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Active Language Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
            <span>🎙️ LISTENING IN:</span>
            <strong>{getLanguageName(currentLang)}</strong>
          </div>

          {/* Pulsing microphone icon */}
          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-brand-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-6)',
            boxShadow: '0 0 0 12px var(--color-brand-subtle)',
            animation: 'pulseGlow 1.5s infinite ease-in-out'
          }}>
            <Mic size={40} />
          </div>

          <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {isRecording ? 'Listening for your voice...' : 'Speech Captured'}
          </h2>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', margin: '4px 0 var(--space-6)' }}>
            Speak clearly about the civic problem (e.g. pothole size, landmark, water leak).
          </p>

          {/* Error Banner if any */}
          {recordingError && (
            <div style={{
              backgroundColor: 'var(--status-reopened-bg)',
              border: '1px solid rgba(220, 38, 38, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
              fontSize: 'var(--font-xs)',
              color: 'var(--status-reopened)',
              fontWeight: 700,
              textAlign: 'left'
            }}>
              ⚠️ {recordingError}
            </div>
          )}

          {/* Live Transcript Display Box */}
          <div style={{
            backgroundColor: 'var(--color-bg-surface-hover)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--font-sm)',
            color: liveText ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
            marginBottom: 'var(--space-6)',
            minHeight: '80px',
            maxHeight: '180px',
            overflowY: 'auto',
            border: '1px solid var(--color-border-default)',
            textAlign: 'left',
            lineHeight: 1.6
          }}>
            {liveText ? (
              <span>
                <strong style={{ color: 'var(--color-brand-primary)' }}>"{voiceText}"</strong>
                {interimText && <span style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}> {interimText}</span>}
              </span>
            ) : (
              <span style={{ fontStyle: 'italic' }}>
                (Speak now into your microphone... your words will appear here in real time)
              </span>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Button
              variant="primary"
              size="lg"
              icon={MicOff}
              onClick={handleStopRecording}
              style={{ width: '100%' }}
            >
              STOP & CONTINUE ➔
            </Button>

            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setVoiceText('');
                  setInterimText('');
                  handleStartRecording();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-brand-primary)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '6px 12px'
                }}
              >
                🔄 Restart Voice Recording
              </button>

              <button
                type="button"
                onClick={() => {
                  speechService.stopListening();
                  setIsRecording(false);
                  setUseTextInput(true);
                  setStep(1);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px 12px'
                }}
              >
                ⌨️ Switch to Typing
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 1: STEP 1 - PHOTO CAPTURE & DESCRIPTION
  return (
    <div className="container animate-slide-up" style={{ maxWidth: '640px', paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <span className="badge" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', border: '1px solid var(--color-brand-border)', marginBottom: 'var(--space-2)' }}>
          STEP 1 OF 3: REPORT
        </span>
        <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--color-text-primary)', marginTop: '4px' }}>
          Capture Civic Issue
        </h1>
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          Upload photos or describe the issue. Our AI will analyze category and auto-assign tasks.
        </p>
      </div>

      <div className="card-container" style={{ padding: 'var(--space-6)' }}>
        
        {/* Immersive Camera Viewport (instagram/lens style) */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            1. Photo Evidence
          </div>

          <div style={{
            position: 'relative',
            backgroundColor: 'var(--color-bg-surface-elevated)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border-default)',
            padding: 'var(--space-4)'
          }}>
            {/* Dark lens style viewport */}
            <FileUpload
              label="Capture Photo / Upload Evidence"
              onFilesSelected={(files) => setImages(files)}
            />
          </div>
        </div>

        {/* Unified Audio Recording Panel */}
        <div style={{
          backgroundColor: 'var(--color-bg-surface-hover)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          border: '1px solid var(--color-border-default)',
          textAlign: 'center',
          marginBottom: 'var(--space-6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              VOICE LANGUAGE:
            </span>
            <span className="badge" style={{ backgroundColor: 'var(--color-brand-primary)', color: '#FFFFFF', fontWeight: 800 }}>
              {getLanguageName(currentLang)}
            </span>
          </div>

          {/* Big round mic button */}
          <button
            type="button"
            onClick={handleStartRecording}
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-brand-primary)',
              border: '4px solid var(--color-brand-subtle)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-3)',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              transition: 'all var(--transition-fast)'
            }}
            className="btn-primary"
          >
            <Mic size={32} />
          </button>
          
          <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: 'var(--space-2)' }}>
            Tap to describe issue via voice
          </h3>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Speak naturally about the civic problem (e.g. pothole size, debris location)
          </p>
        </div>

        {/* Text fallback input */}
        {!useTextInput ? (
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <button
              type="button"
              onClick={() => setUseTextInput(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-brand-primary)',
                fontSize: 'var(--font-xs)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Type size={14} /> Prefer typing descriptions manually?
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'left', marginBottom: 'var(--space-6)' }} className="animate-fade-in">
            <Textarea
              label="Civic Problem Description"
              placeholder="Describe the issue in detail (e.g., street light broken for 3 days near sector park gate)..."
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              rows={4}
            />
          </div>
        )}

        {/* 4. Interactive OpenStreetMap Picker */}
        <LeafletMapPicker
          initialLocation={location}
          onChange={(newLoc) => setLocation(newLoc)}
        />
        <div style={{ height: 'var(--space-6)' }} />

        {/* Mandatory Photo Alert if missing */}
        {images.length === 0 && (
          <div style={{ backgroundColor: 'var(--status-reopened-bg)', border: '1px solid rgba(220, 38, 38, 0.25)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--status-reopened)', fontWeight: 700, textAlign: 'center' }}>
            ⚠️ PHOTO EVIDENCE IS MANDATORY: Please capture a photo using Live Camera or choose a photo file above.
          </div>
        )}

        {/* Continue Button */}
        <Button
          variant="primary"
          size="lg"
          icon={ArrowRight}
          iconPosition="right"
          disabled={images.length === 0}
          onClick={() => {
            if (images.length === 0) {
              alert('Photo Evidence is Mandatory! Please capture a snapshot or upload a photo.');
              return;
            }
            setStep(3);
            processAiAndLocation();
          }}
          style={{ width: '100%' }}
        >
          {images.length === 0 ? '📷 TAKE PHOTO TO CONTINUE ➔' : 'ANALYZE PHOTO & DESCRIPTION WITH AI ➔'}
        </Button>
      </div>
    </div>
  );
};
