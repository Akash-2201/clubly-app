import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator, Dimensions, FlatList, Alert, RefreshControl,
} from 'react-native';
import { supabase } from '../../lib/supabase';

async function registerForPushNotifications(userId: string) {
  // Push notifications handled via APK build
}

async function sendPushNotification(userId: string, title: string, body: string) {
  try {
    const { data } = await supabase.from('users').select('push_token').eq('id', userId).single();
    if (data?.push_token) {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.push_token,
          title,
          body,
          sound: 'default',
          priority: 'high',
        }),
      });
    }
  } catch (e) {
    console.log('Push send error:', e);
  }
}

const { width } = Dimensions.get('window');
// Clean college palette
const BG = '#0a0118';        // Deep navy-black
const CARD = '#130a2a';      // Rich dark card
const PURPLE = '#8b5cf6';    // Refined violet
const PURPLE2 = '#6d28d9';   // Deep violet
const ACCENT = '#c4b5fd';    // Soft lavender accent
const TEXT = '#f5f3ff';      // Clean white-purple
const MUTED = '#8b8bab';     // Muted grey-blue
const BORDER = '#1e1040';    // Subtle border
const SUCCESS = '#059669';   // Clean green
const DANGER = '#dc2626';    // Clean red
const DEPTS = ['Computer Science', 'Data Science', 'AIML', 'AIDS', 'EC', 'EEE', 'Civil', 'Mechanical'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const CATS = ['Tech', 'Arts', 'Sports', 'Science', 'Other'];

// ─── Splash ───────────────────────────────────────────────────────────────────
function SplashScreen({ onNext }: { onNext: () => void }) {
  return (
    <View style={splash.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a0533" />
      <View style={splash.circle1} /><View style={splash.circle2} />
      <View style={splash.content}>
        <View style={splash.logoBox}><Text style={splash.logoIcon}>✦</Text></View>
        <Text style={splash.title}>Clubly</Text>
        <Text style={splash.subtitle}>Your campus, connected.</Text>
        <Text style={splash.desc}>Discover clubs, join events, and connect with your university community.</Text>
      </View>
      <View style={splash.bottom}>
        <TouchableOpacity style={splash.btn} onPress={onNext}><Text style={splash.btnText}>Get Started →</Text></TouchableOpacity>
        <Text style={splash.college}>Sapthagiri NPS University</Text>
      </View>
    </View>
  );
}


// ─── Forgot Password ──────────────────────────────────────────────────────────
function ForgotPasswordScreen({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const sendOtp = async () => {
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.signInWithOtp({ 
      email,
      options: { shouldCreateUser: false }
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setStep('otp');
  };

  const resetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) { setError('Please fill all fields'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');

    const { error: verifyErr } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    if (verifyErr) { setLoading(false); setError('Invalid OTP. Please try again.'); return; }

    const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (updateErr) { setError(updateErr.message); return; }
    setSuccess(true);
    setTimeout(() => onBack(), 2000);
  };

  return (
    <SafeAreaView style={auth.safe}>
      <ScrollView contentContainerStyle={auth.scroll}>
        <TouchableOpacity onPress={onBack} style={auth.backBtn}>
          <Text style={auth.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={auth.header}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}></Text>
          <Text style={auth.brand}>Reset Password</Text>
          <Text style={auth.tagline}>{step === 'email' ? 'Enter your email to get OTP' : 'Enter OTP and new password'}</Text>
        </View>
        <View style={auth.card}>
          {success ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}></Text>
              <Text style={{ color: TEXT, fontSize: 18, fontWeight: '800', textAlign: 'center' }}>Password Reset!</Text>
              <Text style={{ color: MUTED, fontSize: 14, marginTop: 8, textAlign: 'center' }}>Your password has been updated successfully.</Text>
            </View>
          ) : step === 'email' ? (
            <>
              <Text style={auth.cardTitle}>Forgot Password?</Text>
              <Text style={auth.helpText}>Enter your registered email. We will send a 6-digit OTP to verify your identity.</Text>
              {error ? <View style={auth.errorBox}><Text style={auth.errorText}>{error}</Text></View> : null}
              <Text style={auth.label}>Email</Text>
              <TextInput style={auth.input} placeholder="Enter your email" placeholderTextColor="#555" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <TouchableOpacity style={auth.primaryBtn} onPress={sendOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={auth.primaryBtnText}>Send OTP →</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={auth.cardTitle}>Verify & Reset</Text>
              <Text style={auth.helpText}>Enter the 6-digit OTP sent to {email} and your new password.</Text>
              {error ? <View style={auth.errorBox}><Text style={auth.errorText}>{error}</Text></View> : null}
              <Text style={auth.label}>OTP</Text>
              <TextInput style={[auth.input, { textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: '700' }]} placeholder="000000" placeholderTextColor="#555" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />
              <Text style={auth.label}>New Password</Text>
              <TextInput style={auth.input} placeholder="Min 6 characters" placeholderTextColor="#555" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
              <Text style={auth.label}>Confirm Password</Text>
              <TextInput style={auth.input} placeholder="Repeat new password" placeholderTextColor="#555" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
              <TouchableOpacity style={auth.primaryBtn} onPress={resetPassword} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={auth.primaryBtnText}>Reset Password →</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={auth.forgotBtn} onPress={() => { setStep('email'); setOtp(''); setError(''); }}>
                <Text style={auth.forgotText}>Resend OTP</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onGoSignup, onAdminLogin, onForgotPassword }: {
  onLogin: (isAdmin: boolean, profileComplete: boolean, isClubHead: boolean) => void;
  onGoSignup: () => void; onAdminLogin: () => void; onForgotPassword: () => void;
}) {
  const [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false), [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill all fields'); return; }
    setLoading(true); setError('');
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setLoading(false); setError(err.message); return; }
    const { data: userData } = await supabase.from('users').select('role, profile_completed, club_id').eq('id', data.user.id).single();
    setLoading(false);
    registerForPushNotifications(data.user.id);
    const isAdmin = userData?.role === 'admin';
    const isClubHead = userData?.role === 'club_head';
    if (isAdmin) {
      setError('Please use the Admin Login button below to access the admin panel.');
      await supabase.auth.signOut();
      return;
    }
    onLogin(isAdmin, userData?.profile_completed === true, isClubHead);
  };

  return (
    <SafeAreaView style={auth.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={auth.scroll} keyboardShouldPersistTaps="handled">
          <View style={auth.header}>
            <View style={auth.logoSmall}><Text style={auth.logoIcon}>✦</Text></View>
            <Text style={auth.brand}>Clubly</Text>
            <Text style={auth.tagline}>Welcome back!</Text>

          </View>
          <View style={auth.card}>
            <Text style={auth.cardTitle}>Sign In</Text>
            {error ? <View style={auth.errorBox}><Text style={auth.errorText}>{error}</Text></View> : null}
            <Text style={auth.label}>Email</Text>
            <TextInput style={auth.input} placeholder="Enter your email" placeholderTextColor="#555" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Text style={auth.label}>Password</Text>
            <TextInput style={auth.input} placeholder="••••••••" placeholderTextColor="#555" value={password} onChangeText={setPassword} secureTextEntry />
            <TouchableOpacity style={auth.forgotBtn} onPress={onForgotPassword}><Text style={auth.forgotText}>Forgot password?</Text></TouchableOpacity>
            <TouchableOpacity style={auth.primaryBtn} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={auth.primaryBtnText}>Sign In →</Text>}
            </TouchableOpacity>
            <View style={auth.divider}><View style={auth.dividerLine} /><Text style={auth.dividerText}>or</Text><View style={auth.dividerLine} /></View>
            <TouchableOpacity style={auth.secondaryBtn} onPress={onGoSignup}><Text style={auth.secondaryBtnText}>Create New Account</Text></TouchableOpacity>
            <TouchableOpacity style={auth.adminBtn} onPress={onAdminLogin}><Text style={auth.adminBtnText}>Admin Login</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Signup ───────────────────────────────────────────────────────────────────
function SignupScreen({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [name, setName] = useState(''), [email, setEmail] = useState('');
  const [password, setPassword] = useState(''), [rollNo, setRollNo] = useState('');
  const [loading, setLoading] = useState(false), [error, setError] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password || !rollNo) { setError('Please fill all fields'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!/^[0-9]{2}[A-Z]+[0-9]{3}$/.test(rollNo)) { setError('Invalid roll number. Format: 24SUUBEDAS013'); return; }
    setLoading(true); setError('');
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, roll_number: rollNo } } });
    if (signUpErr) { setLoading(false); setError(signUpErr.message); return; }
    
    // Manually insert user record in case trigger fails
    if (signUpData.user) {
      // Wait for auth to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      const { error: insertErr } = await supabase.from('users').upsert({
        id: signUpData.user.id,
        email,
        name,
        role: 'student',
        profile_completed: false,
      }, { onConflict: 'id' });
      if (insertErr) console.log('User insert error:', insertErr.message);
      else console.log('User inserted successfully!');
      if (insertErr) { setLoading(false); setError('Signup failed: ' + insertErr.message); return; }
    }
    
    setLoading(false); onDone();
  };

  return (
    <SafeAreaView style={auth.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={auth.scroll} keyboardShouldPersistTaps="handled">
          <View style={auth.header}>
            <TouchableOpacity onPress={onBack} style={auth.backBtn}><Text style={auth.backText}>← Back</Text></TouchableOpacity>
            <Text style={auth.brand}>Join Clubly</Text>
            <Text style={auth.tagline}>Create your account</Text>
          </View>
          <View style={auth.card}>
            <Text style={auth.cardTitle}>Your Details</Text>
            {error ? <View style={auth.errorBox}><Text style={auth.errorText}>{error}</Text></View> : null}
            <Text style={auth.label}>Full Name</Text>
            <TextInput style={auth.input} placeholder="Your full name" placeholderTextColor="#555" value={name} onChangeText={setName} />
            <Text style={auth.label}>Email</Text>
            <TextInput style={auth.input} placeholder="Enter your email" placeholderTextColor="#555" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Text style={auth.label}>Password</Text>
            <TextInput style={auth.input} placeholder="Min 6 characters" placeholderTextColor="#555" value={password} onChangeText={setPassword} secureTextEntry />
            <Text style={auth.label}>Roll Number</Text>
            <TextInput style={auth.input} placeholder="e.g. 24SUUBEDAS013" placeholderTextColor="#555" value={rollNo} onChangeText={setRollNo} autoCapitalize="characters" />
            <TouchableOpacity style={auth.primaryBtn} onPress={handleSignup} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={auth.primaryBtnText}>Create Account →</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Profile Setup ────────────────────────────────────────────────────────────
function ProfileSetupScreen({ onDone }: { onDone: () => void }) {
  const [bio, setBio] = useState(''), [phone, setPhone] = useState('');
  const [year, setYear] = useState(''), [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false), [error, setError] = useState('');

  const handleSave = async () => {
    if (!bio || !phone || !year || !department) { setError('Please fill all fields'); return; }
    if (!/^[0-9]{10}$/.test(phone)) { setError('Enter a valid 10-digit phone number'); return; }
    setLoading(true); setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error: updateErr } = await supabase.from('users').update({ bio, phone, year, department, profile_completed: true }).eq('id', user.id);
      if (updateErr) {
        setLoading(false);
        if (updateErr.message.includes('users_phone_unique')) {
          setError('This phone number is already used by another student');
        } else {
          setError(updateErr.message);
        }
        return;
      }
    }
    setLoading(false); onDone();
  };

  return (
    <SafeAreaView style={auth.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={auth.scroll} keyboardShouldPersistTaps="handled">
          <View style={auth.header}>
            <Text style={prf.emoji}></Text>
            <Text style={auth.brand}>Complete Profile</Text>
            <Text style={auth.tagline}>Tell us more about yourself</Text>
          </View>
          <View style={auth.card}>
            <Text style={auth.cardTitle}>Your Profile</Text>
            <Text style={prf.note}>Required before you can join clubs.</Text>
            {error ? <View style={auth.errorBox}><Text style={auth.errorText}>{error}</Text></View> : null}
            <Text style={auth.label}>Bio</Text>
            <TextInput style={[auth.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Tell us about yourself..." placeholderTextColor="#555" value={bio} onChangeText={setBio} multiline />
            <Text style={auth.label}>Phone Number</Text>
            <TextInput style={auth.input} placeholder="10-digit number" placeholderTextColor="#555" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} />
            <Text style={auth.label}>Department</Text>
            <View style={prf.grid}>
              {DEPTS.map(d => (
                <TouchableOpacity key={d} style={[prf.chip, department === d && prf.chipActive]} onPress={() => setDepartment(d)}>
                  <Text style={[prf.chipText, department === d && prf.chipTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={auth.label}>Year of Study</Text>
            <View style={prf.grid}>
              {YEARS.map(y => (
                <TouchableOpacity key={y} style={[prf.chip, year === y && prf.chipActive]} onPress={() => setYear(y)}>
                  <Text style={[prf.chipText, year === y && prf.chipTextActive]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={auth.primaryBtn} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={auth.primaryBtnText}>Save Profile →</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Admin Login ──────────────────────────────────────────────────────────────
function AdminLoginScreen({ onBack, onLogin }: { onBack: () => void; onLogin: () => void }) {
  const [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false), [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill all fields'); return; }
    setLoading(true); setError('');
    const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) { setLoading(false); setError(signInErr.message); return; }
    const { data: userData } = await supabase.from('users').select('role').eq('id', data.user.id).single();
    setLoading(false);
    if (userData?.role !== 'admin') { await supabase.auth.signOut(); setError('You are not authorized as admin'); return; }
    onLogin();
  };

  return (
    <SafeAreaView style={auth.safe}>
      <ScrollView contentContainerStyle={auth.scroll}>
        <View style={auth.header}>
          <TouchableOpacity onPress={onBack} style={auth.backBtn}><Text style={auth.backText}>← Back</Text></TouchableOpacity>
          <Text style={[auth.brand, { color: '#f59e0b' }]}>Admin</Text>
          <Text style={auth.tagline}>Restricted Access</Text>
        </View>
        <View style={auth.card}>
          <Text style={auth.cardTitle}>Admin Login</Text>
          <Text style={auth.helpText}>Restricted to authorized administrators only.</Text>
          {error ? <View style={auth.errorBox}><Text style={auth.errorText}>{error}</Text></View> : null}
          <Text style={auth.label}>Email</Text>
          <TextInput style={auth.input} placeholder="Admin email" placeholderTextColor="#555" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Text style={auth.label}>Password</Text>
          <TextInput style={auth.input} placeholder="••••••••" placeholderTextColor="#555" value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity style={[auth.primaryBtn, { backgroundColor: '#b45309' }]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={auth.primaryBtnText}>Access Admin Panel →</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [clubs, setClubs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [clubRequests, setClubRequests] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [showClubForm, setShowClubForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'clubs' | 'applications' | 'requests' | 'events'>('clubs');
  const [clubName, setClubName] = useState(''), [clubDesc, setClubDesc] = useState(''), [clubCategory, setClubCategory] = useState('');
  const [eventTitle, setEventTitle] = useState(''), [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState(''), [eventVenue, setEventVenue] = useState(''), [eventClubId, setEventClubId] = useState('');
  const [loading, setLoading] = useState(false), [fetching, setFetching] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventRegistrants, setEventRegistrants] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [clubMembers, setClubMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const fetchData = async () => {
    const { data: clubData } = await supabase.from('clubs').select('*').order('created_at', { ascending: false });
    setClubs(clubData || []);
    const { data: appData } = await supabase.from('applications').select('*').eq('status', 'pending');
    setApplications(appData || []);
    const { data: reqData } = await supabase.from('club_requests').select('*').eq('status', 'pending');
    if (reqData && reqData.length > 0) {
      const userIds = reqData.map((r: any) => r.user_id);
      const { data: usersData } = await supabase.from('users').select('id, name, department').in('id', userIds);
      const reqsWithUsers = reqData.map((r: any) => ({
        ...r,
        users: usersData?.find((u: any) => u.id === r.user_id) || null
      }));
      setClubRequests(reqsWithUsers);
    } else {
      setClubRequests([]);
    }
    const { data: evtData } = await supabase.from('events').select('*, clubs(name)').order('date', { ascending: true });
    setEvents(evtData || []);
    setFetching(false);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (selectedEvent) {
      supabase.from('event_registrations')
        .select('*, users(name, email, department, year, roll_number)')
        .eq('event_id', selectedEvent.id)
        .then(({ data }) => setEventRegistrants(data || []));
    }
  }, [selectedEvent]);

  const fetchMembers = async (clubId: string) => {
    const { data } = await supabase
      .from('club_members')
      .select('*, users(id, name, email, department, year, bio, phone, role)')
      .eq('club_id', clubId);
    setClubMembers(data || []);
  };

  const createClub = async () => {
    if (!clubName || !clubDesc || !clubCategory) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('clubs').insert({ name: clubName, description: clubDesc, category: clubCategory, created_by: user?.id, member_count: 0 });
    setClubName(''); setClubDesc(''); setClubCategory(''); setShowClubForm(false); setLoading(false); fetchData();
  };

  const deleteClub = async (id: string) => { await supabase.from('clubs').delete().eq('id', id); fetchData(); };

  const handleApplication = async (id: string, status: 'accepted' | 'rejected', app: any) => {
    await supabase.from('applications').update({ status }).eq('id', id);
    if (status === 'accepted') {
      await supabase.from('club_members').insert({ club_id: app.club_id, user_id: app.user_id });
      await supabase.from('clubs').update({ member_count: (app.member_count || 0) + 1 }).eq('id', app.club_id);
      const club = clubs.find((c: any) => c.id === app.club_id);
      await supabase.from('notifications').insert({
        user_id: app.user_id,
        title: 'Application Accepted',
        message: `You have been accepted into ${club?.name || 'the club'}!`,
        type: 'accepted',
      });
      sendPushNotification(app.user_id, 'Application Accepted! 🎉', `You have been accepted into ${club?.name || 'the club'}!`);
    } else {
      const club = clubs.find((c: any) => c.id === app.club_id);
      await supabase.from('notifications').insert({
        user_id: app.user_id,
        title: 'Application Rejected',
        message: `Your application to ${club?.name || 'the club'} was not accepted this time.`,
        type: 'rejected',
      });
      sendPushNotification(app.user_id, 'Application Update', `Your application to ${club?.name || 'the club'} was not accepted this time.`);
    }
    fetchData();
  };

  const handleClubRequest = async (req: any, status: 'accepted' | 'rejected') => {
    await supabase.from('club_requests').update({ status }).eq('id', req.id);
    if (status === 'accepted') {
      const { data: newClub } = await supabase.from('clubs').insert({ name: req.club_name, description: req.description, category: req.category, created_by: req.user_id, member_count: 1 }).select().single();
      if (newClub) {
        await supabase.from('users').update({ role: 'club_head', club_id: newClub.id }).eq('id', req.user_id);
        await supabase.from('club_members').insert({ club_id: newClub.id, user_id: req.user_id });
        await supabase.from('notifications').insert({
          user_id: req.user_id,
          title: 'Club Request Approved',
          message: `Your club "${req.club_name}" has been approved! You are now the Club Head.`,
          type: 'accepted',
        });
        sendPushNotification(req.user_id, 'Club Request Approved! 🎉', `Your club "${req.club_name}" has been approved!`);
      }
    } else {
      await supabase.from('notifications').insert({
        user_id: req.user_id,
        title: 'Club Request Rejected',
        message: `Your request to create "${req.club_name}" was not approved at this time.`,
        type: 'rejected',
      });
    }
    fetchData();
  };

  const createEvent = async () => {
    if (!eventTitle || !eventDate || !eventVenue || !eventClubId) return;
    setLoading(true);
    await supabase.from('events').insert({ title: eventTitle, description: eventDesc, date: eventDate, venue: eventVenue, club_id: eventClubId });
    setEventTitle(''); setEventDesc(''); setEventDate(''); setEventVenue(''); setEventClubId('');
    setShowEventForm(false); setLoading(false); fetchData();
  };

  const handleLogout = async () => { await supabase.auth.signOut(); onLogout(); };

  // Show event registrants
  if (selectedEvent) {
    return (
      <SafeAreaView style={auth.safe}>
        <ScrollView contentContainerStyle={auth.scroll}>
          <TouchableOpacity onPress={() => { setSelectedEvent(null); setEventRegistrants([]); }} style={auth.backBtn}>
            <Text style={auth.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <Text style={{ color: TEXT, fontSize: 22, fontWeight: '900' }}>{selectedEvent.title}</Text>
            <Text style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>{selectedEvent.date?.split('T')[0]} • {selectedEvent.venue}</Text>
          </View>
          <View style={auth.card}>
            <Text style={auth.cardTitle}>Registrations ({eventRegistrants.length})</Text>
            {eventRegistrants.length === 0
              ? <Text style={{ color: MUTED, fontSize: 14, textAlign: 'center', paddingVertical: 20 }}>No registrations yet</Text>
              : eventRegistrants.map((r: any, i: number) => (
                <View key={r.id} style={{ paddingVertical: 12, borderBottomWidth: i < eventRegistrants.length - 1 ? 1 : 0, borderBottomColor: BORDER }}>
                  <Text style={{ color: TEXT, fontSize: 14, fontWeight: '700' }}>{r.users?.name || 'Unknown'}</Text>
                  <Text style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>{r.users?.email} • {r.users?.department}</Text>
                  <Text style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>{r.users?.roll_number} • {r.users?.year}</Text>
                </View>
              ))
            }
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (selectedMember) {
    const u = selectedMember.users;
    return (
      <SafeAreaView style={auth.safe}>
        <ScrollView contentContainerStyle={auth.scroll}>
          <TouchableOpacity onPress={() => setSelectedMember(null)} style={auth.backBtn}>
            <Text style={auth.backText}>← Back to Members</Text>
          </TouchableOpacity>
          <View style={prf.header}>
            <View style={prf.avatar}><Text style={prf.avatarText}>{u?.name ? u.name[0].toUpperCase() : '?'}</Text></View>
            <Text style={prf.name}>{u?.name || 'Unknown'}</Text>
            <Text style={prf.email}>{u?.email || ''}</Text>
            <View style={prf.roleBadge}><Text style={prf.roleText}>{u?.role === 'club_head' ? 'Club Head' : 'Student'}</Text></View>
          </View>
          <View style={auth.card}>
            <Text style={auth.cardTitle}>Details</Text>
            {[['Department', u?.department], ['Year', u?.year], ['Phone', u?.phone], ['Bio', u?.bio]].map(([label, value]) => (
              <View key={label as string}>
                <View style={prf.row}><Text style={prf.rowLabel}>{label}</Text><Text style={prf.rowValue}>{value || 'Not set'}</Text></View>
                <View style={prf.rowDivider} />
              </View>
            ))}
          </View>
          <Text style={[adm.cardSub, { textAlign: 'center', marginTop: 16 }]}>Joined: {new Date(selectedMember.joined_at).toLocaleDateString()}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show club members
  if (selectedClub) {
    return (
      <SafeAreaView style={auth.safe}>
        <ScrollView contentContainerStyle={auth.scroll}>
          <TouchableOpacity onPress={() => setSelectedClub(null)} style={auth.backBtn}>
            <Text style={auth.backText}>← Back to Clubs</Text>
          </TouchableOpacity>
          <View style={clu.header}>
            <Text style={clu.emoji}></Text>
            <Text style={clu.name}>{selectedClub.name}</Text>
            <View style={clu.tag}><Text style={clu.tagText}>{selectedClub.category}</Text></View>
            <Text style={clu.members}>{clubMembers.length} members</Text>
          </View>
          <Text style={[adm.sectionTitle, { paddingHorizontal: 0, marginBottom: 12 }]}>Members</Text>
          {clubMembers.length === 0
            ? <View style={adm.empty}><Text style={adm.emptyText}>No members yet</Text></View>
            : clubMembers.map((m) => (
              <TouchableOpacity key={m.id} style={adm.card} onPress={() => setSelectedMember(m)}>
                <View style={mem.avatar}><Text style={mem.avatarText}>{m.users?.name ? m.users.name[0].toUpperCase() : '?'}</Text></View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={adm.cardTitle}>{m.users?.name || 'Unknown'}</Text>
                  <Text style={adm.cardSub}>{m.users?.department || 'No dept'} • {m.users?.year || ''}</Text>
                  <Text style={adm.cardSub}>{m.users?.email}</Text>
                </View>
                <Text style={{ color: PURPLE, fontSize: 18 }}>›</Text>
              </TouchableOpacity>
            ))
          }
        </ScrollView>
      </SafeAreaView>
    );
  }

  const tabs = [
    { key: 'clubs', label: 'Clubs' },
    { key: 'applications', label: `Join Requests${applications.length > 0 ? ` (${applications.length})` : ''}` },
    { key: 'requests', label: `New Clubs${clubRequests.length > 0 ? ` (${clubRequests.length})` : ''}` },
    { key: 'events', label: 'Events' },
  ];

  return (
    <SafeAreaView style={adm.safe}>
      <ScrollView 
        style={adm.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={fetching} onRefresh={fetchData} tintColor={PURPLE} colors={[PURPLE]} />}
      >
        <View style={adm.header}>
          <View><Text style={adm.title}>Admin Panel</Text><Text style={adm.subtitle}>Manage Clubly</Text></View>
          <TouchableOpacity style={adm.logoutBtn} onPress={handleLogout}><Text style={adm.logoutText}>Logout</Text></TouchableOpacity>
        </View>

        <View style={adm.statsRow}>
          {[[String(clubs.length), 'Clubs'], [String(applications.length), 'Pending'], [String(clubRequests.length), 'Requests'], [String(events.length), 'Events']].map(([n, l]) => (
            <View key={l} style={adm.statCard}><Text style={adm.statNum}>{n}</Text><Text style={adm.statLabel}>{l}</Text></View>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={adm.tabScroll}>
          {tabs.map(t => (
            <TouchableOpacity key={t.key} style={[adm.tabBtn, activeTab === t.key && adm.tabBtnActive]} onPress={() => setActiveTab(t.key as any)}>
              <Text style={[adm.tabText, activeTab === t.key && adm.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* CLUBS TAB */}
        {activeTab === 'clubs' && <>
          <View style={adm.sectionHeader}>
            <Text style={adm.sectionTitle}>All Clubs</Text>
            <TouchableOpacity style={adm.addBtn} onPress={() => setShowClubForm(!showClubForm)}>
              <Text style={adm.addBtnText}>{showClubForm ? '✕ Cancel' : 'New Club'}</Text>
            </TouchableOpacity>
          </View>
          {showClubForm && (
            <View style={adm.form}>
              <Text style={auth.label}>Club Name</Text>
              <TextInput style={auth.input} placeholder="e.g. Coding Club" placeholderTextColor="#555" value={clubName} onChangeText={setClubName} />
              <Text style={auth.label}>Description</Text>
              <TextInput style={[auth.input, { height: 80, textAlignVertical: 'top' }]} placeholder="What is this club about?" placeholderTextColor="#555" value={clubDesc} onChangeText={setClubDesc} multiline />
              <Text style={auth.label}>Category</Text>
              <View style={adm.chipRow}>
                {CATS.map(cat => (
                  <TouchableOpacity key={cat} style={[adm.chip, clubCategory === cat && adm.chipActive]} onPress={() => setClubCategory(cat)}>
                    <Text style={[adm.chipText, clubCategory === cat && adm.chipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={auth.primaryBtn} onPress={createClub} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={auth.primaryBtnText}>Create Club ✓</Text>}
              </TouchableOpacity>
            </View>
          )}
          {fetching ? <ActivityIndicator color={PURPLE} style={{ marginTop: 40 }} /> : clubs.length === 0
            ? <View style={adm.empty}><Text style={adm.emptyText}>No clubs yet. Create one above.</Text></View>
            : clubs.map(c => (
              <TouchableOpacity key={c.id} style={adm.card} onPress={() => { setSelectedClub(c); fetchMembers(c.id); }}>
                <View style={{ flex: 1 }}>
                  <Text style={adm.cardTitle}>{c.name}</Text>
                  <Text style={adm.cardSub}>{c.description}</Text>
                  <View style={adm.badge}><Text style={adm.badgeText}>{c.category}</Text></View>
                  <Text style={[adm.cardSub, { marginTop: 6 }]}>👥 {c.member_count} members • Tap to view</Text>
                </View>
                <TouchableOpacity style={adm.deleteBtn} onPress={() => deleteClub(c.id)}>
                  <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#2d0a0a', borderWidth: 1, borderColor: '#7f1d1d', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#f87171', fontSize: 14, fontWeight: '800' }}>✕</Text>
                  </View>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          }
        </>}

        {/* APPLICATIONS TAB */}
        {activeTab === 'applications' && <>
          <Text style={[adm.sectionTitle, { paddingHorizontal: 24, marginTop: 16, marginBottom: 12 }]}>Member Applications</Text>
          {applications.length === 0
            ? <View style={adm.empty}><Text style={adm.emptyText}>No pending applications</Text></View>
            : applications.map(app => (
              <View key={app.id} style={adm.card}>
                <View style={{ flex: 1 }}>
                  <Text style={adm.cardTitle}>Application</Text>
                  <Text style={adm.cardSub}>{new Date(app.created_at).toLocaleDateString()}</Text>
                  {app.message ? <Text style={adm.cardMsg}>"{app.message}"</Text> : null}
                </View>
                <View style={{ gap: 8 }}>
                  <TouchableOpacity style={adm.acceptBtn} onPress={() => handleApplication(app.id, 'accepted', app)}><Text style={adm.actionText}>✓</Text></TouchableOpacity>
                  <TouchableOpacity style={adm.rejectBtn} onPress={() => handleApplication(app.id, 'rejected', app)}><Text style={adm.actionText}>✕</Text></TouchableOpacity>
                </View>
              </View>
            ))
          }
        </>}

        {/* CLUB REQUESTS TAB */}
        {activeTab === 'requests' && <>
          <Text style={[adm.sectionTitle, { paddingHorizontal: 24, marginTop: 16, marginBottom: 12 }]}>Club Creation Requests</Text>
          {clubRequests.length === 0
            ? <View style={adm.empty}><Text style={adm.emptyText}>No pending club requests</Text></View>
            : clubRequests.map(req => (
              <View key={req.id} style={adm.card}>
                <View style={{ flex: 1 }}>
                  <Text style={adm.cardTitle}>{req.club_name}</Text>
                  <Text style={adm.cardSub}>By: {req.users?.name} • {req.users?.department}</Text>
                  <Text style={adm.cardMsg}>{req.description}</Text>
                  <View style={adm.badge}><Text style={adm.badgeText}>{req.category}</Text></View>
                </View>
                <View style={{ gap: 8 }}>
                  <TouchableOpacity style={adm.acceptBtn} onPress={() => handleClubRequest(req, 'accepted')}><Text style={adm.actionText}>✓</Text></TouchableOpacity>
                  <TouchableOpacity style={adm.rejectBtn} onPress={() => handleClubRequest(req, 'rejected')}><Text style={adm.actionText}>✕</Text></TouchableOpacity>
                </View>
              </View>
            ))
          }
        </>}

        {/* EVENTS TAB */}
        {activeTab === 'announcements' && <>
          <View style={adm.sectionHeader}>
            <Text style={adm.sectionTitle}>Announcements</Text>
            <TouchableOpacity style={adm.addBtn} onPress={() => setShowAnnForm(!showAnnForm)}>
              <Text style={adm.addBtnText}>{showAnnForm ? '✕ Cancel' : 'New Post'}</Text>
            </TouchableOpacity>
          </View>
          {showAnnForm && (
            <View style={adm.form}>
              <Text style={auth.label}>Title</Text>
              <TextInput style={auth.input} placeholder="Announcement title" placeholderTextColor="#555" value={annTitle} onChangeText={setAnnTitle} />
              <Text style={auth.label}>Content</Text>
              <TextInput style={[auth.input, { height: 100, textAlignVertical: 'top' }]} placeholder="Write your announcement..." placeholderTextColor="#555" value={annContent} onChangeText={setAnnContent} multiline />
              <TouchableOpacity style={auth.primaryBtn} onPress={postAnnouncement} disabled={annLoading}>
                {annLoading ? <ActivityIndicator color="#fff" /> : <Text style={auth.primaryBtnText}>Post Announcement 📌</Text>}
              </TouchableOpacity>
            </View>
          )}
          {announcements.length === 0
            ? <View style={adm.empty}><Text style={adm.emptyText}>No announcements posted yet</Text></View>
            : announcements.map(a => (
              <View key={a.id} style={adm.card}>
                <View style={{ flex: 1 }}>
                  <Text style={adm.cardTitle}>{a.title}</Text>
                  <Text style={adm.cardSub}>{a.content}</Text>
                  <Text style={[adm.cardSub, { marginTop: 6 }]}>{new Date(a.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
            ))
          }
        </>}

        {activeTab === 'events' && <>
          <View style={adm.sectionHeader}>
            <Text style={adm.sectionTitle}>Events</Text>
            <TouchableOpacity style={adm.addBtn} onPress={() => setShowEventForm(!showEventForm)}>
              <Text style={adm.addBtnText}>{showEventForm ? '✕ Cancel' : 'New Event'}</Text>
            </TouchableOpacity>
          </View>
          {showEventForm && (
            <View style={adm.form}>
              <Text style={auth.label}>Event Title</Text>
              <TextInput style={auth.input} placeholder="e.g. Hackathon 2025" placeholderTextColor="#555" value={eventTitle} onChangeText={setEventTitle} />
              <Text style={auth.label}>Description</Text>
              <TextInput style={[auth.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Event details..." placeholderTextColor="#555" value={eventDesc} onChangeText={setEventDesc} multiline />
              <Text style={auth.label}>Date (YYYY-MM-DD)</Text>
              <TextInput style={auth.input} placeholder="2025-03-15" placeholderTextColor="#555" value={eventDate} onChangeText={setEventDate} />
              <Text style={auth.label}>Venue</Text>
              <TextInput style={auth.input} placeholder="e.g. Main Auditorium" placeholderTextColor="#555" value={eventVenue} onChangeText={setEventVenue} />
              <Text style={auth.label}>Club</Text>
              <View style={adm.chipRow}>
                {clubs.map(c => (
                  <TouchableOpacity key={c.id} style={[adm.chip, eventClubId === c.id && adm.chipActive]} onPress={() => setEventClubId(c.id)}>
                    <Text style={[adm.chipText, eventClubId === c.id && adm.chipTextActive]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={auth.primaryBtn} onPress={createEvent} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={auth.primaryBtnText}>Create Event ✓</Text>}
              </TouchableOpacity>
            </View>
          )}
          {events.length === 0
            ? <View style={adm.empty}><Text style={adm.emptyText}>No events yet. Create one above.</Text></View>
            : events.map(e => (
              <TouchableOpacity key={e.id} style={adm.card} onPress={() => setSelectedEvent(e)}>
                <View style={{ flex: 1 }}>
                  <Text style={adm.cardTitle}>{e.title}</Text>
                  <Text style={adm.cardSub}>{e.clubs?.name} • {e.date?.split('T')[0]}</Text>
                  <Text style={adm.cardSub}>Venue: {e.venue}</Text>
                  <Text style={[adm.cardSub, { color: ACCENT, marginTop: 4 }]}>Tap to view registrations</Text>
                </View>
              </TouchableOpacity>
            ))
          }
        </>}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Profile Screen ───────────────────────────────────────────────────────────
function ProfileScreen({ onBack, onLogout }: { onBack: () => void; onLogout: () => void }) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [year, setYear] = useState('');
  const [department, setDepartment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    setEditing(false);
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
        setUserData(data);
        setBio(data?.bio || '');
        setPhone(data?.phone || '');
        setYear(data?.year || '');
        setDepartment(data?.department || '');
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!phone || !year || !department) { setError('Please fill all fields'); return; }
    if (!/^[0-9]{10}$/.test(phone)) { setError('Enter a valid 10-digit phone number'); return; }
    setSaving(true); setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error: updateErr } = await supabase.from('users').update({ bio, phone, year, department }).eq('id', user.id);
      if (updateErr) {
        setSaving(false);
        if (updateErr.message.includes('users_phone_unique')) {
          setError('This phone number is already registered by another student');
        } else {
          setError(updateErr.message);
        }
        return;
      }
      setUserData((prev: any) => ({ ...prev, bio, phone, year, department }));
    }
    setSaving(false);
    setSuccess(true);
    setEditing(false);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); onLogout(); };

  if (loading) return <SafeAreaView style={auth.safe}><ActivityIndicator color={PURPLE} style={{ marginTop: 100 }} /></SafeAreaView>;

  return (
    <SafeAreaView style={auth.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={auth.scroll} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, width: '100%' }}>
            <TouchableOpacity onPress={onBack}><Text style={auth.backText}>← Back</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { setEditing(!editing); setError(''); }} style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: editing ? '#2d1152' : PURPLE, borderRadius: 10 }}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{editing ? 'Cancel' : 'Edit Profile'}</Text>
            </TouchableOpacity>
          </View>

          <View style={prf.header}>
            <View style={prf.avatar}><Text style={prf.avatarText}>{userData?.name ? userData.name[0].toUpperCase() : '?'}</Text></View>
            <Text style={prf.name}>{userData?.name || 'Unknown'}</Text>
            <Text style={prf.email}>{userData?.email || ''}</Text>
            <View style={prf.roleBadge}>
              <Text style={prf.roleText}>{userData?.role === 'admin' ? 'Admin' : userData?.role === 'club_head' ? 'Club Head' : 'Student'}</Text>
            </View>
          </View>

          {success && (
            <View style={{ backgroundColor: '#052e16', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#166534' }}>
              <Text style={{ color: '#86efac', fontSize: 14, textAlign: 'center', fontWeight: '600' }}>Profile updated successfully!</Text>
            </View>
          )}

          <View style={auth.card}>
            <Text style={auth.cardTitle}>{editing ? 'Edit Details' : 'Details'}</Text>
            {error ? <View style={auth.errorBox}><Text style={auth.errorText}>{error}</Text></View> : null}

            {editing ? <>
              <Text style={auth.label}>Bio</Text>
              <TextInput style={[auth.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Tell us about yourself..." placeholderTextColor="#555" value={bio} onChangeText={setBio} multiline />
              <Text style={auth.label}>Phone Number</Text>
              <TextInput style={auth.input} placeholder="10-digit number" placeholderTextColor="#555" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} />
              <Text style={auth.label}>Department</Text>
              <View style={prf.grid}>
                {DEPTS.map(d => (
                  <TouchableOpacity key={d} style={[prf.chip, department === d && prf.chipActive]} onPress={() => setDepartment(d)}>
                    <Text style={[prf.chipText, department === d && prf.chipTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={auth.label}>Year of Study</Text>
              <View style={prf.grid}>
                {YEARS.map(y => (
                  <TouchableOpacity key={y} style={[prf.chip, year === y && prf.chipActive]} onPress={() => setYear(y)}>
                    <Text style={[prf.chipText, year === y && prf.chipTextActive]}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={auth.primaryBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={auth.primaryBtnText}>Save Changes</Text>}
              </TouchableOpacity>
            </> : <>
              {[['Department', userData?.department], ['Year', userData?.year], ['Phone', userData?.phone], ['Bio', userData?.bio], ['Roll No', userData?.roll_number]].map(([label, value]) => (
                <View key={label as string}>
                  <View style={prf.row}><Text style={prf.rowLabel}>{label}</Text><Text style={prf.rowValue}>{value || 'Not set'}</Text></View>
                  <View style={prf.rowDivider} />
                </View>
              ))}
            </>}
          </View>
          <TouchableOpacity style={prf.logoutBtn} onPress={handleLogout}><Text style={prf.logoutText}>Sign Out</Text></TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


// ─── Club Head Dashboard ──────────────────────────────────────────────────────
function ClubHeadDashboard({ onLogout }: { onLogout: () => void }) {
  const [clubData, setClubData] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState(''), [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState(''), [eventVenue, setEventVenue] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'events' | 'announcements'>('overview');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annLoading, setAnnLoading] = useState(false);
  const [showAnnForm, setShowAnnForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: uData } = await supabase.from('users').select('name, club_id').eq('id', user.id).single();
        setCurrentUserName(uData?.name || '');
        const userData = uData;
        if (userData?.club_id) {
          const { data: club } = await supabase.from('clubs').select('*').eq('id', userData.club_id).single();
          setClubData(club);
          const { data: apps } = await supabase.from('applications').select('*').eq('club_id', userData.club_id).eq('status', 'pending');
          setApplications(apps || []);
          const { data: evts } = await supabase.from('events').select('*, clubs(name)').order('date', { ascending: true });
          setEvents(evts || []);
          const { data: mems } = await supabase.from('club_members').select('*, users(id, name, email, department, year, bio, phone, role)').eq('club_id', userData.club_id);
          setMembers(mems || []);
          const { data: anns } = await supabase.from('announcements').select('*').eq('club_id', userData.club_id).order('created_at', { ascending: false });
          setAnnouncements(anns || []);
        }
      }
    };
    fetchData();
  }, []);

  const handleApplication = async (id: string, status: 'accepted' | 'rejected', app: any) => {
    await supabase.from('applications').update({ status }).eq('id', id);
    if (status === 'accepted') {
      await supabase.from('club_members').insert({ club_id: app.club_id, user_id: app.user_id });
      await supabase.from('notifications').insert({
        user_id: app.user_id,
        title: 'Application Accepted',
        message: `You have been accepted into ${clubData?.name || 'the club'}!`,
        type: 'accepted',
      });
    } else {
      await supabase.from('notifications').insert({
        user_id: app.user_id,
        title: 'Application Rejected',
        message: `Your application to ${clubData?.name || 'the club'} was not accepted this time.`,
        type: 'rejected',
      });
    }
    const { data: apps } = await supabase.from('applications').select('*').eq('club_id', clubData?.id).eq('status', 'pending');
    setApplications(apps || []);
  };

  const postAnnouncement = async () => {
    if (!annTitle || !annContent) return;
    setAnnLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('announcements').insert({ club_id: clubData?.id, user_id: user?.id, title: annTitle, content: annContent });
    setAnnTitle(''); setAnnContent(''); setShowAnnForm(false); setAnnLoading(false);
    const { data: anns } = await supabase.from('announcements').select('*').eq('club_id', clubData?.id).order('created_at', { ascending: false });
    setAnnouncements(anns || []);
    // Send notification to all members
    const { data: mems } = await supabase.from('club_members').select('user_id').eq('club_id', clubData?.id);
    if (mems) {
      for (const m of mems) {
        await supabase.from('notifications').insert({ user_id: m.user_id, title: `📌 ${clubData?.name}: ${annTitle}`, message: annContent, type: 'info' });
      }
    }
  };

  const createEvent = async () => {
    if (!eventTitle || !eventDate || !eventVenue) return;
    setLoading(true);
    await supabase.from('events').insert({ title: eventTitle, description: eventDesc, date: eventDate, venue: eventVenue, club_id: clubData?.id });
    setEventTitle(''); setEventDesc(''); setEventDate(''); setEventVenue('');
    setShowEventForm(false); setLoading(false);
    const { data: evts } = await supabase.from('events').select('*').eq('club_id', clubData?.id);
    setEvents(evts || []);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); onLogout(); };

  if (showChat && clubData) return <ChatScreen club={clubData} onBack={() => setShowChat(false)} currentUserId={currentUserId} currentUserName={currentUserName} />;

  if (selectedMember) {
    const u = selectedMember.users;
    return (
      <SafeAreaView style={auth.safe}>
        <ScrollView contentContainerStyle={auth.scroll}>
          <TouchableOpacity onPress={() => setSelectedMember(null)} style={auth.backBtn}>
            <Text style={auth.backText}>← Back to Members</Text>
          </TouchableOpacity>
          <View style={prf.header}>
            <View style={prf.avatar}><Text style={prf.avatarText}>{u?.name ? u.name[0].toUpperCase() : '?'}</Text></View>
            <Text style={prf.name}>{u?.name || 'Unknown'}</Text>
            <Text style={prf.email}>{u?.email || ''}</Text>
            <View style={prf.roleBadge}><Text style={prf.roleText}>Student</Text></View>
          </View>
          <View style={auth.card}>
            <Text style={auth.cardTitle}>Details</Text>
            {[['Department', u?.department], ['Year', u?.year], ['Phone', u?.phone], ['Bio', u?.bio]].map(([label, value]) => (
              <View key={label as string}>
                <View style={prf.row}><Text style={prf.rowLabel}>{label}</Text><Text style={prf.rowValue}>{value || 'Not set'}</Text></View>
                <View style={prf.rowDivider} />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={adm.safe}>
      <ScrollView 
        style={adm.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} tintColor={PURPLE} colors={[PURPLE]} />}
      >
        <View style={adm.header}>
          <View>
            <Text style={[adm.title, { color: '#c084fc' }]}>Club Head</Text>
            <Text style={adm.subtitle}>{clubData?.name || 'Your Club'}</Text>
          </View>
          <TouchableOpacity style={adm.logoutBtn} onPress={handleLogout}><Text style={adm.logoutText}>Logout</Text></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={adm.tabScroll}>
          {[['overview', 'Overview'], ['applications', 'Applications'], ['events', 'Events'], ['announcements', 'Announcements']].map(([key, label]) => (
            <TouchableOpacity key={key} style={[adm.tabBtn, activeTab === key && adm.tabBtnActive]} onPress={() => setActiveTab(key as any)}>
              <Text style={[adm.tabText, activeTab === key && adm.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeTab === 'overview' && clubData && <>
          <View style={{ marginHorizontal: 24, backgroundColor: CARD, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: BORDER, marginBottom: 8 }}>
            <Text style={{ color: TEXT, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 }}>{clubData.name}</Text>
            <View style={adm.badge}><Text style={adm.badgeText}>{clubData.category}</Text></View>
            <Text style={{ color: MUTED, fontSize: 14, marginTop: 10, lineHeight: 20 }}>{clubData.description}</Text>
            <Text style={{ color: MUTED, fontSize: 13, marginTop: 12, fontWeight: '600' }}>👥 {members.length} members</Text>
            <TouchableOpacity style={[auth.primaryBtn, { backgroundColor: PURPLE2, marginTop: 16 }]} onPress={() => setShowChat(true)}>
              <Text style={auth.primaryBtnText}>Open Group Chat</Text>
            </TouchableOpacity>
          </View>
          <Text style={[adm.sectionTitle, { paddingHorizontal: 24, marginBottom: 12 }]}>Members</Text>
          {members.length === 0
            ? <View style={adm.empty}><Text style={adm.emptyText}>No members yet</Text></View>
            : members.map(m => (
              <TouchableOpacity key={m.id} style={adm.card} onPress={() => setSelectedMember(m)}>
                <View style={mem.avatar}><Text style={mem.avatarText}>{m.users?.name ? m.users.name[0].toUpperCase() : '?'}</Text></View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={adm.cardTitle}>{m.users?.name || 'Unknown'}</Text>
                  <Text style={adm.cardSub}>{m.users?.department || 'No dept'} • {m.users?.year || ''}</Text>
                </View>
                <Text style={{ color: PURPLE, fontSize: 18 }}>›</Text>
              </TouchableOpacity>
            ))
          }
        </>}

        {activeTab === 'applications' && <>
          <Text style={[adm.sectionTitle, { paddingHorizontal: 24, marginTop: 16, marginBottom: 12 }]}>Pending Applications</Text>
          {applications.length === 0
            ? <View style={adm.empty}><Text style={adm.emptyText}>No pending applications</Text></View>
            : applications.map(app => (
              <View key={app.id} style={adm.card}>
                <View style={{ flex: 1 }}>
                  <Text style={adm.cardTitle}>Application</Text>
                  <Text style={adm.cardSub}>{new Date(app.created_at).toLocaleDateString()}</Text>
                  {app.message ? <Text style={adm.cardMsg}>"{app.message}"</Text> : null}
                </View>
                <View style={{ gap: 8 }}>
                  <TouchableOpacity style={adm.acceptBtn} onPress={() => handleApplication(app.id, 'accepted', app)}><Text style={adm.actionText}>✓</Text></TouchableOpacity>
                  <TouchableOpacity style={adm.rejectBtn} onPress={() => handleApplication(app.id, 'rejected', app)}><Text style={adm.actionText}>✕</Text></TouchableOpacity>
                </View>
              </View>
            ))
          }
        </>}

        {activeTab === 'announcements' && <>
          <View style={adm.sectionHeader}>
            <Text style={adm.sectionTitle}>Announcements</Text>
            <TouchableOpacity style={adm.addBtn} onPress={() => setShowAnnForm(!showAnnForm)}>
              <Text style={adm.addBtnText}>{showAnnForm ? '✕ Cancel' : 'New Post'}</Text>
            </TouchableOpacity>
          </View>
          {showAnnForm && (
            <View style={adm.form}>
              <Text style={auth.label}>Title</Text>
              <TextInput style={auth.input} placeholder="Announcement title" placeholderTextColor="#555" value={annTitle} onChangeText={setAnnTitle} />
              <Text style={auth.label}>Content</Text>
              <TextInput style={[auth.input, { height: 100, textAlignVertical: 'top' }]} placeholder="Write your announcement..." placeholderTextColor="#555" value={annContent} onChangeText={setAnnContent} multiline />
              <TouchableOpacity style={auth.primaryBtn} onPress={postAnnouncement} disabled={annLoading}>
                {annLoading ? <ActivityIndicator color="#fff" /> : <Text style={auth.primaryBtnText}>Post Announcement 📌</Text>}
              </TouchableOpacity>
            </View>
          )}
          {announcements.length === 0
            ? <View style={adm.empty}><Text style={adm.emptyText}>No announcements posted yet</Text></View>
            : announcements.map(a => (
              <View key={a.id} style={adm.card}>
                <View style={{ flex: 1 }}>
                  <Text style={adm.cardTitle}>{a.title}</Text>
                  <Text style={adm.cardSub}>{a.content}</Text>
                  <Text style={[adm.cardSub, { marginTop: 6 }]}>{new Date(a.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
            ))
          }
        </>}

        {activeTab === 'events' && <>
          <View style={adm.sectionHeader}>
            <Text style={adm.sectionTitle}>Events</Text>
            <TouchableOpacity style={adm.addBtn} onPress={() => setShowEventForm(!showEventForm)}>
              <Text style={adm.addBtnText}>{showEventForm ? '✕ Cancel' : 'New Event'}</Text>
            </TouchableOpacity>
          </View>
          {showEventForm && (
            <View style={adm.form}>
              <Text style={auth.label}>Event Title</Text>
              <TextInput style={auth.input} placeholder="e.g. Hackathon 2025" placeholderTextColor="#555" value={eventTitle} onChangeText={setEventTitle} />
              <Text style={auth.label}>Description</Text>
              <TextInput style={[auth.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Event details..." placeholderTextColor="#555" value={eventDesc} onChangeText={setEventDesc} multiline />
              <Text style={auth.label}>Date (YYYY-MM-DD)</Text>
              <TextInput style={auth.input} placeholder="2025-03-15" placeholderTextColor="#555" value={eventDate} onChangeText={setEventDate} />
              <Text style={auth.label}>Venue</Text>
              <TextInput style={auth.input} placeholder="e.g. Main Auditorium" placeholderTextColor="#555" value={eventVenue} onChangeText={setEventVenue} />
              <TouchableOpacity style={auth.primaryBtn} onPress={createEvent} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={auth.primaryBtnText}>Create Event ✓</Text>}
              </TouchableOpacity>
            </View>
          )}
          {events.length === 0
            ? <View style={adm.empty}><Text style={adm.emptyText}>No events yet.</Text></View>
            : events.map(e => {
              const isPast = e.date && new Date(e.date) < new Date();
              return (
                <View key={e.id} style={adm.card}>
                  <View style={{flex: 1}}>
                    <Text style={adm.cardTitle}>{e.title}</Text>
                    <Text style={adm.cardSub}>{e.clubs?.name} • {e.date?.split('T')[0]}</Text>
                    <Text style={adm.cardSub}>📍 {e.venue}</Text>
                    <View style={[dash.eventBadge, isPast ? dash.eventBadgePast : dash.eventBadgeUpcoming]}>
                      <Text style={dash.eventBadgeText}>{isPast ? 'Completed' : 'Upcoming'}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          }
        </>}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}


// ─── Chat Screen ──────────────────────────────────────────────────────────────
function ChatScreen({ club, onBack, currentUserId, currentUserName }: {
  club: any; onBack: () => void; currentUserId: string; currentUserName: string;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, users(name)')
      .eq('club_id', club.id)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
  };

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel('messages:' + club.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'club_id=eq.' + club.id }, (payload) => {
        setMessages(prev => [...prev, payload.new as any]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    const msgText = text.trim();
    setText('');
    setSending(true);
    const tempMsg = { id: 'temp-' + Date.now(), sender_id: currentUserId, content: msgText, created_at: new Date().toISOString(), users: { name: currentUserName } };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    await supabase.from('messages').insert({ club_id: club.id, sender_id: currentUserId, content: msgText });
    setSending(false);
  };

  const deleteMessage = async (msgId: string) => {
    setDeletingId(msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    await supabase.from('messages').delete().eq('id', msgId).eq('sender_id', currentUserId);
    setDeletingId(null);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: BG }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={chat.header}>
          <TouchableOpacity onPress={onBack} style={chat.backBtn}>
            <Text style={chat.backText}>←</Text>
          </TouchableOpacity>
          <View style={chat.headerInfo}>
            <Text style={chat.headerTitle}>{club.name}</Text>
            <Text style={chat.headerSub}>Group Chat</Text>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={chat.messagesList}
          style={{ flex: 1 }}
          renderItem={({ item }) => {
            const isMe = item.sender_id === currentUserId;
            return (
              <View style={[chat.msgRow, isMe ? chat.msgRowMe : chat.msgRowOther]}>
                {!isMe && (
                  <View style={chat.msgAvatar}>
                    <Text style={chat.msgAvatarText}>{item.users?.name ? item.users.name[0].toUpperCase() : '?'}</Text>
                  </View>
                )}
                <View style={{ maxWidth: '75%' }}>
                  <TouchableOpacity
                    style={[chat.msgBubble, isMe ? chat.msgBubbleMe : chat.msgBubbleOther]}
                    onLongPress={() => isMe && deleteMessage(item.id)}
                    delayLongPress={500}
                  >
                    {!isMe && <Text style={chat.msgName}>{item.users?.name || 'Unknown'}</Text>}
                    <Text style={chat.msgText}>{item.content}</Text>
                    <Text style={chat.msgTime}>{formatTime(item.created_at)}</Text>
                  </TouchableOpacity>
                  {isMe && <Text style={chat.deleteHint}>Hold to delete</Text>}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={chat.empty}>
              <Text style={chat.emptyText}>No messages yet. Start the conversation!</Text>
            </View>
          }
        />

        <View style={chat.inputRow}>
          <TextInput
            style={chat.input}
            placeholder="Type a message..."
            placeholderTextColor="#555"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={[chat.sendBtn, !text.trim() && chat.sendBtnDisabled]} onPress={sendMessage} disabled={!text.trim() || sending}>
            {sending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={chat.sendIcon}>↑</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}


// ─── Notifications Screen ─────────────────────────────────────────────────────
function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setNotifications(data || []);
        // Mark all as read
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
      }
      setLoading(false);
    };
    fetchNotifs();
  }, []);

  const getIcon = (type: string) => {
    if (type === 'accepted') return '';
    if (type === 'rejected') return '❌';
    if (type === 'club_request') return '';
    return '🔔';
  };

  const getColor = (type: string) => {
    if (type === 'accepted') return '#16a34a';
    if (type === 'rejected') return '#dc2626';
    return PURPLE;
  };

  return (
    <SafeAreaView style={auth.safe}>
      <ScrollView contentContainerStyle={auth.scroll}>
        <TouchableOpacity onPress={onBack} style={auth.backBtn}>
          <Text style={auth.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={auth.header}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>🔔</Text>
          <Text style={auth.brand}>Notifications</Text>
        </View>
        {loading
          ? <ActivityIndicator color={PURPLE} style={{ marginTop: 40 }} />
          : notifications.length === 0
            ? <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>—</Text>
                <Text style={{ color: MUTED, fontSize: 15 }}>No notifications yet</Text>
              </View>
            : notifications.map(n => (
              <View key={n.id} style={[notif.card, !n.is_read && notif.cardUnread]}>
                <View style={[notif.iconBox, { backgroundColor: getColor(n.type) + '22' }]}>
                  <Text style={{ fontSize: 22 }}>{getIcon(n.type)}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={notif.title}>{n.title}</Text>
                  <Text style={notif.message}>{n.message}</Text>
                  <Text style={notif.time}>{new Date(n.created_at).toLocaleDateString()}</Text>
                </View>
                {!n.is_read && <View style={notif.dot} />}
              </View>
            ))
        }
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────
function DashboardScreen({ onLogout }: { onLogout: () => void }) {
  const [clubs, setClubs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [chatClub, setChatClub] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [joinedClubIds, setJoinedClubIds] = useState<string[]>([]);
  const [joinedClubs, setJoinedClubs] = useState<any[]>([]);
  const [showJoinedClubs, setShowJoinedClubs] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [clubAnnouncements, setClubAnnouncements] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<string[]>([]);
  const [userName, setUserName] = useState('');
  const [joinedCount, setJoinedCount] = useState(0);
  const [reqName, setReqName] = useState(''), [reqDesc, setReqDesc] = useState(''), [reqCat, setReqCat] = useState('');
  const [reqLoading, setReqLoading] = useState(false), [reqSuccess, setReqSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'clubs' | 'events'>('clubs');
  const [searchQuery, setSearchQuery] = useState('');
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    supabase.from('clubs').select('*').then(({ data }) => setClubs(data || []));
    supabase.from('events').select('*, clubs(name)').order('date', { ascending: true }).then(({ data }) => setEvents(data || []));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      supabase.from('users').select('name').eq('id', user.id).single().then(({ data }) => setUserName(data?.name || ''));
      supabase.from('club_members').select('id, club_id, clubs(*)').eq('user_id', user.id).then(({ data }) => {
        setJoinedCount(data?.length || 0);
        setJoinedClubIds((data || []).map((m: any) => m.club_id));
        setJoinedClubs((data || []).map((m: any) => m.clubs).filter(Boolean));
      });
      supabase.from('notifications').select('id').eq('user_id', user.id).eq('is_read', false).then(({ data }) => {
        setUnreadCount(data?.length || 0);
      });
      supabase.from('event_registrations').select('event_id').eq('user_id', user.id).then(({ data }) => {
        setRegisteredEvents((data || []).map((r: any) => r.event_id));
      });
      supabase.from('applications').select('club_id').eq('user_id', user.id).then(({ data }) => {
        setMyApplications((data || []).map((a: any) => a.club_id));
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Auto refresh every time screen comes into focus
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing) loadData();
    }, 30000); // refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { loadData(); }, []);

  const registerEvent = async (eventId: string, eventTitle: string) => {
    Alert.alert(
      'Confirm Registration',
      `Register for "${eventTitle}"?\n\nYour profile details will be shared with the organizer.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: async () => {
            setRegisteringId(eventId);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await supabase.from('event_registrations').insert({ event_id: eventId, user_id: user.id });
              setRegisteredEvents(prev => [...prev, eventId]);
              Alert.alert('Registered!', `You have successfully registered for "${eventTitle}".`);
            }
            setRegisteringId(null);
          }
        }
      ]
    );
  };

  const unregisterEvent = async (eventId: string, eventTitle: string) => {
    Alert.alert(
      'Cancel Registration',
      `Are you sure you want to cancel your registration for "${eventTitle}"?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setRegisteringId(eventId);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await supabase.from('event_registrations').delete().eq('event_id', eventId).eq('user_id', user.id);
              setRegisteredEvents(prev => prev.filter(id => id !== eventId));
            }
            setRegisteringId(null);
          }
        }
      ]
    );
  };

  const leaveClub = async (clubId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('club_members').delete().eq('club_id', clubId).eq('user_id', user.id);
    await supabase.from('clubs').update({ member_count: Math.max(0, (clubs.find((c:any) => c.id === clubId)?.member_count || 1) - 1) }).eq('id', clubId);
    // Update local state
    setJoinedClubs(prev => prev.filter((c: any) => c.id !== clubId));
    setJoinedClubIds(prev => prev.filter(id => id !== clubId));
    setJoinedCount(prev => Math.max(0, prev - 1));
  };

  const handleApply = async () => {
    if (!selectedClub) return;
    setApplying(true); setApplyError('');
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('applications').insert({ user_id: user?.id, club_id: selectedClub.id, status: 'pending', message: applyMessage });
    setApplying(false);
    if (error) { setApplyError(error.message); return; }
    setApplySuccess(true);
    setTimeout(() => { setSelectedClub(null); setApplySuccess(false); setApplyMessage(''); }, 2000);
  };

  const handleClubRequest = async () => {
    if (!reqName || !reqDesc || !reqCat) return;
    setReqLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('club_requests').insert({ user_id: user?.id, club_name: reqName, description: reqDesc, category: reqCat, status: 'pending' });
    setReqLoading(false); setReqSuccess(true);
    setTimeout(() => { setShowRequestForm(false); setReqSuccess(false); setReqName(''); setReqDesc(''); setReqCat(''); }, 2000);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); onLogout(); };

  if (showProfile) return <ProfileScreen onBack={() => setShowProfile(false)} onLogout={onLogout} />;

  // Fetch announcements when club selected
  const openClub = async (c: any) => {
    setSelectedClub(c);
    const { data } = await supabase.from('announcements').select('*').eq('club_id', c.id).order('created_at', { ascending: false });
    setClubAnnouncements(data || []);
  };
  if (showNotifications) return <NotificationsScreen onBack={() => { setShowNotifications(false); setUnreadCount(0); }} />;
  if (chatClub) return <ChatScreen club={chatClub} onBack={() => setChatClub(null)} currentUserId={currentUserId} currentUserName={userName} />;

  if (showJoinedClubs) return (
    <SafeAreaView style={auth.safe}>
      <ScrollView contentContainerStyle={auth.scroll}>
        <TouchableOpacity onPress={() => setShowJoinedClubs(false)} style={auth.backBtn}>
          <Text style={auth.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={auth.header}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}></Text>
          <Text style={auth.brand}>My Clubs</Text>
          <Text style={auth.tagline}>{joinedClubs.length} clubs joined</Text>
        </View>
        {joinedClubs.length === 0
          ? <View style={{ alignItems: 'center', paddingVertical: 40 }}><Text style={{ color: MUTED, fontSize: 15 }}>You haven't joined any clubs yet</Text></View>
          : joinedClubs.map((c: any) => (
            <View key={c.id} style={{ backgroundColor: CARD, borderRadius: 20, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: BORDER }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: TEXT, fontSize: 17, fontWeight: '800' }}>{c.name}</Text>
                  <Text style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>{c.description}</Text>
                  <View style={{ backgroundColor: PURPLE + '22', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8, alignSelf: 'flex-start' }}>
                    <Text style={{ color: ACCENT, fontSize: 11, fontWeight: '700' }}>{c.category}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[auth.primaryBtn, { backgroundColor: PURPLE2, marginTop: 14 }]}
                onPress={() => { setShowJoinedClubs(false); setChatClub(c); }}
              >
                <Text style={auth.primaryBtnText}>Open Group Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ borderWidth: 1.5, borderColor: '#7f1d1d', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 10 }}
                onPress={() => leaveClub(c.id)}
              >
                <Text style={{ color: '#f87171', fontSize: 14, fontWeight: '700' }}>Leave Club</Text>
              </TouchableOpacity>
            </View>
          ))
        }
      </ScrollView>
    </SafeAreaView>
  );

  if (showRequestForm) return (
    <SafeAreaView style={auth.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={auth.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => setShowRequestForm(false)} style={auth.backBtn}><Text style={auth.backText}>← Back</Text></TouchableOpacity>
          <View style={auth.header}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}></Text>
            <Text style={auth.brand}>Request a Club</Text>
            <Text style={auth.tagline}>Admin will review your request</Text>
          </View>
          <View style={auth.card}>
            {reqSuccess
              ? <View style={{ alignItems: 'center', padding: 20 }}>
                  <Text style={{ fontSize: 40, marginBottom: 12 }}></Text>
                  <Text style={{ color: '#86efac', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>Request sent! Admin will review it soon.</Text>
                </View>
              : <>
                <Text style={auth.cardTitle}>Club Details</Text>
                <Text style={auth.label}>Club Name</Text>
                <TextInput style={auth.input} placeholder="e.g. Photography Club" placeholderTextColor="#555" value={reqName} onChangeText={setReqName} />
                <Text style={auth.label}>Description</Text>
                <TextInput style={[auth.input, { height: 80, textAlignVertical: 'top' }]} placeholder="What will this club do?" placeholderTextColor="#555" value={reqDesc} onChangeText={setReqDesc} multiline />
                <Text style={auth.label}>Category</Text>
                <View style={adm.chipRow}>
                  {CATS.map(cat => (
                    <TouchableOpacity key={cat} style={[adm.chip, reqCat === cat && adm.chipActive]} onPress={() => setReqCat(cat)}>
                      <Text style={[adm.chipText, reqCat === cat && adm.chipTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={auth.primaryBtn} onPress={handleClubRequest} disabled={reqLoading}>
                  {reqLoading ? <ActivityIndicator color="#fff" /> : <Text style={auth.primaryBtnText}>Submit Request →</Text>}
                </TouchableOpacity>
              </>
            }
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  if (selectedClub) return (
    <SafeAreaView style={auth.safe}>
      <ScrollView contentContainerStyle={auth.scroll}>
        <TouchableOpacity onPress={() => setSelectedClub(null)} style={auth.backBtn}><Text style={auth.backText}>← Back</Text></TouchableOpacity>
        <View style={clu.header}>
          <Text style={clu.emoji}></Text>
          <Text style={clu.name}>{selectedClub.name}</Text>
          <View style={clu.tag}><Text style={clu.tagText}>{selectedClub.category}</Text></View>
          <Text style={clu.members}>{selectedClub.member_count} members</Text>
        </View>
        <View style={auth.card}>
          <Text style={clu.descTitle}>About</Text>
          <Text style={clu.desc}>{selectedClub.description}</Text>
          {joinedClubIds.includes(selectedClub.id)
            ? <TouchableOpacity style={[auth.primaryBtn, { backgroundColor: PURPLE2, marginTop: 16 }]} onPress={() => { setSelectedClub(null); setChatClub(selectedClub); }}>
                <Text style={auth.primaryBtnText}>Open Group Chat</Text>
              </TouchableOpacity>
            : <View style={clu.membersOnly}>
                <Text style={clu.membersOnlyText}>Members only — join this club to access the group chat</Text>
              </View>
          }
          {clubAnnouncements.length > 0 && <>
            <Text style={[auth.cardTitle, { marginTop: 24, marginBottom: 12 }]}>Announcements</Text>
            {clubAnnouncements.map(a => (
              <View key={a.id} style={{ backgroundColor: '#1e1040', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: BORDER }}>
                <Text style={{ color: TEXT, fontSize: 14, fontWeight: '700' }}>{a.title}</Text>
                <Text style={{ color: MUTED, fontSize: 13, marginTop: 6, lineHeight: 18 }}>{a.content}</Text>
                <Text style={{ color: MUTED, fontSize: 11, marginTop: 6 }}>{new Date(a.created_at).toLocaleDateString()}</Text>
              </View>
            ))}
          </>}
          {myApplications.includes(selectedClub.id)
            ? <View style={{ backgroundColor: '#1e1b4b', borderRadius: 12, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#312e81' }}>
                <Text style={{ color: '#a5b4fc', fontSize: 14, textAlign: 'center', fontWeight: '600' }}>Application Pending — Awaiting admin approval</Text>
              </View>
            : joinedClubIds.includes(selectedClub.id)
            ? <View style={{ backgroundColor: '#052e16', borderRadius: 12, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#166534' }}>
                <Text style={{ color: '#86efac', fontSize: 14, textAlign: 'center', fontWeight: '600' }}>You are already a member of this club</Text>
              </View>
            : applySuccess
            ? <View style={clu.successBox}><Text style={clu.successText}>Application sent! Wait for approval.</Text></View>
            : <>
              <Text style={auth.label}>Why do you want to join?</Text>
              <TextInput style={[auth.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Tell the club why you'd be a great member..." placeholderTextColor="#555" value={applyMessage} onChangeText={setApplyMessage} multiline />
              {applyError ? <View style={auth.errorBox}><Text style={auth.errorText}>{applyError}</Text></View> : null}
              <TouchableOpacity style={auth.primaryBtn} onPress={handleApply} disabled={applying}>
                {applying ? <ActivityIndicator color="#fff" /> : <Text style={auth.primaryBtnText}>Apply to Join →</Text>}
              </TouchableOpacity>
            </>
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={dash.safe}>
      <ScrollView 
        style={dash.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PURPLE} colors={[PURPLE]} />}
      >
        <View style={dash.header}>
          <View>
            <Text style={dash.greeting}>Hello,</Text>
            <Text style={dash.userName}>{userName || 'Student'}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <TouchableOpacity style={dash.bellBtn} onPress={() => setShowNotifications(true)}>
              <Text style={{ fontSize: 20 }}>🔔</Text>
              {unreadCount > 0 && <View style={dash.bellBadge}><Text style={dash.bellBadgeText}>{unreadCount}</Text></View>}
            </TouchableOpacity>
            <TouchableOpacity style={dash.avatar} onPress={() => setShowProfile(true)}>
              <Text style={dash.avatarText}>{userName ? userName[0].toUpperCase() : 'A'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={dash.statsRow}>
          {[[String(joinedCount), 'Clubs Joined'], [String(events.length), 'Events'], [String(joinedCount), 'Chats']].map(([n, l]) => (
            <TouchableOpacity key={l} style={dash.statCard} onPress={() => { if (l === 'Clubs Joined') setShowJoinedClubs(true); }}>
              <Text style={dash.statNum}>{n}</Text>
              <Text style={dash.statLabel}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={adm.tabRow}>
          <TouchableOpacity style={[adm.tab, activeTab === 'clubs' && adm.tabActive]} onPress={() => setActiveTab('clubs')}>
            <Text style={[adm.tabText, activeTab === 'clubs' && adm.tabTextActive]}>Clubs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[adm.tab, activeTab === 'events' && adm.tabActive]} onPress={() => setActiveTab('events')}>
            <Text style={[adm.tabText, activeTab === 'events' && adm.tabTextActive]}>Events</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'clubs' && <>
          <View style={dash.sectionHeader}>
            <Text style={dash.sectionTitle}>Discover Clubs</Text>
            <TouchableOpacity style={dash.requestBtn} onPress={() => setShowRequestForm(true)}>
              <Text style={dash.requestBtnText}>Request a Club</Text>
            </TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
            <TextInput
              style={[auth.input, { paddingLeft: 16 }]}
              placeholder="Search clubs..."
              placeholderTextColor="#555"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {clubs.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase())).length === 0
            ? <View style={dash.empty}><Text style={dash.emptyText}>{searchQuery ? 'No clubs match your search' : 'No clubs available yet'}</Text></View>
            : <View style={dash.clubsGrid}>
              {clubs.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                <TouchableOpacity key={c.id} style={dash.clubCard} onPress={() => openClub(c)}>
                  <Text style={dash.clubEmoji}>🏛️</Text>
                  <Text style={dash.clubName}>{c.name}</Text>
                  <View style={dash.clubTag}><Text style={dash.clubTagText}>{c.category}</Text></View>
                  <Text style={dash.clubMembers}>{c.member_count} members</Text>
                </TouchableOpacity>
              ))}
            </View>
          }
        </>}

        {activeTab === 'events' && <>
          <Text style={dash.sectionTitle}>Upcoming Events</Text>
          {events.length === 0
            ? <View style={dash.empty}><Text style={dash.emptyText}>No upcoming events</Text></View>
            : events.map(e => {
              const isPast = e.date && new Date(e.date) < new Date();
              const isRegistered = registeredEvents.includes(e.id);
              const isRegistering = registeringId === e.id;
              return (
                <View key={e.id} style={dash.eventCard}>
                  <View style={dash.eventInfo}>
                    <Text style={dash.eventTitle}>{e.title}</Text>
                    <Text style={dash.eventMeta}>{e.clubs?.name} • {e.date?.split('T')[0]}</Text>
                    <Text style={dash.eventMeta}>Venue: {e.venue}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <View style={[dash.eventBadge, isPast ? dash.eventBadgePast : dash.eventBadgeUpcoming]}>
                        <Text style={dash.eventBadgeText}>{isPast ? 'Completed' : 'Upcoming'}</Text>
                      </View>
                      {!isPast && (
                        <TouchableOpacity
                          style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: isRegistered ? '#2d1152' : PURPLE, borderWidth: 1, borderColor: isRegistered ? BORDER : PURPLE }}
                          onPress={() => isRegistered ? unregisterEvent(e.id, e.title) : registerEvent(e.id, e.title)}
                          disabled={!!isRegistering}
                        >
                          {isRegistering
                            ? <ActivityIndicator color="#fff" size="small" />
                            : <Text style={{ color: isRegistered ? MUTED : '#fff', fontSize: 12, fontWeight: '700' }}>{isRegistered ? 'Registered ✓' : 'Register'}</Text>
                          }
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          }
        </>}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [screen, setScreen] = useState<'splash' | 'login' | 'signup' | 'admin' | 'dashboard' | 'adminDash' | 'profileSetup' | 'clubHead' | 'forgotPassword'>('splash');
  return (
    <>
      {screen === 'splash' && <SplashScreen onNext={() => setScreen('login')} />}
      {screen === 'login' && (
        <LoginScreen
          onLogin={(isAdmin, profileComplete, isClubHead) => {
            if (isAdmin) setScreen('adminDash');
            else if (!profileComplete) setScreen('profileSetup');
            else if (isClubHead) setScreen('clubHead');
            else setScreen('dashboard');
          }}
          onGoSignup={() => setScreen('signup')}
          onAdminLogin={() => setScreen('admin')}
          onForgotPassword={() => setScreen('forgotPassword')}
        />
      )}
      {screen === 'forgotPassword' && <ForgotPasswordScreen onBack={() => setScreen('login')} />}
      {screen === 'signup' && <SignupScreen onBack={() => setScreen('login')} onDone={() => setScreen('login')} />}
      {screen === 'profileSetup' && <ProfileSetupScreen onDone={() => setScreen('dashboard')} />}
      {screen === 'admin' && <AdminLoginScreen onBack={() => setScreen('login')} onLogin={() => setScreen('adminDash')} />}
      {screen === 'adminDash' && <AdminDashboard onLogout={() => setScreen('login')} />}
      {screen === 'clubHead' && <ClubHeadDashboard onLogout={() => setScreen('login')} />}
      {screen === 'dashboard' && <DashboardScreen onLogout={() => setScreen('login')} />}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const splash = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080114', justifyContent: 'space-between', padding: 32 },
  circle1: { position: 'absolute', width: 350, height: 350, borderRadius: 175, backgroundColor: '#6d28d915', top: -100, right: -100 },
  circle2: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#8b5cf610', bottom: 80, left: -80 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  logoBox: { width: 88, height: 88, borderRadius: 28, backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center', marginBottom: 24, elevation: 16, shadowColor: PURPLE, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16 },
  logoIcon: { fontSize: 40 },
  title: { fontSize: 52, fontWeight: '900', color: '#fff', letterSpacing: -2 },
  subtitle: { fontSize: 17, color: ACCENT, marginTop: 10, fontWeight: '500', letterSpacing: 0.3 },
  desc: { fontSize: 15, color: MUTED, textAlign: 'center', marginTop: 20, lineHeight: 24, paddingHorizontal: 24 },
  bottom: { alignItems: 'center', paddingBottom: 24 },
  btn: { backgroundColor: PURPLE, paddingHorizontal: 48, paddingVertical: 18, borderRadius: 18, width: '100%', alignItems: 'center', elevation: 10, shadowColor: PURPLE, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  college: { color: MUTED, fontSize: 12, marginTop: 18, letterSpacing: 0.5 },
});

const auth = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, padding: 24 },
  header: { alignItems: 'center', paddingVertical: 36 },
  logoSmall: { width: 56, height: 56, borderRadius: 18, backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center', marginBottom: 14, elevation: 8 },
  logoIcon: { fontSize: 26 },
  brand: { fontSize: 34, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  tagline: { fontSize: 15, color: MUTED, marginTop: 6, letterSpacing: 0.2 },
  card: { backgroundColor: CARD, borderRadius: 28, padding: 28, borderWidth: 1, borderColor: BORDER },
  cardTitle: { fontSize: 24, fontWeight: '800', color: TEXT, marginBottom: 8, letterSpacing: -0.5 },
  label: { fontSize: 11, color: MUTED, marginBottom: 8, marginTop: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#0f0726', borderRadius: 14, padding: 16, color: TEXT, fontSize: 15, borderWidth: 1.5, borderColor: BORDER },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 10 },
  forgotText: { color: ACCENT, fontSize: 13, fontWeight: '500' },
  primaryBtn: { backgroundColor: PURPLE, borderRadius: 16, padding: 17, alignItems: 'center', marginTop: 28, elevation: 8, shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  secondaryBtn: { borderWidth: 1.5, borderColor: BORDER, borderRadius: 16, padding: 17, alignItems: 'center', marginTop: 12 },
  secondaryBtnText: { color: TEXT, fontSize: 16, fontWeight: '600' },
  adminBtn: { padding: 16, alignItems: 'center', marginTop: 8 },
  adminBtnText: { color: '#fbbf24', fontSize: 14, fontWeight: '600', letterSpacing: 0.2 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText: { color: MUTED, marginHorizontal: 14, fontSize: 12 },
  errorBox: { backgroundColor: '#2d0a0a', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#7f1d1d' },
  errorText: { color: '#fca5a5', fontSize: 13, lineHeight: 18 },
  helpText: { color: MUTED, fontSize: 14, lineHeight: 22, marginBottom: 16 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backText: { color: ACCENT, fontSize: 15, fontWeight: '600' },
});

const prf = StyleSheet.create({
  emoji: { fontSize: 48, marginBottom: 8 },
  note: { color: MUTED, fontSize: 13, marginBottom: 16, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#2d1152', borderWidth: 1, borderColor: BORDER },
  chipActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  chipText: { color: MUTED, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  header: { alignItems: 'center', paddingVertical: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 8 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  name: { fontSize: 24, fontWeight: '900', color: TEXT },
  email: { fontSize: 14, color: MUTED, marginTop: 4 },
  roleBadge: { backgroundColor: '#2d1152', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 10, borderWidth: 1, borderColor: BORDER },
  roleText: { color: PURPLE, fontSize: 13, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  rowLabel: { color: MUTED, fontSize: 14, fontWeight: '600' },
  rowValue: { color: TEXT, fontSize: 14, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  rowDivider: { height: 1, backgroundColor: BORDER },
  logoutBtn: { backgroundColor: '#450a0a', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24, borderWidth: 1, borderColor: '#7f1d1d' },
  logoutText: { color: '#f87171', fontSize: 16, fontWeight: '700' },
});

const clu = StyleSheet.create({
  header: { alignItems: 'center', paddingVertical: 24 },
  emoji: { fontSize: 56, marginBottom: 12 },
  name: { fontSize: 26, fontWeight: '900', color: TEXT },
  tag: { backgroundColor: '#2d1152', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 },
  tagText: { color: PURPLE, fontSize: 13, fontWeight: '600' },
  members: { color: MUTED, fontSize: 13, marginTop: 6 },
  descTitle: { fontSize: 16, fontWeight: '700', color: TEXT, marginBottom: 8 },
  desc: { color: MUTED, fontSize: 14, lineHeight: 22 },
  successBox: { backgroundColor: '#052e16', borderRadius: 12, padding: 16, marginTop: 20, borderWidth: 1, borderColor: '#166534' },
  successText: { color: '#86efac', fontSize: 14, textAlign: 'center', fontWeight: '600' },
  membersOnly: { backgroundColor: '#2d1152', borderRadius: 12, padding: 16, marginTop: 16, borderWidth: 1, borderColor: BORDER },
  membersOnlyText: { color: MUTED, fontSize: 14, textAlign: 'center' },
});

const adm = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 32 },
  title: { fontSize: 22, fontWeight: '900', color: '#f59e0b' },
  subtitle: { fontSize: 13, color: MUTED, marginTop: 2 },
  logoutBtn: { backgroundColor: '#2d1152', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  logoutText: { color: '#f87171', fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 8, marginBottom: 8 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  statNum: { color: '#fbbf24', fontSize: 22, fontWeight: '900' },
  statLabel: { color: MUTED, fontSize: 10, marginTop: 3, textAlign: 'center', fontWeight: '600' },
  tabScroll: { paddingHorizontal: 24, marginTop: 16, paddingBottom: 4, flexDirection: 'row', gap: 8 },
  tabRow: { flexDirection: 'row', marginHorizontal: 24, marginTop: 16, backgroundColor: CARD, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: BORDER },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: PURPLE },
  tabBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  tabBtnActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  tabText: { color: MUTED, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginTop: 24, marginBottom: 12 },
  sectionTitle: { color: TEXT, fontSize: 18, fontWeight: '800' },
  addBtn: { backgroundColor: PURPLE, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  form: { backgroundColor: CARD, marginHorizontal: 24, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: BORDER },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#2d1152', borderWidth: 1, borderColor: BORDER },
  chipActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  chipText: { color: MUTED, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  card: { flexDirection: 'row', backgroundColor: CARD, marginHorizontal: 24, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: BORDER },
  cardTitle: { color: TEXT, fontSize: 15, fontWeight: '700' },
  cardSub: { color: MUTED, fontSize: 12, marginTop: 4, lineHeight: 18 },
  cardMsg: { color: '#c084fc', fontSize: 12, marginTop: 6, fontStyle: 'italic' },
  badge: { backgroundColor: '#2d1152', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6, alignSelf: 'flex-start' },
  badgeText: { color: PURPLE, fontSize: 11, fontWeight: '600' },
  deleteBtn: { padding: 8, justifyContent: 'center' },
  acceptBtn: { backgroundColor: '#16a34a', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  rejectBtn: { backgroundColor: '#dc2626', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  actionText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: MUTED, fontSize: 15 },
  bellBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: CARD, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  bellBadge: { position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#dc2626', justifyContent: 'center', alignItems: 'center' },
  bellBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  eventBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 6 },
  eventBadgeUpcoming: { backgroundColor: '#1e3a1e' },
  eventBadgePast: { backgroundColor: '#2d1152' },
  eventBadgeText: { fontSize: 11, fontWeight: '700', color: '#86efac' },
});

const chat = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 20, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backText: { color: PURPLE, fontSize: 24, fontWeight: '700' },
  headerInfo: { flex: 1, marginLeft: 8 },
  headerTitle: { color: TEXT, fontSize: 17, fontWeight: '800' },
  headerSub: { color: MUTED, fontSize: 12, marginTop: 1 },
  messagesList: { padding: 16, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  msgAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: PURPLE2, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  msgAvatarText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  msgBubble: { maxWidth: '75%', borderRadius: 16, padding: 12 },
  msgBubbleMe: { backgroundColor: PURPLE, borderBottomRightRadius: 4 },
  msgBubbleOther: { backgroundColor: CARD, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: BORDER },
  msgName: { color: '#c084fc', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  msgText: { color: TEXT, fontSize: 15, lineHeight: 20 },
  msgTime: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 4, textAlign: 'right' },
  inputRow: { flexDirection: 'row', padding: 12, backgroundColor: CARD, borderTopWidth: 1, borderTopColor: BORDER, alignItems: 'flex-end', gap: 8 },
  input: { flex: 1, backgroundColor: '#2d1152', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: TEXT, fontSize: 15, borderWidth: 1, borderColor: BORDER, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  sendBtnDisabled: { backgroundColor: '#2d1152' },
  sendIcon: { color: '#fff', fontSize: 20, fontWeight: '900' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: MUTED, fontSize: 15, textAlign: 'center', marginTop: 60 },
  deleteHint: { color: MUTED, fontSize: 10, textAlign: 'right', marginTop: 2, marginRight: 4 },
});

const notif = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: BORDER },
  cardUnread: { borderColor: PURPLE, backgroundColor: '#1a0533' },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  title: { color: TEXT, fontSize: 15, fontWeight: '700' },
  message: { color: MUTED, fontSize: 13, marginTop: 4, lineHeight: 18 },
  time: { color: MUTED, fontSize: 11, marginTop: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: PURPLE, marginLeft: 8 },
});

const mem = StyleSheet.create({
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: PURPLE2, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});

const dash = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 36, paddingBottom: 20 },
  greeting: { color: MUTED, fontSize: 13, fontWeight: '500', letterSpacing: 0.3 },
  userName: { color: TEXT, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  avatarText: { color: '#fff', fontSize: 19, fontWeight: '800' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 10, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 18, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  statNum: { color: ACCENT, fontSize: 26, fontWeight: '900' },
  statLabel: { color: MUTED, fontSize: 10, marginTop: 4, textAlign: 'center', fontWeight: '600', letterSpacing: 0.3 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginTop: 8, marginBottom: 14 },
  sectionTitle: { color: TEXT, fontSize: 18, fontWeight: '800', paddingHorizontal: 24, marginTop: 8, marginBottom: 14, letterSpacing: -0.3 },
  requestBtn: { backgroundColor: PURPLE2, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  requestBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  clubsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: 12 },
  clubCard: { backgroundColor: CARD, borderRadius: 20, padding: 18, width: (width - 60) / 2, borderWidth: 1, borderColor: BORDER, alignItems: 'center' },
  clubEmoji: { fontSize: 34, marginBottom: 10 },
  clubName: { color: TEXT, fontSize: 14, fontWeight: '700', textAlign: 'center', letterSpacing: -0.2 },
  clubTag: { backgroundColor: PURPLE + '22', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 },
  clubTagText: { color: ACCENT, fontSize: 11, fontWeight: '700' },
  clubMembers: { color: MUTED, fontSize: 11, marginTop: 5, fontWeight: '500' },
  eventCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, marginHorizontal: 24, borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: BORDER },
  eventEmoji: { fontSize: 28, marginRight: 16 },
  eventInfo: { flex: 1 },
  eventTitle: { color: TEXT, fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  eventMeta: { color: MUTED, fontSize: 12, marginTop: 3, fontWeight: '500' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: MUTED, fontSize: 15 },
  bellBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: CARD, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  bellBadge: { position: 'absolute', top: -3, right: -3, width: 20, height: 20, borderRadius: 10, backgroundColor: DANGER, justifyContent: 'center', alignItems: 'center' },
  bellBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  eventBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 8 },
  eventBadgeUpcoming: { backgroundColor: SUCCESS + '22' },
  eventBadgePast: { backgroundColor: PURPLE + '22' },
  eventBadgeText: { fontSize: 11, fontWeight: '700', color: '#6ee7b7' },
});
