import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react'

export type UserProfile = { firstName: string; lastName: string; email: string; role: string; company: string; avatar?: string }
const storageKey = 'signalguard.profile'
const initialProfile: UserProfile = { firstName: 'Aditi', lastName: 'Sharma', email: 'aditi@signalguard.example', role: 'Research analyst', company: 'Enterprise' }
type ProfileContextValue = { profile: UserProfile; saveProfile: (profile: UserProfile) => void; fullName: string; initials: string }
const ProfileContext = createContext<ProfileContextValue | null>(null)

function loadProfile() { try { const saved = localStorage.getItem(storageKey); return saved ? { ...initialProfile, ...JSON.parse(saved) as Partial<UserProfile> } : initialProfile } catch { return initialProfile } }
export function ProfileProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<UserProfile>(loadProfile)
  const value = useMemo<ProfileContextValue>(() => ({ profile, saveProfile: next => { setProfile(next); localStorage.setItem(storageKey, JSON.stringify(next)) }, fullName: `${profile.firstName} ${profile.lastName}`.trim(), initials: `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase() || 'U' }), [profile])
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}
export function useProfile() { const context = useContext(ProfileContext); if (!context) throw new Error('useProfile must be used within ProfileProvider'); return context }
