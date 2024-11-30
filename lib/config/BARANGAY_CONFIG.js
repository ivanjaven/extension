export const BarangayConfig = {
  // Default settings for the barangay
  defaultSettings: {
    logoUrl: '/assets/images/logo.png',
    name: 'Sauyo',
  },

  // User roles and their associated quick access features
  userRoles: {
    // Configuration for the 'admin' role
    admin: {
      quickAccessFeatures: [
        {
          title: 'Resident Registration',
          description:
            'Guidelines and procedures for registering residents in the barangay.',
          imageUrl: '/assets/images/registration.png',
          linkUrl: '/resident/registration',
        },
        {
          title: 'Document Processing',
          description:
            'Instructions on obtaining and processing various barangay documents.',
          imageUrl: '/assets/images/records.png',
          linkUrl: '/documents',
        },
        {
          title: 'Population Records',
          description:
            'Maintaining and updating the population records of the barangay.',
          imageUrl: '/assets/images/folders.png',
          linkUrl: 'population-records',
        },
      ],
    },
  },
}
