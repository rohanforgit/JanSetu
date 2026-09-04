import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDatabase, closeDatabase } from '../config/database.js';
import { Issue } from '../models/Issue.js';
import { User } from '../models/User.js';
import { Worker } from '../models/Worker.js';

dotenv.config();

const sampleAuthorityUsers = [
  {
    name: 'Anil Kumar',
    email: 'anil@jansetu.local',
    employeeId: 'AUTH-001',
    passwordRaw: 'Password123!',
    role: 'AUTHORITY',
    department: 'Roads & Infrastructure',
    isActive: true
  },
  {
    name: 'Sunita Rao',
    email: 'sunita@jansetu.local',
    employeeId: 'AUTH-002',
    passwordRaw: 'Password123!',
    role: 'AUTHORITY',
    department: 'Solid Waste Management',
    isActive: true
  }
];

const sampleWorkers = [
  {
    name: 'Ramesh Kumar',
    employeeId: 'worker-004',
    role: 'Senior Road Technician',
    department: 'Roads & Infrastructure',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200&q=80',
    status: 'AVAILABLE',
    isActive: true
  },
  {
    name: 'Suresh Patil',
    employeeId: 'worker-002',
    role: 'Pipe & Hydraulics Lead',
    department: 'Jal Board / Water Works',
    phone: '+91 98112 33445',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    status: 'AVAILABLE',
    isActive: true
  },
  {
    name: 'Amit Solanki',
    employeeId: 'worker-003',
    role: 'Sanitation Lead',
    department: 'Solid Waste Management',
    phone: '+91 99887 76655',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    status: 'AVAILABLE',
    isActive: true
  }
];

const sampleIssues = [
  {
    issueId: 'JAN-2026-1042',
    title: 'Open pothole near university gate',
    description: 'Large dangerous pothole on main thoroughfare near University Gate 2 creating severe safety risk for two-wheelers and cyclists.',
    category: 'Road Damage',
    department: 'Roads & Infrastructure',
    severity: 'HIGH',
    priority: 91,
    status: 'REPORTED',
    location: {
      latitude: 28.5355,
      longitude: 77.3910,
      area: 'University Road',
      landmark: 'Gate 2 entrance'
    },
    evidence: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80', caption: 'Pothole near university gate' }
    ],
    reporter: { userId: 'user-001' },
    supporters: 17,
    volunteers: 3,
    timeline: [
      { status: 'REPORTED', title: 'Reported by Citizen', time: 'Aug 22, 08:30 AM', description: 'Report submitted with photo evidence.' },
      { status: 'VERIFIED', title: 'AI Civic Intelligence Verified', time: 'Aug 22, 08:31 AM', description: 'Categorized under Roads & Infrastructure. Priority score 91 calculated.' }
    ]
  },
  {
    issueId: 'JAN-2026-1043',
    title: 'Major water supply leakage on Green Park Rd',
    description: 'Main supply pipeline burst wasting clean water and flooding pedestrian sidewalk. Urgent valve shutoff required.',
    category: 'Water Leakage',
    department: 'Jal Board / Water Works',
    severity: 'CRITICAL',
    priority: 98,
    status: 'REPORTED',
    location: {
      latitude: 28.5401,
      longitude: 77.3850,
      area: 'Green Park Main Rd',
      landmark: 'Block B Market'
    },
    evidence: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80', caption: 'Water pipe leak' }
    ],
    reporter: { userId: 'user-002' },
    supporters: 28,
    volunteers: 5,
    timeline: [
      { status: 'REPORTED', title: 'Reported by Citizen', time: 'Aug 22, 11:00 AM', description: 'High volume leak reported.' },
      { status: 'VERIFIED', title: 'AI Civic Intelligence Verified', time: 'Aug 22, 11:01 AM', description: 'Auto-escalated to Critical priority.' }
    ]
  }
];

export const seedDatabase = async () => {
  await connectDatabase();
  console.log('[SEED] Seeding database with authority users, workers, and sample issues...');

  // Seed Authority Users
  for (const user of sampleAuthorityUsers) {
    const passwordHash = await bcrypt.hash(user.passwordRaw, 10);
    await User.findOneAndUpdate(
      { email: user.email },
      {
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        passwordHash,
        role: user.role,
        department: user.department,
        isActive: user.isActive
      },
      { upsert: true, returnDocument: 'after' }
    );
  }

  // Seed Workers in Worker collection & User collection
  for (const worker of sampleWorkers) {
    await Worker.findOneAndUpdate(
      { employeeId: worker.employeeId },
      worker,
      { upsert: true, returnDocument: 'after' }
    );

    const workerEmail = `${worker.name.toLowerCase().split(' ')[0]}@jansetu.local`;
    const passwordHash = await bcrypt.hash('Password123!', 10);
    await User.findOneAndUpdate(
      { employeeId: worker.employeeId },
      {
        name: worker.name,
        email: workerEmail,
        employeeId: worker.employeeId,
        passwordHash,
        role: 'WORKER',
        department: worker.department,
        availabilityStatus: worker.status || 'AVAILABLE',
        isActive: true
      },
      { upsert: true, returnDocument: 'after' }
    );
  }

  // Seed sample issue JAN-2026-1042 assigned to Ramesh Kumar worker-004
  const sampleIssuesWithAssignment = sampleIssues.map((issue) => {
    if (issue.issueId === 'JAN-2026-1042') {
      return {
        ...issue,
        status: 'ASSIGNED',
        assignedWorker: {
          id: 'worker-004',
          name: 'Ramesh Kumar',
          role: 'Senior Road Technician',
          phone: '+91 98765 43210',
          avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200&q=80'
        },
        timeline: [
          ...issue.timeline,
          {
            status: 'ASSIGNED',
            title: 'Assigned to Ramesh Kumar',
            time: 'Aug 22, 08:43 AM',
            description: 'Dispatched to Senior Road Technician (Roads & Infrastructure) by Officer Anil Kumar.'
          }
        ]
      };
    }
    return issue;
  });

  // Seed Issues
  for (const issueData of sampleIssuesWithAssignment) {
    await Issue.findOneAndUpdate(
      { issueId: issueData.issueId },
      issueData,
      { upsert: true, returnDocument: 'after' }
    );
  }

  // Seed Initial Notifications
  const { Notification } = await import('../models/Notification.js');
  const anilUser = await User.findOne({ email: 'anil@jansetu.local' });
  const workerUser = await User.findOne({ employeeId: 'worker-004' });

  if (anilUser) {
    await Notification.findOneAndUpdate(
      { recipientId: anilUser._id.toString(), deduplicationKey: 'SEED_AUTH_01' },
      {
        recipientId: anilUser._id.toString(),
        type: 'ISSUE_REPORTED',
        title: 'New Civic Issue Reported',
        message: 'New issue "Open pothole near university gate" reported in Sector 14.',
        issueId: 'JAN-2026-1042',
        actorId: 'system',
        priority: 'HIGH',
        isRead: false,
        deduplicationKey: 'SEED_AUTH_01'
      },
      { upsert: true }
    );

    await Notification.findOneAndUpdate(
      { recipientId: anilUser._id.toString(), deduplicationKey: 'SEED_AUTH_02' },
      {
        recipientId: anilUser._id.toString(),
        type: 'VOLUNTEER_REGISTERED',
        title: 'Community Volunteer Interest',
        message: '3 citizens volunteered to help with "Open pothole near university gate".',
        issueId: 'JAN-2026-1042',
        actorId: 'community',
        priority: 'NORMAL',
        isRead: false,
        deduplicationKey: 'SEED_AUTH_02'
      },
      { upsert: true }
    );
  }

  if (workerUser) {
    await Notification.findOneAndUpdate(
      { recipientId: workerUser._id.toString(), deduplicationKey: 'SEED_WORKER_01' },
      {
        recipientId: workerUser._id.toString(),
        type: 'WORKER_ASSIGNED',
        title: 'New Field Task Assigned',
        message: 'You have been assigned to task "Open pothole near university gate".',
        issueId: 'JAN-2026-1042',
        actorId: 'authority',
        priority: 'HIGH',
        isRead: false,
        deduplicationKey: 'SEED_WORKER_01'
      },
      { upsert: true }
    );
  }

  console.log(`[SEED] Database seeded successfully!`);
  console.log(`[SEED] Authority user: anil@jansetu.local / Password123!`);
  console.log(`[SEED] Worker user: worker-004 (or ramesh@jansetu.local) / Password123!`);
  await closeDatabase();
};

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[SEED ERROR]', err);
      process.exit(1);
    });
}
