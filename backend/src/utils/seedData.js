import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Worker } from '../models/Worker.js';
import { Issue } from '../models/Issue.js';

export const seedInitialData = async () => {
  try {
    const existingOfficers = await User.countDocuments({ role: 'AUTHORITY' });
    const existingWorkers = await Worker.countDocuments();

    const firePasswordHash = await bcrypt.hash('FireOfficer@123', 10);
    const powerPasswordHash = await bcrypt.hash('PowerOfficer@123', 10);
    const roadsPasswordHash = await bcrypt.hash('RoadsOfficer@123', 10);
    const wastePasswordHash = await bcrypt.hash('WasteOfficer@123', 10);
    const waterPasswordHash = await bcrypt.hash('WaterOfficer@123', 10);
    const trafficPasswordHash = await bcrypt.hash('TrafficOfficer@123', 10);
    const chiefPasswordHash = await bcrypt.hash('ChiefOfficer@123', 10);
    const defaultWorkerPassHash = await bcrypt.hash('Worker@123', 10);

    // Seed Officers only if no officer accounts exist
    if (existingOfficers === 0) {
      await User.create([
        {
          name: 'Ketan Patel (Fire Officer)',
          email: 'fire.officer@jansetu.gov.in',
          employeeId: 'AUTH-FIRE-01',
          passwordHash: firePasswordHash,
          role: 'AUTHORITY',
          department: 'Fire & Emergency Services',
          isActive: true
        },
        {
          name: 'Rajesh Varma (Electricity Officer)',
          email: 'power.officer@jansetu.gov.in',
          employeeId: 'AUTH-POWER-01',
          passwordHash: powerPasswordHash,
          role: 'AUTHORITY',
          department: 'Electricity & Power Board',
          isActive: true
        },
        {
          name: 'Anil Kumar (Roads Officer)',
          email: 'roads.officer@jansetu.gov.in',
          employeeId: 'AUTH-ROADS-01',
          passwordHash: roadsPasswordHash,
          role: 'AUTHORITY',
          department: 'Roads & Infrastructure',
          isActive: true
        },
        {
          name: 'Sunita Rao (Sanitation Officer)',
          email: 'waste.officer@jansetu.gov.in',
          employeeId: 'AUTH-WASTE-01',
          passwordHash: wastePasswordHash,
          role: 'AUTHORITY',
          department: 'Solid Waste Management',
          isActive: true
        },
        {
          name: 'Suresh Patil (Jal Board Officer)',
          email: 'water.officer@jansetu.gov.in',
          employeeId: 'AUTH-WATER-01',
          passwordHash: waterPasswordHash,
          role: 'AUTHORITY',
          department: 'Jal Board / Water Works',
          isActive: true
        },
        {
          name: 'Vikramaditya Sharma (Traffic Officer)',
          email: 'traffic.officer@jansetu.gov.in',
          employeeId: 'AUTH-TRAFFIC-01',
          passwordHash: trafficPasswordHash,
          role: 'AUTHORITY',
          department: 'Traffic & Transport',
          isActive: true
        },
        {
          name: 'Dr. Rameshwar Rao (Chief Municipal Commissioner)',
          email: 'chief.officer@jansetu.gov.in',
          employeeId: 'AUTH-HQ-01',
          passwordHash: chiefPasswordHash,
          role: 'AUTHORITY',
          department: 'Chief Municipal Governance HQ',
          isActive: true
        }
      ]);
    }

    // Initial Department Technicians Data
    const initialWorkers = [
      { name: 'Vikram Singh', employeeId: 'EMP-FIR-101', department: 'Fire & Emergency Services', role: 'Firefighter', skill: 'Fire Suppression & Rescue', phone: '9876543201' },
      { name: 'Rahul Sharma', employeeId: 'EMP-FIR-102', department: 'Fire & Emergency Services', role: 'Emergency Response Officer', skill: 'Hazmat & Evacuation', phone: '9876543202' },
      
      { name: 'Arjun Rao', employeeId: 'EMP-ELE-101', department: 'Electricity & Power Board', role: 'Electrical Technician', skill: 'Transformers & Substations', phone: '9876543203' },
      { name: 'Vivek Kumar', employeeId: 'EMP-ELE-102', department: 'Electricity & Power Board', role: 'Line Technician', skill: 'High Voltage Lines', phone: '9876543204' },

      { name: 'Anil Kumar', employeeId: 'EMP-ROA-101', department: 'Roads & Infrastructure', role: 'Road Maintenance Technician', skill: 'Pothole & Asphalt Repair', phone: '9876543205' },
      { name: 'Ramesh Verma', employeeId: 'EMP-ROA-102', department: 'Roads & Infrastructure', role: 'Civil Technician', skill: 'Structural Inspections', phone: '9876543206' },

      { name: 'Ramesh Singh', employeeId: 'EMP-WAS-101', department: 'Solid Waste Management', role: 'Sanitation Supervisor', skill: 'Waste Disposal & Bins', phone: '9876543207' },
      { name: 'Sunil Dutt', employeeId: 'EMP-WAS-102', department: 'Solid Waste Management', role: 'Sanitation Worker', skill: 'Disinfection & Hygiene', phone: '9876543208' },

      { name: 'Suresh Verma', employeeId: 'EMP-WAT-101', department: 'Jal Board / Water Works', role: 'Water Pipeline Technician', skill: 'Burst Pipe Repairs', phone: '9876543209' },
      { name: 'Mahesh Babu', employeeId: 'EMP-WAT-102', department: 'Jal Board / Water Works', role: 'Drainage Specialist', skill: 'Sewer Blockages', phone: '9876543210' },

      { name: 'Ravi Kumar', employeeId: 'EMP-TRA-101', department: 'Traffic & Transport', role: 'Traffic Constable', skill: 'Traffic Signals & Controls', phone: '9876543211' },
      { name: 'Suresh Rao', employeeId: 'EMP-TRA-102', department: 'Traffic & Transport', role: 'Traffic Enforcement Officer', skill: 'Road Safety & Intersections', phone: '9876543212' }
    ];

    // Seed default workers only if no workers exist in DB
    if (existingWorkers === 0) {
      await Worker.create(
        initialWorkers.map((w) => ({
          ...w,
          status: 'AVAILABLE',
          civicScore: 90,
          isActive: true
        }))
      );

      await User.create(
        initialWorkers.map((w) => ({
          name: w.name,
          email: `${w.employeeId.toLowerCase()}@jansetu.local`,
          employeeId: w.employeeId,
          passwordHash: defaultWorkerPassHash,
          role: 'WORKER',
          department: w.department,
          isActive: true
        }))
      );
    }

    console.log('[SEED DATA] Auto-seeding check completed.');
  } catch (err) {
    console.error('[SEED DATA ERROR]', err.message);
  }
};
