import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';
import { homeOutline, searchOutline, briefcaseOutline, documentTextOutline, settingsOutline } from 'ionicons/icons';
import Dashboard from '../pages/home/Dashboard';
import JobSearch from '../pages/jobs/JobSearch';
import JobDetails from '../pages/jobs/JobDetails';
import MatchAnalysis from '../pages/jobs/MatchAnalysis';
import { SavedJobs, ShortlistedJobs } from '../pages/jobs/FilteredJobs';
import Tracker from '../pages/applications/Tracker';
import ReviewQueue from '../pages/applications/ReviewQueue';
import InterviewCalendar from '../pages/applications/InterviewCalendar';
import FollowUps from '../pages/applications/FollowUps';
import MasterResume from '../pages/resume/MasterResume';
import ImportResume from '../pages/resume/ImportResume';
import EmploymentHistory from '../pages/resume/EmploymentHistory';
import SkillsCerts from '../pages/resume/SkillsCerts';
import EducationProjects from '../pages/resume/EducationProjects';
import ResumeVersions from '../pages/resume/ResumeVersions';
import ResumeTailoring from '../pages/resume/ResumeTailoring';
import CoverLetterEditor from '../pages/resume/CoverLetterEditor';
import DocumentLibrary from '../pages/resume/DocumentLibrary';
import Settings from '../pages/settings/Settings';
import ProviderManager from '../pages/settings/ProviderManager';
import OllamaManager from '../pages/settings/OllamaManager';
import { ProviderHealth, UsageCost, SearchSchedules, Notifications, Profile, Privacy, SystemLogs, Help } from '../pages/settings/SettingsPages';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function TabsShell() {
  const online = useNetworkStatus();
  return (
    <>
      {!online && (
        <div role="alert" style={{ background: 'var(--ajh-warn)', color: '#fff', textAlign: 'center', padding: 4 }}>
          You are offline. Showing recently loaded data, which may be stale.
        </div>
      )}
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/home" component={Dashboard} />
          <Route exact path="/jobs" component={JobSearch} />
          <Route exact path="/jobs/saved" component={SavedJobs} />
          <Route exact path="/jobs/shortlisted" component={ShortlistedJobs} />
          <Route exact path="/jobs/:id" component={JobDetails} />
          <Route exact path="/jobs/:id/match" component={MatchAnalysis} />
          <Route exact path="/applications" component={Tracker} />
          <Route exact path="/applications/review" component={ReviewQueue} />
          <Route exact path="/applications/interviews" component={InterviewCalendar} />
          <Route exact path="/applications/followups" component={FollowUps} />
          <Route exact path="/resume" component={MasterResume} />
          <Route exact path="/resume/import" component={ImportResume} />
          <Route exact path="/resume/employment" component={EmploymentHistory} />
          <Route exact path="/resume/skills" component={SkillsCerts} />
          <Route exact path="/resume/education" component={EducationProjects} />
          <Route exact path="/resume/versions" component={ResumeVersions} />
          <Route exact path="/resume/tailor" component={ResumeTailoring} />
          <Route exact path="/resume/cover-letter" component={CoverLetterEditor} />
          <Route exact path="/resume/documents" component={DocumentLibrary} />
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/settings/providers" component={ProviderManager} />
          <Route exact path="/settings/ollama" component={OllamaManager} />
          <Route exact path="/settings/health" component={ProviderHealth} />
          <Route exact path="/settings/usage" component={UsageCost} />
          <Route exact path="/settings/schedules" component={SearchSchedules} />
          <Route exact path="/settings/notifications" component={Notifications} />
          <Route exact path="/settings/profile" component={Profile} />
          <Route exact path="/settings/privacy" component={Privacy} />
          <Route exact path="/settings/logs" component={SystemLogs} />
          <Route exact path="/settings/help" component={Help} />
          <Route exact path="/"><Redirect to="/home" /></Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/home"><IonIcon icon={homeOutline} /><IonLabel>Home</IonLabel></IonTabButton>
          <IonTabButton tab="jobs" href="/jobs"><IonIcon icon={searchOutline} /><IonLabel>Find Jobs</IonLabel></IonTabButton>
          <IonTabButton tab="applications" href="/applications"><IonIcon icon={briefcaseOutline} /><IonLabel>Applications</IonLabel></IonTabButton>
          <IonTabButton tab="resume" href="/resume"><IonIcon icon={documentTextOutline} /><IonLabel>Resume</IonLabel></IonTabButton>
          <IonTabButton tab="settings" href="/settings"><IonIcon icon={settingsOutline} /><IonLabel>Settings</IonLabel></IonTabButton>
        </IonTabBar>
      </IonTabs>
    </>
  );
}
