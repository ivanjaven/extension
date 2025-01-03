// Constants for the current year and the start year
const CURRENT_YEAR = new Date().getFullYear()
const START_YEAR = 1900

// Exporting the registration configuration object
export const REGISTRATION_CONFIG = {
  // Registration steps
  steps: [
    {
      id: 1,
      name: 'Personal Details',
      title: 'Provide Your Residential Details',
      subtitle: 'Let`s start with your personal details',
    },
    {
      id: 2,
      name: 'Verification Details',
      title: 'How Can We Identify You?',
      subtitle: 'Let`s capture your Photo and Fingerprint',
    },
    {
      id: 3,
      name: 'Review & Submit',
      title: 'Almost There!',
      subtitle: 'Review your information before submitting',
    },
  ],

  // Required fields for each step
  requiredFields: {
    1: [
      'surname',
      'name',
      'day',
      'month',
      'year',
      'gender',
      'status',
      'username',
      'password',
      'street',
      'houseNumber',
      'occupation',
      'nationality',
      'religion',
      'benefits',
    ],
    2: ['image_base64'],
    3: [],
  },

  // Success messages
  successMessages: {
    title: 'Congratulations 🎉',
    subtitle: 'You have completed your registration',
  },

  // Error messages for validation
  errorMessages: {
    surname:
      'Please enter your surname (family name). This is a required field.',
    name: 'Please enter your given name. This is a required field.',
    day: 'Please select your complete date of birth. All parts (day, month, and year) are required.',
    month:
      'Please select your complete date of birth. All parts (day, month, and year) are required.',
    year: 'Please select your complete date of birth. All parts (day, month, and year) are required.',
    gender:
      'Please select your gender from the provided options. This information is required.',
    status:
      'Please indicate your marital status. This information is necessary for our records.',
    username: 
      'Please enter a username. This field is required for account creation.',
    password: 
      'Please enter a password. This field is required to secure your account.',
    street:
      'Please select your street from the dropdown list. This is part of your required address information.',
    houseNumber:
      'Please enter your house or apartment number. This completes your address information.',
    occupation:
      'Please select your current occupation from the list. This information is required for our records.',
    nationality:
      'Please select your nationality. This is a required piece of information for our database.',
    religion:
      'Please select your religion or belief system. While personal, this information is required for our records.',
    benefits:
      'Please select any applicable benefits. If none apply, please choose "None" from the list. This field is required.',
    image_base64:
      'Please upload an image for verification. This is required for identity confirmation.',
    fingerprint_fmd:
      'Please provide fingerprint data for verification. This is required for identity confirmation.',
  },

  // Dropdown options for various fields
  dropdownOptions: {
    day: Array.from({ length: 31 }, (_, i) => ({
      id: (i + 1).toString().padStart(2, '0'),
      type: (i + 1).toString(),
    })),
    month: [
      { id: '01', type: 'Jan' },
      { id: '02', type: 'Feb' },
      { id: '03', type: 'Mar' },
      { id: '04', type: 'Apr' },
      { id: '05', type: 'May' },
      { id: '06', type: 'Jun' },
      { id: '07', type: 'Jul' },
      { id: '08', type: 'Aug' },
      { id: '09', type: 'Sep' },
      { id: '10', type: 'Oct' },
      { id: '11', type: 'Nov' },
      { id: '12', type: 'Dec' },
    ],
    year: Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, i) => {
      const year = (START_YEAR + i).toString()
      return { id: year, type: year }
    }).reverse(),
    gender: [
      { id: 'Male', type: 'Male' },
      { id: 'Female', type: 'Female' },
      { id: 'Other', type: 'Other' },
    ],
    status: [
      { id: 'Single', type: 'Single' },
      { id: 'Married', type: 'Married' },
      { id: 'Divorced', type: 'Divorced' },
      { id: 'Widowed', type: 'Widowed' },
    ],
  },

  // Verification Details configuration
  verificationDetails: {
    facialPhoto: {
      title: 'Facial Photo',
      subtitle: 'Take a clear photo of your face',
      instructions: [
        'Ensure good lighting',
        'Face the camera directly',
        'Remove glasses or hats',
      ],
    },
    fingerprint: {
      title: 'Fingerprint',
      subtitle: 'Capture your fingerprint',
      instructions: [
        'Clean your fingertip',
        'Place finger flat on the sensor',
        'Hold still until capture is complete',
      ],
    },
    faceRecognition: {
      title: 'Face Recognition',
      subtitle: 'Complete face verification scan',
      instructions: [
        'Ensure good lighting',
        'Face the camera directly',
        'Remove glasses or hats',
      ]
    }
  },
}
