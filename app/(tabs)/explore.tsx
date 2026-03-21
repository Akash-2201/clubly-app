import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

const BG = '#0a0118', CARD = '#130a2a', PURPLE = '#8b5cf6';
const ACCENT = '#c4b5fd', TEXT = '#f5f3ff', MUTED = '#8b8bab', BORDER = '#1e1040';
const DEPTS = ['Computer Science', 'Data Science', 'AIML', 'AIDS', 'EC', 'EEE', 'Civil', 'Mechanical'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function ProfileTab() {
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
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
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
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setLoading(true);
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
    setRefreshing(false);
  };

  const handleSave = async () => {
    if (!phone || !year || !department) { setError('Please fill all fields'); return; }
    if (!/^[0-9]{10}$/.test(phone)) { setError('Enter a valid 10-digit phone number'); return; }
    setSaving(true); setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('users').update({ bio, phone, year, department }).eq('id', user.id);
      setUserData((prev: any) => ({ ...prev, bio, phone, year, department }));
    }
    setSaving(false);
    setSuccess(true);
    setEditing(false);
    setTimeout(() => setSuccess(false), 2000);
  };

  if (loading) return (
    <SafeAreaView style={s.safe}>
      <ActivityIndicator color={PURPLE} style={{ marginTop: 100 }} />
    </SafeAreaView>
  );

  if (!userData) return (
    <SafeAreaView style={s.safe}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🔒</Text>
        <Text style={{ color: TEXT, fontSize: 20, fontWeight: '800', textAlign: 'center' }}>Login Required</Text>
        <Text style={{ color: MUTED, fontSize: 14, textAlign: 'center', marginTop: 8 }}>Please login to view your profile</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={s.scroll} 
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" colors={["#8b5cf6"]} />}
        >

          {/* Header */}
          <View style={s.header}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{userData?.name ? userData.name[0].toUpperCase() : '?'}</Text>
            </View>
            <Text style={s.name}>{userData?.name || 'Unknown'}</Text>
            <Text style={s.email}>{userData?.email || ''}</Text>
            <View style={s.roleBadge}>
              <Text style={s.roleText}>
                {userData?.role === 'admin' ? 'Admin' : userData?.role === 'club_head' ? 'Club Head' : 'Student'}
              </Text>
            </View>
          </View>

          {/* Success message */}
          {success && (
            <View style={s.successBox}>
              <Text style={s.successText}>Profile updated successfully!</Text>
            </View>
          )}

          {/* Edit button */}
          <View style={s.editRow}>
            <Text style={s.sectionTitle}>{editing ? 'Edit Profile' : 'My Profile'}</Text>
            <TouchableOpacity
              style={[s.editBtn, editing && s.editBtnCancel]}
              onPress={() => { setEditing(!editing); setError(''); }}
            >
              <Text style={s.editBtnText}>{editing ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          <View style={s.card}>
            {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

            {editing ? <>
              <Text style={s.label}>Bio</Text>
              <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Tell us about yourself..." placeholderTextColor="#555" value={bio} onChangeText={setBio} multiline />

              <Text style={s.label}>Phone Number</Text>
              <TextInput style={s.input} placeholder="10-digit number" placeholderTextColor="#555" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} />

              <Text style={s.label}>Department</Text>
              <View style={s.grid}>
                {DEPTS.map(d => (
                  <TouchableOpacity key={d} style={[s.chip, department === d && s.chipActive]} onPress={() => setDepartment(d)}>
                    <Text style={[s.chipText, department === d && s.chipTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.label}>Year of Study</Text>
              <View style={s.grid}>
                {YEARS.map(y => (
                  <TouchableOpacity key={y} style={[s.chip, year === y && s.chipActive]} onPress={() => setYear(y)}>
                    <Text style={[s.chipText, year === y && s.chipTextActive]}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Save Changes</Text>}
              </TouchableOpacity>
            </> : <>
              {[
                ['Full Name', userData?.name],
                ['Email', userData?.email],
                ['Department', userData?.department],
                ['Year', userData?.year],
                ['Phone', userData?.phone],
                ['Roll Number', userData?.roll_number],
                ['Bio', userData?.bio],
              ].map(([label, value]) => (
                <View key={label as string}>
                  <View style={s.row}>
                    <Text style={s.rowLabel}>{label}</Text>
                    <Text style={s.rowValue}>{value || 'Not set'}</Text>
                  </View>
                  <View style={s.divider} />
                </View>
              ))}
            </>}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, padding: 24 },
  header: { alignItems: 'center', paddingVertical: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 8 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  name: { fontSize: 24, fontWeight: '900', color: TEXT, letterSpacing: -0.5 },
  email: { fontSize: 14, color: MUTED, marginTop: 4 },
  roleBadge: { backgroundColor: '#2d1152', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 10, borderWidth: 1, borderColor: BORDER },
  roleText: { color: PURPLE, fontSize: 13, fontWeight: '700' },
  successBox: { backgroundColor: '#052e16', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#166534' },
  successText: { color: '#86efac', fontSize: 14, textAlign: 'center', fontWeight: '600' },
  editRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: TEXT, fontSize: 18, fontWeight: '800' },
  editBtn: { backgroundColor: PURPLE, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  editBtnCancel: { backgroundColor: '#2d1152' },
  editBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  card: { backgroundColor: CARD, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: BORDER },
  label: { fontSize: 11, color: MUTED, marginBottom: 8, marginTop: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#0f0726', borderRadius: 14, padding: 16, color: TEXT, fontSize: 15, borderWidth: 1.5, borderColor: BORDER },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#2d1152', borderWidth: 1, borderColor: BORDER },
  chipActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  chipText: { color: MUTED, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: PURPLE, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24, elevation: 6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  rowLabel: { color: MUTED, fontSize: 14, fontWeight: '600' },
  rowValue: { color: TEXT, fontSize: 14, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: BORDER },
  errorBox: { backgroundColor: '#2d0a0a', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#7f1d1d' },
  errorText: { color: '#fca5a5', fontSize: 13, lineHeight: 18 },
});
