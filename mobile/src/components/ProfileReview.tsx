import { useState } from 'react';
import { IonAlert, IonButton, IonCard, IonCardContent, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, jsonInit, type Item, type ProfileFull } from '../data/api';
import VerificationBadge from './VerificationBadge';
import ItemEditor, { type EditorState } from './ItemEditor';
import { ErrorRetry, SkeletonList } from './StateViews';

type Kind = 'employment' | 'skills' | 'education' | 'certifications' | 'projects';
const S = (v: unknown) => (v === undefined || v === null ? '' : String(v));

const SECTIONS: Array<{ kind: Kind; label: string; fields: string[]; title: (i: Item) => string; sub: (i: Item) => string }> = [
  { kind: 'employment', label: 'Employment', fields: ['title', 'company', 'start', 'end', 'description'],
    title: (i) => `${S(i.title) || '(no title)'}${i.company ? ` · ${S(i.company)}` : ''}`, sub: (i) => [S(i.start), S(i.end)].filter(Boolean).join(' to ') },
  { kind: 'skills', label: 'Skills', fields: ['name', 'level'], title: (i) => S(i.name), sub: (i) => S(i.level) },
  { kind: 'education', label: 'Education', fields: ['school', 'degree', 'years'], title: (i) => S(i.school) || S(i.degree), sub: (i) => [S(i.degree), S(i.years)].filter(Boolean).join(' · ') },
  { kind: 'certifications', label: 'Certifications', fields: ['name', 'issuer', 'year'], title: (i) => S(i.name), sub: (i) => [S(i.issuer), S(i.year)].filter(Boolean).join(' · ') },
  { kind: 'projects', label: 'Projects', fields: ['name', 'summary'], title: (i) => S(i.name), sub: (i) => S(i.summary).slice(0, 120) },
];
const PROFILE_FIELDS = ['name', 'email', 'phone', 'location', 'summary'];

export default function ProfileReview() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['profile'], queryFn: () => apiFetch<ProfileFull>('/profile') });
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [del, setDel] = useState<{ kind: Kind; id: number } | null>(null);
  const [msg, setMsg] = useState('');
  const refresh = () => qc.invalidateQueries({ queryKey: ['profile'] });

  const run = async (fn: () => Promise<unknown>) => {
    setMsg('');
    try { await fn(); await refresh(); } catch (e) { setMsg(e instanceof Error ? e.message : 'Request failed'); }
  };
  const confirmItem = (kind: Kind, id: number) => apiFetch(`/items/${kind}/${id}`, jsonInit('PATCH', { verification: 'verified' }));
  const strings = (rec: Record<string, unknown>, fields: string[]) => Object.fromEntries(fields.map((f) => [f, S(rec[f])]));

  if (q.isLoading) return <SkeletonList rows={4} />;
  if (q.isError) return <ErrorRetry message={`Could not load your profile. ${q.error instanceof Error ? q.error.message : ''}`} onRetry={() => q.refetch()} />;
  const p = q.data!;

  return (
    <>
      {msg && <p className="ion-padding-horizontal" style={{ color: 'var(--ajh-warn)' }}>{msg}</p>}
      <IonCard>
        <IonCardContent>
          <h2>{p.name || '(name not found)'} <VerificationBadge v={p.verification} /></h2>
          <div>{p.email || 'no email'} · {p.phone || 'no phone'} · {p.location || 'no location'}</div>
          <p>{p.summary || 'No summary.'}</p>
          <IonButton size="small" fill="outline" onClick={() => setEditor({
            title: 'Edit profile', fields: PROFILE_FIELDS, values: strings(p as unknown as Record<string, unknown>, PROFILE_FIELDS),
            onSave: async (v) => { await apiFetch('/profile', jsonInit('PUT', { fields: v, verification: 'verified' })); await refresh(); },
          })}>Edit</IonButton>
          {p.verification !== 'verified' && (
            <IonButton size="small" onClick={() => run(() => apiFetch('/profile', jsonInit('PUT', { fields: {}, verification: 'verified' })))}>Confirm</IonButton>
          )}
        </IonCardContent>
      </IonCard>

      {SECTIONS.map((s) => {
        const items = p[s.kind];
        const pending = items.filter((i) => i.verification !== 'verified');
        return (
          <IonList key={s.kind} inset>
            <IonListHeader>
              <IonLabel>{s.label} ({items.length}{pending.length ? `, ${pending.length} to review` : ''})</IonLabel>
              <IonButton size="small" fill="clear" onClick={() => setEditor({
                title: `Add ${s.label.toLowerCase()}`, fields: s.fields, values: {},
                onSave: async (v) => { await apiFetch(`/items/${s.kind}`, jsonInit('POST', { fields: v, verification: 'verified' })); await refresh(); },
              })}>Add</IonButton>
              {pending.length > 1 && (
                <IonButton size="small" fill="clear" onClick={() => run(async () => { for (const i of pending) await confirmItem(s.kind, i.id); })}>Confirm all</IonButton>
              )}
            </IonListHeader>
            {items.length === 0 && <IonItem><IonLabel>Nothing here yet.</IonLabel></IonItem>}
            {items.map((i) => (
              <IonItem key={i.id}>
                <IonLabel className="ion-text-wrap">
                  <h3>{s.title(i)}</h3>
                  <p>{s.sub(i)}</p>
                  <VerificationBadge v={i.verification} />
                  <div>
                    {i.verification !== 'verified' && <IonButton size="small" onClick={() => run(() => confirmItem(s.kind, i.id))}>Confirm</IonButton>}
                    <IonButton size="small" fill="outline" onClick={() => setEditor({
                      title: `Edit ${s.label.toLowerCase()}`, fields: s.fields, values: strings(i, s.fields),
                      onSave: async (v) => { await apiFetch(`/items/${s.kind}/${i.id}`, jsonInit('PATCH', { fields: v, verification: 'verified' })); await refresh(); },
                    })}>Edit</IonButton>
                    <IonButton size="small" fill="clear" color="danger" onClick={() => setDel({ kind: s.kind, id: i.id })}>Delete</IonButton>
                  </div>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        );
      })}

      <ItemEditor state={editor} onClose={() => setEditor(null)} />
      <IonAlert isOpen={!!del} header="Delete this entry?" message="This cannot be undone."
        buttons={[{ text: 'Cancel', role: 'cancel' }, { text: 'Delete', role: 'destructive', handler: () => { if (del) run(() => apiFetch(`/items/${del.kind}/${del.id}`, { method: 'DELETE' })); } }]}
        onDidDismiss={() => setDel(null)} />
    </>
  );
}
