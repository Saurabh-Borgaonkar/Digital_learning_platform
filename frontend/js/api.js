// NexLearn API Helper
const API_BASE = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('nexlearn_token');
const getUser = () => JSON.parse(localStorage.getItem('nexlearn_user') || 'null');

const api = {
  async request(endpoint, method = 'GET', body = null, auth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && getToken()) {
      headers['Authorization'] = `Bearer ${getToken()}`;
    }

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Auth
  register: (data) => api.request('/auth/register', 'POST', data, false),
  login: (data) => api.request('/auth/login', 'POST', data, false),
  getMe: () => api.request('/auth/me'),
  updateProfile: (data) => api.request('/auth/profile', 'PUT', data),

  // Courses
  getCourses: (params = '') => api.request(`/courses${params}`, 'GET', null, false),
  getCourse: (id) => api.request(`/courses/${id}`, 'GET', null, false),
  createCourse: (data) => api.request('/courses', 'POST', data),
  updateCourse: (id, data) => api.request(`/courses/${id}`, 'PUT', data),
  deleteCourse: (id) => api.request(`/courses/${id}`, 'DELETE'),
  togglePublish: (id) => api.request(`/courses/${id}/publish`, 'PUT'),
  getMyCourses: () => api.request('/courses/my-courses'),
  addLesson: (courseId, data) => api.request(`/courses/${courseId}/lessons`, 'POST', data),
  getLessons: (courseId) => api.request(`/courses/${courseId}/lessons`),

  // Enrollments
  enroll: (courseId) => api.request('/enrollments', 'POST', { courseId }),
  getMyEnrollments: () => api.request('/enrollments/my'),
  checkEnrollment: (courseId) => api.request(`/enrollments/check/${courseId}`),
  getCourseStudents: (courseId) => api.request(`/enrollments/course/${courseId}`),

  // Assignments
  createAssignment: (data) => api.request('/assignments', 'POST', data),
  getCourseAssignments: (courseId) => api.request(`/assignments/course/${courseId}`),
  submitAssignment: (id, data) => api.request(`/assignments/${id}/submit`, 'POST', data),
  gradeSubmission: (id, data) => api.request(`/assignments/submissions/${id}/grade`, 'PUT', data),
  getMySubmissions: () => api.request('/assignments/my-submissions'),
  getAssignmentSubmissions: (id) => api.request(`/assignments/${id}/submissions`),

  // Quizzes
  createQuiz: (data) => api.request('/quizzes', 'POST', data),
  getCourseQuizzes: (courseId) => api.request(`/quizzes/course/${courseId}`),
  getQuiz: (id) => api.request(`/quizzes/${id}`),
  attemptQuiz: (id, answers) => api.request(`/quizzes/${id}/attempt`, 'POST', { answers }),
  getMyResults: () => api.request('/quizzes/my-results'),

  // Progress
  getProgress: (courseId) => api.request(`/progress/${courseId}`),
  markLessonComplete: (courseId, lessonId) => api.request(`/progress/${courseId}/lesson/${lessonId}`, 'PUT'),

  // Certificates
  getMyCertificates: () => api.request('/certificates'),
  generateCertificate: (courseId) => api.request('/certificates/generate', 'POST', { courseId }),
  getCertificate: (id) => api.request(`/certificates/${id}`),

  // Admin
  getAllUsers: (role = '') => api.request(`/admin/users${role ? '?role=' + role : ''}`),
  updateUserRole: (id, role) => api.request(`/admin/users/${id}/role`, 'PUT', { role }),
  deleteUser: (id) => api.request(`/admin/users/${id}`, 'DELETE'),
  getAnalytics: () => api.request('/admin/analytics'),
};

// Auth helpers
function saveAuth(data) {
  localStorage.setItem('nexlearn_token', data.token);
  localStorage.setItem('nexlearn_user', JSON.stringify(data.user));
}

function clearAuth() {
  localStorage.removeItem('nexlearn_token');
  localStorage.removeItem('nexlearn_user');
}

function requireAuth(allowedRoles = []) {
  const user = getUser();
  if (!user || !getToken()) {
    window.location.href = '/pages/login.html';
    return null;
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    window.location.href = '/pages/index.html';
    return null;
  }
  return user;
}

function showToast(message, type = 'success') {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = `fixed top-5 right-5 z-50 px-6 py-3 rounded-xl shadow-lg font-semibold text-white transition-all duration-300 ${
    type === 'success' ? 'bg-lime-500' : 'bg-red-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3500);
}
