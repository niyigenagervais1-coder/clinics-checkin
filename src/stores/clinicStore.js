import { defineStore } from 'pinia'

export const useClinicStore = defineStore('clinic', {
  state: () => ({
    // State Variables for queue management
    queueNumber: 1,
    isRegistered: false,
    
    // Array for patient list storage
    patients: [],
    
    // Navigation menu array
    navigationItems: [
      { id: 1, name: 'Check-in', icon: 'clipboard-check', active: true },
      { id: 2, name: 'My Profile', icon: 'person', active: false },
      { id: 3, name: 'Help', icon: 'question-circle', active: false }
    ],
    
    // Available symptoms array
    availableSymptoms: [
      'Fever',
      'Cough',
      'Headache',
      'Fatigue',
      'Nausea',
      'Dizziness',
      'Chest Pain',
      'Shortness of Breath'
    ]
  }),
  
  getters: {
    // Get current patient count
    patientCount: (state) => state.patients.length,
    
    // Get current queue number
    currentQueueNumber: (state) => state.queueNumber,
    
    // Get patients in queue
    patientsInQueue: (state) => state.patients.filter(patient => patient.status === 'waiting')
  },
  
  actions: {
    // State Mutation: Add new patient to array
    addPatient(patientData) {
      const newPatient = {
        id: Date.now(),
        queueNumber: this.queueNumber,
        name: patientData.name,
        nationalID: patientData.nationalID,
        symptoms: patientData.symptoms,
        checkInTime: new Date().toLocaleString(),
        status: 'waiting'
      }
      
      // Push new patient data into the array
      this.patients.push(newPatient)
      
      // Increment the queue counter
      this.queueNumber++
      
      // Set registration status
      this.isRegistered = true
      
      return newPatient
    },
    
    // Clear registration status
    clearRegistration() {
      this.isRegistered = false
    },
    
    // Update navigation active state
    setActiveNavigation(itemId) {
      this.navigationItems.forEach(item => {
        item.active = item.id === itemId
      })
    },
    
    // Initialize clinic environment (lifecycle method equivalent)
    initializeClinic() {
      // Load any existing session data from local storage
      const savedData = localStorage.getItem('clinicData')
      if (savedData) {
        const data = JSON.parse(savedData)
        this.patients = data.patients || []
        this.queueNumber = data.queueNumber || 1
      }
    },
    
    // Save session data to local storage
    saveSessionData() {
      const sessionData = {
        patients: this.patients,
        queueNumber: this.queueNumber
      }
      localStorage.setItem('clinicData', JSON.stringify(sessionData))
    }
  }
})
