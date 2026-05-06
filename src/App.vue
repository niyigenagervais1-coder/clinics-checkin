<template>
  <div class="clinic-app">
    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar Navigation -->
        <nav class="col-md-3 col-lg-2 d-md-block sidebar">
          <div class="position-sticky pt-3">
            <div class="sidebar-header text-center py-3">
              <div class="clinic-logo mb-2">
                <i class="bi bi-hospital"></i>
              </div>
              <h4 class="sidebar-heading mb-0">MediCheck</h4>
              <small class="text-muted">Digital Clinic System</small>
            </div>
            <ul class="nav flex-column mt-3">
              <!-- Dynamic Menus: Iterate through navigation array -->
              <li v-for="item in navigationItems" :key="item.id" class="nav-item">
                <a 
                  class="nav-link d-flex align-items-center" 
                  :class="{ active: item.active }" 
                  href="#" 
                  @click="setActiveNavigation(item.id)"
                >
                  <i :class="'bi bi-' + item.icon + ' me-2'"></i>
                  <span>{{ item.name }}</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <!-- Main Content -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <!-- Check-in Section -->
          <div v-if="activeNavItem === 1">
            <div class="header-section d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4 mb-4">
              <div>
                <h1 class="main-title mb-2">Digital Patient Check-in</h1>
                <p class="text-muted mb-0">Welcome to our modern clinic management system</p>
              </div>
              <div class="queue-badge">
                <div class="queue-counter">
                  <span class="queue-label">Current Queue</span>
                  <span class="queue-number">#{{ currentQueueNumber - 1 }}</span>
                </div>
              </div>
            </div>

            <!-- Conditional rendering: Toggle between Registration Form and Queue Status -->
            <div v-if="!isRegistered" class="registration-section">
              <div class="registration-card">
                <div class="card-header-custom">
                  <div class="d-flex align-items-center">
                    <div class="logo-wrapper me-3">
                      <div class="clinic-logo-small">
                        <span class="logo-text">MC</span>
                      </div>
                    </div>
                    <div>
                      <h5 class="card-title mb-0">MediCheck Patient Registration System</h5>
                      <small class="text-muted">Digital Clinic Management - Please fill in your information</small>
                    </div>
                  </div>
                </div>
                <div class="card-body-custom">
                  <form @submit.prevent="submitCheckIn" class="registration-form">
                    <!-- Reactive Variables: Input Binding with v-model -->
                    <div class="form-group-custom mb-4">
                      <label for="name" class="form-label-custom">
                        <i class="bi bi-person me-2"></i>Full Name
                      </label>
                      <input 
                        type="text" 
                        class="form-control-custom" 
                        id="name" 
                        v-model="patientForm.name"
                        placeholder="enter name"
                        autocomplete="off"
                        required
                      >
                    </div>

                    <div class="form-group-custom mb-4">
                      <label for="nationalID" class="form-label-custom">
                        <i class="bi bi-card-text me-2"></i>National ID
                      </label>
                      <input 
                        type="text" 
                        class="form-control-custom" 
                        id="nationalID" 
                        v-model="patientForm.nationalID"
                        placeholder="Enter your National ID (10-12 digits)"
                        :class="{ 'is-invalid': formErrors.nationalID }"
                        required
                      >
                      <div v-if="formErrors.nationalID" class="error-feedback">
                        {{ formErrors.nationalID }}
                      </div>
                    </div>

                    <div class="form-group-custom mb-4">
                      <label class="form-label-custom">
                        <i class="bi bi-clipboard2-pulse me-2"></i>Select Your Symptoms
                      </label>
                      <div class="symptoms-grid">
                        <!-- Array for Symptom Collection: Multiple checkboxes -->
                        <div v-for="symptom in availableSymptoms" :key="symptom" class="symptom-item">
                          <div class="symptom-checkbox">
                            <input 
                              class="symptom-input" 
                              type="checkbox" 
                              :id="'symptom-' + symptom"
                              :value="symptom"
                              v-model="patientForm.symptoms"
                            >
                            <label class="symptom-label" :for="'symptom-' + symptom">
                              <span class="symptom-icon">
                                <i class="bi bi-activity"></i>
                              </span>
                              {{ symptom }}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Conditional Statements: Form Validation -->
                    <div v-if="formErrors.general" class="alert-custom alert-danger-custom">
                      <i class="bi bi-exclamation-triangle me-2"></i>
                      {{ formErrors.general }}
                    </div>

                    <div class="form-actions">
                      <button type="submit" class="btn-custom btn-primary-custom">
                        <i class="bi bi-check-circle me-2"></i>Submit Check-in
                      </button>
                      <button type="button" class="btn-custom btn-secondary-custom" @click="cancelRegistration">
                        <i class="bi bi-x-circle me-2"></i>Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <!-- Queue Status View -->
            <div v-else class="queue-status-section">
              <div class="success-card">
                <div class="success-content">
                  <div class="success-icon">
                    <i class="bi bi-check-circle-fill"></i>
                  </div>
                  <div class="success-text">
                    <h4 class="success-title">Registration Successful!</h4>
                    <p class="success-message">Your queue number is: <span class="queue-highlight">#{{ lastPatientQueueNumber }}</span></p>
                    <p class="success-instruction">Please wait for your turn. You can view the current queue below.</p>
                  </div>
                </div>
              </div>

              <!-- Table Rendering: Use v-for to loop through patient array -->
              <div class="queue-card mt-4">
                <div class="queue-header">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                      <div class="queue-icon me-3">
                        <i class="bi bi-people-fill"></i>
                      </div>
                      <div>
                        <h5 class="queue-title mb-0">Current Queue</h5>
                        <small class="text-muted">{{ patientsInQueue.length }} patients waiting</small>
                      </div>
                    </div>
                    <div class="queue-stats">
                      <span class="stat-badge">{{ patientsInQueue.length }} in queue</span>
                    </div>
                  </div>
                </div>
                <div class="queue-body">
                  <div class="queue-table-container">
                    <table class="queue-table">
                      <thead>
                        <tr>
                          <th><i class="bi bi-hash me-1"></i>Queue #</th>
                          <th><i class="bi bi-person me-1"></i>Name</th>
                          <th><i class="bi bi-card-text me-1"></i>ID</th>
                          <th><i class="bi bi-clipboard2-pulse me-1"></i>Symptoms</th>
                          <th><i class="bi bi-clock me-1"></i>Time</th>
                          <th><i class="bi bi-info-circle me-1"></i>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <!-- Looping (Iteration): v-for for table rendering -->
                        <tr v-for="patient in patientsInQueue" :key="patient.id" class="patient-row">
                          <td><span class="queue-badge-custom">{{ patient.queueNumber }}</span></td>
                          <td class="patient-name">{{ patient.name }}</td>
                          <td class="patient-id">{{ maskNationalID(patient.nationalID) }}</td>
                          <td class="symptoms-cell">
                            <div class="symptoms-list">
                              <span v-for="symptom in patient.symptoms" :key="symptom" class="symptom-badge">
                                {{ symptom }}
                              </span>
                            </div>
                          </td>
                          <td class="time-cell">{{ patient.checkInTime }}</td>
                          <td>
                            <span class="status-badge status-waiting">Waiting</span>
                          </td>
                        </tr>
                        <tr v-if="patientsInQueue.length === 0" class="empty-row">
                          <td colspan="6" class="text-center">
                            <div class="empty-state">
                              <i class="bi bi-inbox"></i>
                              <p>No patients in queue</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div class="action-section mt-4">
                <button class="btn-custom btn-primary-custom btn-lg" @click="startNewRegistration">
                  <i class="bi bi-plus-circle me-2"></i>New Patient Registration
                </button>
              </div>
            </div>
          </div>

          <!-- My Profile Section -->
          <div v-else-if="activeNavItem === 2">
            <div class="header-section d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4 mb-4">
              <div>
                <h1 class="main-title mb-2">My Profile</h1>
                <p class="text-muted mb-0">Manage your personal information and preferences</p>
              </div>
            </div>

            <div class="profile-card">
              <div class="profile-header">
                <div class="profile-avatar">
                  <i class="bi bi-person-circle"></i>
                </div>
                <div class="profile-info">
                  <h3 class="profile-name">Niyigena Gervis</h3>
                  <p class="profile-subtitle">Patient ID: #12345</p>
                </div>
              </div>
              
              <div class="profile-body">
                <div class="info-section">
                  <h4 class="section-title">Personal Information</h4>
                  <div class="info-grid">
                    <div class="info-item">
                      <label class="info-label">Full Name</label>
                      <div class="info-value">Niyigena Gervis</div>
                    </div>
                    <div class="info-item">
                      <label class="info-label">National ID</label>
                      <div class="info-value">1234567890</div>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Date of Birth</label>
                      <div class="info-value">January 1, 1990</div>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Phone Number</label>
                      <div class="info-value">+1 234 567 8900</div>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Email</label>
                      <div class="info-value">niyigengervais1@gmail.com</div>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Address</label>
                      <div class="info-value">123 Main St, City, State 12345</div>
                    </div>
                  </div>
                </div>

                <div class="info-section">
                  <h4 class="section-title">Medical History</h4>
                  <div class="history-list">
                    <div class="history-item">
                      <div class="history-date">2024-01-15</div>
                      <div class="history-details">
                        <h5>General Check-up</h5>
                        <p>Annual physical examination - All results normal</p>
                      </div>
                    </div>
                    <div class="history-item">
                      <div class="history-date">2023-08-20</div>
                      <div class="history-details">
                        <h5>Flu Treatment</h5>
                        <p>Treated for seasonal flu - Prescribed antiviral medication</p>
                      </div>
                    </div>
                    <div class="history-item">
                      <div class="history-date">2023-03-10</div>
                      <div class="history-details">
                        <h5>Dental Check-up</h5>
                        <p>Routine dental cleaning and examination</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="profile-actions">
                  <button class="btn-custom btn-primary-custom">
                    <i class="bi bi-pencil me-2"></i>Edit Profile
                  </button>
                  <button class="btn-custom btn-secondary-custom">
                    <i class="bi bi-download me-2"></i>Download Records
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Help Section -->
          <div v-else-if="activeNavItem === 3">
            <div class="header-section d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4 mb-4">
              <div>
                <h1 class="main-title mb-2">Help & Support</h1>
                <p class="text-muted mb-0">Find answers to frequently asked questions and get support</p>
              </div>
            </div>

            <div class="help-content">
              <div class="help-section">
                <h3 class="help-title">Frequently Asked Questions</h3>
                <div class="faq-list">
                  <div class="faq-item">
                    <div class="faq-question">
                      <i class="bi bi-question-circle me-2"></i>
                      How do I check in for my appointment?
                    </div>
                    <div class="faq-answer">
                      To check in, navigate to the Check-in section from the sidebar menu. Fill in your personal information including your full name, National ID, and select your symptoms. Click "Submit Check-in" to complete the process and receive your queue number.
                    </div>
                  </div>
                  
                  <div class="faq-item">
                    <div class="faq-question">
                      <i class="bi bi-question-circle me-2"></i>
                      What is a queue number and how does it work?
                    </div>
                    <div class="faq-answer">
                      A queue number is assigned to you when you check in. It represents your position in the waiting line. Patients are served in ascending order based on their queue numbers. You can monitor your position in the Current Queue display.
                    </div>
                  </div>
                  
                  <div class="faq-item">
                    <div class="faq-question">
                      <i class="bi bi-question-circle me-2"></i>
                      How can I update my personal information?
                    </div>
                    <div class="faq-answer">
                      Navigate to the My Profile section to view and update your personal information. Click the "Edit Profile" button to make changes to your details such as contact information or address.
                    </div>
                  </div>
                  
                  <div class="faq-item">
                    <div class="faq-question">
                      <i class="bi bi-question-circle me-2"></i>
                      What symptoms should I select during check-in?
                    </div>
                    <div class="faq-answer">
                      Select all symptoms that you are currently experiencing. This helps our medical staff better prepare for your consultation and provide appropriate care. You can select multiple symptoms from the list provided.
                    </div>
                  </div>
                  
                  <div class="faq-item">
                    <div class="faq-question">
                      <i class="bi bi-question-circle me-2"></i>
                      How long is my information stored in the system?
                    </div>
                    <div class="faq-answer">
                      Your check-in information is stored temporarily for the duration of your visit. Personal profile information and medical history are maintained securely according to healthcare privacy regulations and our data retention policies.
                    </div>
                  </div>
                </div>
              </div>

              <div class="help-section">
                <h3 class="help-title">Contact Support</h3>
                <div class="contact-grid">
                  <div class="contact-card">
                    <div class="contact-icon">
                      <i class="bi bi-telephone"></i>
                    </div>
                    <div class="contact-info">
                      <h4>Phone Support</h4>
                      <p>Call us for immediate assistance</p>
                      <div class="contact-detail">+1 (555) 123-4567</div>
                      <small class="contact-hours">Mon-Fri: 8AM-6PM, Sat: 9AM-2PM</small>
                    </div>
                  </div>
                  
                  <div class="contact-card">
                    <div class="contact-icon">
                      <i class="bi bi-envelope"></i>
                    </div>
                    <div class="contact-info">
                      <h4>Email Support</h4>
                      <p>Send us an email for non-urgent inquiries</p>
                      <div class="contact-detail">support@medicheck.com</div>
                      <small class="contact-hours">Response within 24 hours</small>
                    </div>
                  </div>
                  
                  <div class="contact-card">
                    <div class="contact-icon">
                      <i class="bi bi-geo-alt"></i>
                    </div>
                    <div class="contact-info">
                      <h4>In-Person Support</h4>
                      <p>Visit our front desk for assistance</p>
                      <div class="contact-detail">Main Lobby, Ground Floor</div>
                      <small class="contact-hours">Daily: 7AM-8PM</small>
                    </div>
                  </div>
                </div>
              </div>

              <div class="help-section">
                <h3 class="help-title">Quick Tips</h3>
                <div class="tips-grid">
                  <div class="tip-card">
                    <div class="tip-icon">
                      <i class="bi bi-lightning"></i>
                    </div>
                    <div class="tip-content">
                      <h4>Fast Check-in</h4>
                      <p>Have your National ID ready for quick registration</p>
                    </div>
                  </div>
                  
                  <div class="tip-card">
                    <div class="tip-icon">
                      <i class="bi bi-clock"></i>
                    </div>
                    <div class="tip-content">
                      <h4>Arrive Early</h4>
                      <p>Check in 15 minutes before your appointment time</p>
                    </div>
                  </div>
                  
                  <div class="tip-card">
                    <div class="tip-icon">
                      <i class="bi bi-shield-check"></i>
                    </div>
                    <div class="tip-content">
                      <h4>Privacy</h4>
                      <p>Your information is secure and confidential</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useClinicStore } from './stores/clinicStore'

export default {
  name: 'App',
  setup() {
    const clinicStore = useClinicStore()
    
    // Reactive Variables: Form data with two-way binding
    const patientForm = ref({
      name: '',
      nationalID: '',
      symptoms: []
    })
    
    // Form validation errors
    const formErrors = ref({
      nationalID: '',
      general: ''
    })
    
    // Computed properties from store
    const isRegistered = computed(() => clinicStore.isRegistered)
    const patients = computed(() => clinicStore.patients)
    const patientsInQueue = computed(() => clinicStore.patientsInQueue)
    const currentQueueNumber = computed(() => clinicStore.currentQueueNumber)
    const navigationItems = computed(() => clinicStore.navigationItems)
    const availableSymptoms = computed(() => clinicStore.availableSymptoms)
    
    // Get active navigation item ID
    const activeNavItem = computed(() => {
      const activeItem = navigationItems.value.find(item => item.active)
      return activeItem ? activeItem.id : 1
    })
    
    // Get last patient queue number
    const lastPatientQueueNumber = computed(() => {
      if (patients.value.length > 0) {
        return patients.value[patients.value.length - 1].queueNumber
      }
      return currentQueueNumber.value - 1
    })
    
    // Functions and Methods: Event Handling
    const validateForm = () => {
      formErrors.value = { nationalID: '', general: '' }
      let isValid = true
      
      // Conditional Statements: Form Validation
      if (!patientForm.value.nationalID.trim()) {
        formErrors.value.nationalID = 'National ID is required'
        isValid = false
      } else if (!/^\d{10,12}$/.test(patientForm.value.nationalID)) {
        formErrors.value.nationalID = 'National ID must be 10-12 digits'
        isValid = false
      }
      
      if (!patientForm.value.name.trim()) {
        formErrors.value.general = 'Please fill in all required fields'
        isValid = false
      }
      
      if (patientForm.value.symptoms.length === 0) {
        formErrors.value.general = 'Please select at least one symptom'
        isValid = false
      }
      
      return isValid
    }
    
    // Event Handling: Submit check-in
    const submitCheckIn = () => {
      if (validateForm()) {
        // State Mutation: Add new patient
        const newPatient = clinicStore.addPatient({
          name: patientForm.value.name,
          nationalID: patientForm.value.nationalID,
          symptoms: patientForm.value.symptoms
        })
        
        // Save session data
        clinicStore.saveSessionData()
        
        // Reset form
        patientForm.value = { name: '', nationalID: '', symptoms: [] }
        
        console.log('Patient registered:', newPatient)
      }
    }
    
    // Event Handling: Cancel registration
    const cancelRegistration = () => {
      patientForm.value = { name: '', nationalID: '', symptoms: [] }
      formErrors.value = { nationalID: '', general: '' }
    }
    
    // Start new registration
    const startNewRegistration = () => {
      clinicStore.clearRegistration()
      patientForm.value = { name: '', nationalID: '', symptoms: [] }
      formErrors.value = { nationalID: '', general: '' }
    }
    
    // Set active navigation
    const setActiveNavigation = (itemId) => {
      clinicStore.setActiveNavigation(itemId)
    }
    
    // Utility function to mask National ID
    const maskNationalID = (id) => {
      if (!id) return ''
      return id.slice(0, 3) + '******' + id.slice(-2)
    }
    
    // Lifecycle Methods: Initialize clinic environment
    onMounted(() => {
      clinicStore.initializeClinic()
    })
    
    return {
      // Reactive Variables
      patientForm,
      formErrors,
      
      // Computed properties
      isRegistered,
      patients,
      patientsInQueue,
      currentQueueNumber,
      navigationItems,
      availableSymptoms,
      lastPatientQueueNumber,
      activeNavItem,
      
      // Functions and Methods
      submitCheckIn,
      cancelRegistration,
      startNewRegistration,
      setActiveNavigation,
      maskNationalID
    }
  }
}
</script>

<style scoped>
.clinic-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Sidebar Styles */
.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  padding: 0;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.clinic-logo {
  font-size: 2.5rem;
  color: #3498db;
  margin-bottom: 0.5rem;
}

.sidebar-heading {
  color: #ffffff;
  font-weight: 600;
  font-size: 1.2rem;
  text-transform: none;
}

.sidebar .nav-link {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  padding: 1rem 1.5rem;
  border-radius: 0;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.sidebar .nav-link:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
  border-left-color: #3498db;
}

.sidebar .nav-link.active {
  color: #ffffff;
  background-color: rgba(52, 152, 219, 0.2);
  border-left-color: #3498db;
}

/* Main Content */
main {
  margin-left: 240px;
  background: rgba(255, 255, 255, 0.95);
  min-height: 100vh;
}

.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin: -1rem -1.5rem 2rem -1.5rem;
  padding: 2rem 1.5rem;
  border-radius: 0 0 1rem 1rem;
}

.main-title {
  font-weight: 700;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.queue-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  backdrop-filter: blur(10px);
}

.queue-counter {
  text-align: center;
}

.queue-label {
  display: block;
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.queue-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
}

/* Registration Card */
.registration-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: none;
  margin-bottom: 2rem;
}

.card-header-custom {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  padding: 1.5rem;
  border: none;
}

.icon-wrapper {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.logo-wrapper {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.clinic-logo-small {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.clinic-logo-small::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  opacity: 0.1;
}

.logo-text {
  font-weight: 800;
  font-size: 1.2rem;
  color: #2c3e50;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.card-body-custom {
  padding: 2rem;
}

/* Form Styles */
.form-group-custom {
  position: relative;
}

.form-label-custom {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.form-control-custom {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e6ed;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-control-custom:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  background: white;
  outline: none;
}

.form-control-custom.is-invalid {
  border-color: #e74c3c;
}

.error-feedback {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
}

/* Symptoms Grid */
.symptoms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.symptom-item {
  position: relative;
}

.symptom-checkbox {
  position: relative;
}

.symptom-input {
  position: absolute;
  opacity: 0;
}

.symptom-label {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border: 2px solid #e0e6ed;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.symptom-input:checked + .symptom-label {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border-color: #3498db;
}

.symptom-icon {
  margin-right: 0.5rem;
  font-size: 1.25rem;
}

/* Buttons */
.btn-custom {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-size: 1rem;
}

.btn-primary-custom {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.btn-primary-custom:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.btn-secondary-custom {
  background: #95a5a6;
  color: white;
}

.btn-secondary-custom:hover {
  background: #7f8c8d;
  transform: translateY(-2px);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

/* Success Card */
.success-card {
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(39, 174, 96, 0.3);
  margin-bottom: 2rem;
}

.success-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.success-icon {
  font-size: 3rem;
  opacity: 0.9;
}

.success-title {
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.success-message {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.queue-highlight {
  font-weight: 700;
  font-size: 1.5rem;
}

/* Queue Card */
.queue-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: none;
}

.queue-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem;
  border-bottom: 1px solid #e0e6ed;
}

.queue-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.queue-title {
  font-weight: 700;
  color: #2c3e50;
}

.stat-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.queue-body {
  padding: 0;
}

.queue-table-container {
  max-height: 400px;
  overflow-y: auto;
}

.queue-table {
  width: 100%;
  border-collapse: collapse;
}

.queue-table th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e0e6ed;
  position: sticky;
  top: 0;
  z-index: 10;
}

.queue-table td {
  padding: 1rem;
  border-bottom: 1px solid #e0e6ed;
  vertical-align: middle;
}

.patient-row:hover {
  background: #f8f9fa;
}

.queue-badge-custom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-weight: 700;
  font-size: 0.875rem;
}

.patient-name {
  font-weight: 600;
  color: #2c3e50;
}

.patient-id {
  color: #7f8c8d;
  font-family: monospace;
}

.symptoms-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.symptom-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-waiting {
  background: #fff3cd;
  color: #856404;
}

.empty-state {
  padding: 3rem;
  color: #95a5a6;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

/* Alert Styles */
.alert-custom {
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.alert-danger-custom {
  background: #fee;
  color: #c0392b;
  border: 1px solid #f5c6cb;
}

/* Responsive Design */
@media (max-width: 767.98px) {
  .sidebar {
    position: relative;
    height: auto;
    padding: 0;
  }
  
  main {
    margin-left: 0;
  }
  
  .header-section {
    margin: -1rem -1rem 2rem -1rem;
    padding: 1.5rem 1rem;
  }
  
  .main-title {
    font-size: 1.5rem;
  }
  
  .success-content {
    flex-direction: column;
    text-align: center;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .symptoms-grid {
    grid-template-columns: 1fr;
  }
  
  .queue-table {
    font-size: 0.875rem;
  }
  
  .queue-table th,
  .queue-table td {
    padding: 0.75rem 0.5rem;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.registration-card,
.queue-card,
.success-card {
  animation: fadeIn 0.6s ease-out;
}

/* Profile Section Styles */
.profile-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: none;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-avatar {
  font-size: 4rem;
  opacity: 0.9;
}

.profile-name {
  font-weight: 700;
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.profile-subtitle {
  opacity: 0.9;
  margin-bottom: 0;
}

.profile-body {
  padding: 2rem;
}

.info-section {
  margin-bottom: 2rem;
}

.section-title {
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border: 1px solid #e0e6ed;
}

.info-label {
  font-weight: 600;
  color: #7f8c8d;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 0.5rem;
}

.info-value {
  color: #2c3e50;
  font-weight: 500;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border-left: 4px solid #3498db;
  display: flex;
  gap: 1.5rem;
}

.history-date {
  font-weight: 600;
  color: #3498db;
  white-space: nowrap;
  min-width: 100px;
}

.history-details h5 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.history-details p {
  color: #7f8c8d;
  margin-bottom: 0;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e6ed;
}

/* Help Section Styles */
.help-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.help-section {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  border: none;
}

.help-title {
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.faq-item {
  border: 1px solid #e0e6ed;
  border-radius: 0.5rem;
  overflow: hidden;
}

.faq-question {
  background: #f8f9fa;
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 1px solid #e0e6ed;
  display: flex;
  align-items: center;
}

.faq-answer {
  padding: 1.5rem;
  color: #7f8c8d;
  line-height: 1.6;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.contact-card {
  background: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #e0e6ed;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.contact-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.contact-info h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.contact-info p {
  color: #7f8c8d;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.contact-detail {
  color: #3498db;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.contact-hours {
  color: #95a5a6;
  font-size: 0.75rem;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.tip-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #e0e6ed;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.tip-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.tip-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
}

.tip-content h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
}

.tip-content p {
  color: #7f8c8d;
  margin-bottom: 0;
  font-size: 0.875rem;
}

/* Responsive adjustments for profile and help sections */
@media (max-width: 767.98px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .history-item {
    flex-direction: column;
  }
  
  .history-date {
    min-width: auto;
  }
  
  .contact-grid {
    grid-template-columns: 1fr;
  }
  
  .tips-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-actions {
    flex-direction: column;
  }
}
</style>
