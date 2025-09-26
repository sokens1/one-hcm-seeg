export const endpoints = {
  // Jobs
  listJobs: "/jobs",
  getJob: (id: string) => `/jobs/${id}`,
  // Applications
  listApplications: "/applications",
  getApplication: (id: string) => `/applications/${id}`,
  createApplication: "/applications",
  updateApplication: (id: string) => `/applications/${id}`,
  // Analytics / Dashboard
  recruiterDashboard: "/analytics/recruiter-dashboard",
  // Interviews
  scheduleInterview: "/interviews/schedule",
  cancelInterview: (id: string) => `/interviews/${id}/cancel`,
  // Emails
  sendInterviewEmail: "/emails/interview",
  // Storage
  storageUpload: "/storage/upload",
  storageDelete: "/storage/delete",
  storageGetUrl: (path: string) => `/storage/url?path=${encodeURIComponent(path)}`,
  storageDownload: (path: string) => `/storage/download?path=${encodeURIComponent(path)}`,
  // Auth (v1)
  authLogin: "/api/v1/auth/login",
  authSignup: "/api/v1/auth/signup",
  authMe: "/api/v1/auth/me",
  authLogout: "/api/v1/auth/logout",
  authToken: "/api/v1/auth/token",
};


