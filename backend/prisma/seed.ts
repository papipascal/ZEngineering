import 'dotenv/config';
import { PrismaClient, EquipmentCategory, Discipline, DocRegisterStatus, TransmittalPurpose } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // ==========================================
  // Users
  // ==========================================
  const admin = await prisma.user.upsert({
    where: { email: 'admin@zengineering.local' },
    update: { password: hashedPassword, discipline: Discipline.PROCESS },
    create: {
      email: 'admin@zengineering.local',
      name: 'Admin Zen',
      password: hashedPassword,
      role: 'admin',
      discipline: Discipline.PROCESS,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'chef.projet@zengineering.local' },
    update: { password: hashedPassword, discipline: Discipline.PIPING },
    create: {
      email: 'chef.projet@zengineering.local',
      name: 'Marie Dupont',
      password: hashedPassword,
      role: 'manager',
      discipline: Discipline.PIPING,
    },
  });

  const reviewer = await prisma.user.upsert({
    where: { email: 'ingenieur@zengineering.local' },
    update: { password: hashedPassword, discipline: Discipline.MECHANICAL },
    create: {
      email: 'ingenieur@zengineering.local',
      name: 'Jean Martin',
      password: hashedPassword,
      role: 'member',
      discipline: Discipline.MECHANICAL,
    },
  });

  console.log(`Created users: ${admin.name}, ${manager.name}, ${reviewer.name}`);

  // ==========================================
  // Project (upsert for idempotency)
  // ==========================================
  let project = await prisma.project.findFirst({
    where: { name: 'Mon Chemical Plant - Unit U_A' },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'Mon Chemical Plant - Unit U_A',
        description: 'New Package for chemical plant - Project MY_ONE, Client 1',
        status: 'active',
        clientName: 'Alphahexol Industries',
        clientContact: 'john.smith@alphahexol.com',
        projectEmail: 'ua-unit@zengineering.local',
        members: {
          create: [
            { userId: admin.id, role: 'owner' },
            { userId: manager.id, role: 'manager' },
            { userId: reviewer.id, role: 'member' },
          ],
        },
      },
    });
    console.log(`Created project: ${project.name}`);
  } else {
    // Update existing project with client info if missing
    if (!project.clientName || !project.projectEmail) {
      project = await prisma.project.update({
        where: { id: project.id },
        data: {
          clientName: project.clientName || 'Alphahexol Industries',
          clientContact: project.clientContact || 'john.smith@alphahexol.com',
          projectEmail: project.projectEmail || 'ua-unit@zengineering.local',
        },
      });
    }
    console.log(`Project already exists: ${project.name}`);
  }

  // ==========================================
  // Workflow Definitions
  // ==========================================

  // Simple 2-step approval workflow (user request)
  const simpleApproval = await prisma.workflowDefinition.upsert({
    where: { name: 'Simple Approval' },
    update: {},
    create: {
      name: 'Simple Approval',
      description:
        'Simple 2-step workflow: Step 1 - responsible executes the task, Step 2 - project manager approves.',
      steps: [
        { name: 'Execution', order: 0, type: 'manual', assigneeRole: 'member' },
        { name: 'Manager Approval', order: 1, type: 'manual', assigneeRole: 'manager' },
      ],
      transitions: [
        { from: 0, to: 1, condition: 'complete' },
      ],
    },
  });
  console.log(`Created definition: ${simpleApproval.name}`);

  // Document validation (existing)
  const docValidation = await prisma.workflowDefinition.upsert({
    where: { name: 'Validation de document' },
    update: {},
    create: {
      name: 'Validation de document',
      description:
        'Processus standard de validation de document technique en 3 etapes: soumission, revue technique, approbation finale.',
      steps: [
        { name: 'Soumission', order: 0, type: 'manual', assigneeRole: 'member' },
        { name: 'Revue technique', order: 1, type: 'manual', assigneeRole: 'member' },
        { name: 'Approbation finale', order: 2, type: 'manual', assigneeRole: 'manager' },
      ],
      transitions: [
        { from: 0, to: 1, condition: 'approve' },
        { from: 1, to: 2, condition: 'approve' },
      ],
    },
  });
  console.log(`Created definition: ${docValidation.name}`);

  // Purchase approval (existing)
  const purchaseApproval = await prisma.workflowDefinition.upsert({
    where: { name: 'Approbation achat' },
    update: {},
    create: {
      name: 'Approbation achat',
      description:
        "Circuit d'approbation des commandes: demande, verification budget, approbation manager, finalisation.",
      steps: [
        { name: 'Demande achat', order: 0, type: 'manual', assigneeRole: 'member' },
        { name: 'Verification budget', order: 1, type: 'manual', assigneeRole: 'manager' },
        { name: 'Approbation direction', order: 2, type: 'manual', assigneeRole: 'admin' },
        { name: 'Finalisation commande', order: 3, type: 'manual', assigneeRole: 'member' },
      ],
      transitions: [
        { from: 0, to: 1, condition: 'approve' },
        { from: 1, to: 2, condition: 'approve' },
        { from: 2, to: 3, condition: 'approve' },
      ],
    },
  });
  console.log(`Created definition: ${purchaseApproval.name}`);

  // Start a sample workflow instance using Simple Approval
  const existingInstance = await prisma.workflowInstance.findFirst({
    where: { definitionId: simpleApproval.id, projectId: project.id },
  });

  if (!existingInstance) {
    const instance = await prisma.workflowInstance.create({
      data: {
        definitionId: simpleApproval.id,
        projectId: project.id,
        status: 'running',
        currentStepIdx: 0,
        context: { subject: 'Review pump 125-PR-601 datasheet', type: 'equipment_review' },
        steps: {
          create: [
            {
              name: 'Execution',
              order: 0,
              status: 'active',
              assigneeId: reviewer.id,
              startedAt: new Date(),
            },
            {
              name: 'Manager Approval',
              order: 1,
              status: 'pending',
              assigneeId: manager.id,
            },
          ],
        },
      },
    });
    console.log(`Started sample workflow instance: ${instance.id}`);
  }

  // ==========================================
  // Equipment (from Equipment List_Rev0.xlsx)
  // ==========================================

  const equipmentData: Array<{
    tagNumber: string;
    service: string;
    category: EquipmentCategory;
    subType: string;
    quantity: number;
    material?: string;
    operatingPressure?: number;
    operatingTemperature?: number;
    designPressure?: number;
    designTemperature?: number;
    notes?: string;
  }> = [
    // --- VESSELS ---
    {
      tagNumber: '125-VV-601',
      service: 'Blowdown Drum',
      category: EquipmentCategory.VESSEL,
      subType: 'drum',
      quantity: 1,
      material: 'CS + 3 mm CA',
      operatingPressure: 0,
      operatingTemperature: 100,
      designPressure: 3.5,
      designTemperature: 120,
      notes: 'Vertical, elliptical heads',
    },
    {
      tagNumber: '125-NF-601 A',
      service: 'Alphahexol Spent Catalyst and Waxes Filter A',
      category: EquipmentCategory.VESSEL,
      subType: 'filter',
      quantity: 1,
      material: 'Shell: CS + 3mm CA, Internals: SS 304L',
      operatingPressure: 3,
      operatingTemperature: 235,
      designPressure: 5.5,
      designTemperature: 250,
      notes: 'Horizontal, elliptical heads. Metal Cartridge type.',
    },
    {
      tagNumber: '125-NF-601 B',
      service: 'Alphahexol Spent Catalyst and Waxes Filter B',
      category: EquipmentCategory.VESSEL,
      subType: 'filter',
      quantity: 1,
      material: 'Shell: CS + 3mm CA, Internals: SS 304L',
      operatingPressure: 3,
      operatingTemperature: 235,
      designPressure: 5.5,
      designTemperature: 250,
      notes: 'Horizontal, elliptical heads. Metal Cartridge type.',
    },
    {
      tagNumber: '125-VV-405',
      service: 'Waxes Storage Drum',
      category: EquipmentCategory.VESSEL,
      subType: 'drum',
      quantity: 1,
      material: 'CS + 3 mm CA',
      operatingPressure: 3,
      operatingTemperature: 200,
      designPressure: 5,
      designTemperature: 225,
      notes: 'Horizontal, elliptical heads',
    },

    // --- HEAT EXCHANGERS ---
    {
      tagNumber: '125-HE-601',
      service: 'Alphahexol Spent Catalyst and Waxes Heater',
      category: EquipmentCategory.HEAT_EXCHANGER,
      subType: 'heater',
      quantity: 1,
      material: 'Shell: CS + 3mm CA, Tubes: CS + 3mm CA',
      operatingPressure: 37,
      operatingTemperature: 247,
      designPressure: 40,
      designTemperature: 280,
      notes: 'Hair Pin Heat Exchanger. Duty: 37.0 kW.',
    },
    {
      tagNumber: '125-XA-602',
      service: 'Waste Heat Recovery Package',
      category: EquipmentCategory.HEAT_EXCHANGER,
      subType: 'waste_heat_recovery',
      quantity: 1,
      material: 'Shell: CS + 3mm CA, Tubes: CS / 1.25 Cr',
      operatingPressure: 0,
      operatingTemperature: 950,
      designPressure: 1,
      designTemperature: 350,
      notes: 'WHB convective type, horizontal, including steam superheater, evaporator, economizer, steam drum. Weight: 6000 kg.',
    },

    // --- ROTATING MACHINES ---
    {
      tagNumber: '125-PR-601 A',
      service: 'Alphahexol Spent Catalyst and Waxes Feed Loop Pump A',
      category: EquipmentCategory.ROTATING_MACHINE,
      subType: 'pump',
      quantity: 1,
      material: 'Casing: SS, Gear: SS',
      operatingPressure: 2.9,
      operatingTemperature: 235,
      designPressure: 15.1,
      notes: 'Gear pump type. Reciprocating. 2.0 m3/h. 2.1 kW. Electrical drive.',
    },
    {
      tagNumber: '125-PR-601 B',
      service: 'Alphahexol Spent Catalyst and Waxes Feed Loop Pump B',
      category: EquipmentCategory.ROTATING_MACHINE,
      subType: 'pump',
      quantity: 1,
      material: 'Casing: SS, Gear: SS',
      operatingPressure: 2.9,
      operatingTemperature: 235,
      designPressure: 15.1,
      notes: 'Gear pump type. Reciprocating. 2.0 m3/h. 2.1 kW. Electrical drive.',
    },
    {
      tagNumber: '125-PR-602 A',
      service: 'Recirculation Pump A',
      category: EquipmentCategory.ROTATING_MACHINE,
      subType: 'pump',
      quantity: 1,
      material: 'Casing: SS, Impeller: SS',
      operatingPressure: 0.5,
      operatingTemperature: 70,
      designPressure: 3.0,
      notes: 'Centrifugal. 70.0 m3/h. 5.4 kW. Electrical drive.',
    },
    {
      tagNumber: '125-PR-602 B',
      service: 'Recirculation Pump B',
      category: EquipmentCategory.ROTATING_MACHINE,
      subType: 'pump',
      quantity: 1,
      material: 'Casing: SS, Impeller: SS',
      operatingPressure: 0.5,
      operatingTemperature: 70,
      designPressure: 3.0,
      notes: 'Centrifugal. 70.0 m3/h. 5.4 kW. Electrical drive.',
    },
    {
      tagNumber: '125-KB-601 A',
      service: 'Air Blower A',
      category: EquipmentCategory.ROTATING_MACHINE,
      subType: 'blower',
      quantity: 1,
      material: 'Casing: CS, Impeller: SS',
      operatingTemperature: 25,
      notes: 'Centrifugal. 13500 Nm3/h. 61 kW. Electrical drive. Control by VFD.',
    },
    {
      tagNumber: '125-KB-601 B',
      service: 'Air Blower B',
      category: EquipmentCategory.ROTATING_MACHINE,
      subType: 'blower',
      quantity: 1,
      material: 'Casing: CS, Impeller: SS',
      operatingTemperature: 25,
      notes: 'Centrifugal. 13500 Nm3/h. 61 kW. Electrical drive. Control by VFD.',
    },
    {
      tagNumber: '125-KB-602 A',
      service: 'Recirculation Fan A',
      category: EquipmentCategory.ROTATING_MACHINE,
      subType: 'fan',
      quantity: 1,
      material: 'Casing: CS, Impeller: SS',
      operatingTemperature: 66,
      notes: 'Centrifugal. 2290 Nm3/h. 30.5 kW. Electrical drive. Control by VFD.',
    },
    {
      tagNumber: '125-KB-602 B',
      service: 'Recirculation Fan B',
      category: EquipmentCategory.ROTATING_MACHINE,
      subType: 'fan',
      quantity: 1,
      material: 'Casing: CS, Impeller: SS',
      operatingTemperature: 66,
      notes: 'Centrifugal. 2290 Nm3/h. 30.5 kW. Electrical drive. Control by VFD.',
    },
    {
      tagNumber: '125-KB-603 A',
      service: 'Flue Gas Blower A',
      category: EquipmentCategory.ROTATING_MACHINE,
      subType: 'blower',
      quantity: 1,
      material: 'Casing: CS, Impeller: SS',
      operatingTemperature: 66,
      notes: 'Centrifugal. 16200 Nm3/h. 140.4 kW. Electrical drive. Control by VFD.',
    },
    {
      tagNumber: '125-KB-603 B',
      service: 'Flue Gas Blower B',
      category: EquipmentCategory.ROTATING_MACHINE,
      subType: 'blower',
      quantity: 1,
      material: 'Casing: CS, Impeller: SS',
      operatingTemperature: 66,
      notes: 'Centrifugal. 16200 Nm3/h. 140.4 kW. Electrical drive. Control by VFD.',
    },

    // --- MISCELLANEOUS ---
    {
      tagNumber: '125-XA-609',
      service: 'Incinerator Burner Package',
      category: EquipmentCategory.MISCELLANEOUS,
      subType: 'incinerator',
      quantity: 1,
      material: 'CS',
      operatingPressure: 12,
      operatingTemperature: 90,
      designPressure: 1,
      designTemperature: 170,
      notes: 'Double gun (C8+ and wax) atomization with steam.',
    },
    {
      tagNumber: '125-XA-603',
      service: 'Flue Gas Treatment Package',
      category: EquipmentCategory.MISCELLANEOUS,
      subType: 'flue_gas_treatment',
      quantity: 1,
      notes: 'Includes Venturi (SS, 200/70 deg C) and WESP (SS, Wet electrostatic precipitator upflow, 65-70 deg C).',
    },
    {
      tagNumber: '125-XA-604',
      service: 'Stack',
      category: EquipmentCategory.MISCELLANEOUS,
      subType: 'stack',
      quantity: 1,
      material: 'SS',
      operatingTemperature: 66,
      designTemperature: 200,
      notes: 'Double wall stack. Outer wall (CS) for stack support.',
    },
    {
      tagNumber: '125-XA-605',
      service: 'Waste Water Treatment Package',
      category: EquipmentCategory.MISCELLANEOUS,
      subType: 'water_treatment',
      quantity: 1,
      notes: '2 containerised units: 1st for physico-chemical treatment, 2nd for filter press.',
    },
    {
      tagNumber: '125-XA-606',
      service: 'Urea Injection Package',
      category: EquipmentCategory.MISCELLANEOUS,
      subType: 'injection_package',
      quantity: 1,
      material: 'SS',
      designTemperature: 80,
      notes: 'Storage drum with agitator + 2 dosing injection pumps (1 operating / 1 spare).',
    },
    {
      tagNumber: '125-XA-607',
      service: 'Combustion Chamber',
      category: EquipmentCategory.MISCELLANEOUS,
      subType: 'combustion_chamber',
      quantity: 1,
      material: 'CS + refractory',
      operatingTemperature: 950,
      designPressure: 1,
      designTemperature: 350,
    },
    {
      tagNumber: '125-XA-608',
      service: 'Phosphate Injection Package',
      category: EquipmentCategory.MISCELLANEOUS,
      subType: 'injection_package',
      quantity: 1,
      material: 'SS',
      designTemperature: 80,
      notes: 'Storage drum with agitator + 2 dosing injection pumps (1 operating / 1 spare).',
    },
  ];

  for (const eq of equipmentData) {
    await prisma.equipment.upsert({
      where: { tagNumber: eq.tagNumber },
      update: {},
      create: {
        ...eq,
        projectId: project.id,
      },
    });
  }
  console.log(`Created ${equipmentData.length} equipment items`);

  // ==========================================
  // Vendors (from Vendor List.xlsx)
  // ==========================================

  const vendorData: Array<{ name: string; country?: string; specialties: string[] }> = [
    // Reciprocating Compressors
    { name: 'BORSIG', country: 'Germany', specialties: ['Reciprocating Compressor'] },
    { name: 'HOWDEN BURTIN CORBLON', country: 'France', specialties: ['Reciprocating Compressor'] },
    { name: 'DRESSER RAND (Siemens)', country: 'Germany', specialties: ['Reciprocating Compressor'] },
    { name: 'MAN DWE', country: 'Germany', specialties: ['Reciprocating Compressor'] },
    { name: 'NEUMANN & ESSER', country: 'Brasil', specialties: ['Reciprocating Compressor'] },
    { name: 'SULZER BURCKARDT', specialties: ['Reciprocating Compressor'] },

    // Reciprocating Pumps
    { name: 'MOUVEX', country: 'France', specialties: ['Reciprocating Pumps'] },
    { name: 'MILTON ROY', country: 'USA / France', specialties: ['Reciprocating Pumps', 'Metering / Dosing Pumps'] },
    { name: 'PERONI', country: 'Italy', specialties: ['Reciprocating Pumps', 'Metering / Dosing Pumps'] },
    { name: 'WORTHINGTON (Flowserve)', country: 'France', specialties: ['Reciprocating Pumps'] },
    { name: 'LEWA', country: 'Germany', specialties: ['Reciprocating Pumps', 'Metering / Dosing Pumps'] },
    { name: 'AXFLOW (Bran & Lubbe)', country: 'Germany', specialties: ['Reciprocating Pumps', 'Metering / Dosing Pumps'] },
    { name: 'SEKO', country: 'Italy', specialties: ['Reciprocating Pumps', 'Metering / Dosing Pumps'] },
    { name: 'HAMELMANN', country: 'Germany', specialties: ['Reciprocating Pumps'] },

    // Metering / Dosing Pumps
    { name: 'FLUID CONTROL', country: 'France', specialties: ['Metering / Dosing Pumps'] },
    { name: 'OMG', country: 'Italy', specialties: ['Metering / Dosing Pumps'] },

    // Centrifugal Pumps
    { name: 'ENSIVAL MORET', country: 'France', specialties: ['Centrifugal Pumps'] },
    { name: 'FINDER POMPES', country: 'Italy', specialties: ['Centrifugal Pumps'] },
    { name: 'FLOWSERVE', country: 'Italy', specialties: ['Centrifugal Pumps', 'Ball Valves'] },
    { name: 'SULZER', country: 'France', specialties: ['Centrifugal Pumps'] },
    { name: 'ITT GOULDS', country: 'Worldwide', specialties: ['Centrifugal Pumps'] },
    { name: 'KSB', country: 'France', specialties: ['Centrifugal Pumps', 'Butterfly Valves'] },
    { name: 'RUHRPUMPEN', country: 'Germany', specialties: ['Centrifugal Pumps'] },
    { name: 'SUNDYNE', country: 'France', specialties: ['Centrifugal Pumps'] },
    { name: 'SCHMITT', country: 'Argentina', specialties: ['Centrifugal Pumps'] },

    // Gate, Globe and Check Valves
    { name: 'BFE SPA', country: 'Italy', specialties: ['Gate Globe Check Valves', 'Block And Bleed Valves'] },
    { name: 'CAMERON VALVE', country: 'Italy / USA', specialties: ['Gate Globe Check Valves'] },
    { name: 'GALPERTI ENGINEERING', country: 'Italy', specialties: ['Gate Globe Check Valves', 'Ball Valves', 'Block And Bleed Valves'] },
    { name: 'CRANE STOCKHAM', country: 'UK', specialties: ['Gate Globe Check Valves'] },
    { name: 'CHEROFRANCE', country: 'Italy / France', specialties: ['Gate Globe Check Valves', 'Ball Valves'] },
    { name: 'FASANI (PENTAIR)', country: 'Italy / France', specialties: ['Gate Globe Check Valves'] },
    { name: 'GOODWIN', country: 'UK', specialties: ['Gate Globe Check Valves'] },
    { name: 'KENMAC', country: 'UK', specialties: ['Gate Globe Check Valves', 'Block And Bleed Valves'] },
    { name: 'NEWAY', country: 'China', specialties: ['Gate Globe Check Valves', 'Ball Valves'] },
    { name: 'PENTAIR (TYCO)', country: 'France', specialties: ['Gate Globe Check Valves', 'Ball Valves', 'Block And Bleed Valves', 'Pressure Safety Valves', 'Instrument Manifolds'] },
    { name: 'POYAM VALVES', country: 'Belgium', specialties: ['Gate Globe Check Valves'] },
    { name: 'VALVITALIA / VITAS', country: 'Italy', specialties: ['Gate Globe Check Valves', 'Ball Valves'] },

    // Ball Valves
    { name: 'ABV', country: 'Italy', specialties: ['Ball Valves'] },
    { name: 'COOPER CAMERON', country: 'Italy', specialties: ['Ball Valves'] },
    { name: 'DAFRAM', country: 'Italy', specialties: ['Ball Valves'] },
    { name: 'DARCO', country: 'France', specialties: ['Ball Valves'] },
    { name: 'METSO AUTOMATION', country: 'Finland', specialties: ['Ball Valves', 'Control Valves'] },
    { name: 'OMB', country: 'Italy', specialties: ['Ball Valves', 'Gate Globe Check Valves'] },
    { name: 'PETROLVALVES', country: 'Italy', specialties: ['Ball Valves', 'Control Valves'] },
    { name: 'PERAR', country: 'Italy', specialties: ['Ball Valves'] },
    { name: 'SERN BALL VALVES', country: 'France', specialties: ['Ball Valves'] },

    // Plug Valves
    { name: 'AUDCO', country: 'USA', specialties: ['Plug Valves'] },
    { name: 'AZ ARMATUREN', country: 'Germany', specialties: ['Plug Valves'] },
    { name: 'GALLI & CASSINA', country: 'Italy', specialties: ['Plug Valves'] },
    { name: 'XOMOX', country: 'Germany', specialties: ['Plug Valves'] },

    // Butterfly Valves
    { name: 'BAC VALVES', country: 'UK', specialties: ['Butterfly Valves'] },
    { name: 'KEYSTONE VALVES', country: 'UK', specialties: ['Butterfly Valves'] },
    { name: 'OHL GUTERMUTH', country: 'Germany', specialties: ['Butterfly Valves'] },
    { name: 'ZWICK', country: 'Germany', specialties: ['Butterfly Valves'] },

    // Block And Bleed Valves
    { name: 'DUBLOCK', country: 'UK', specialties: ['Block And Bleed Valves'] },
    { name: 'OLIVER VALVES', country: 'UK', specialties: ['Block And Bleed Valves', 'Instrument Manifolds'] },
    { name: 'HY LOK', country: 'Korea', specialties: ['Ball Valves', 'Block And Bleed Valves', 'Instrument Manifolds'] },

    // Pneumatic Actuators
    { name: 'ACTOR SARASIN', country: 'France', specialties: ['Pneumatic Actuators'] },
    { name: 'BETTIS', country: 'France', specialties: ['Pneumatic Actuators'] },
    { name: 'AIR TORQUE', country: 'Italy', specialties: ['Pneumatic Actuators'] },
    { name: 'BIFFI', country: 'Italy', specialties: ['Pneumatic Actuators'] },
    { name: 'ROTORK (FLUID SYSTEM)', country: 'Italy', specialties: ['Pneumatic Actuators'] },
    { name: 'BERNARD CONTROL', country: 'France', specialties: ['Pneumatic Actuators'] },

    // Control Valves
    { name: 'ABB', country: 'International', specialties: ['Control Valves', 'Pressure And Temperature Transmitters', 'Gas Analyzer', 'Flowmeters', 'Flow Indicators'] },
    { name: 'DRESSER MASONEILAN (GE)', country: 'France', specialties: ['Control Valves', 'Level Transmitter Displacer'] },
    { name: 'EMERSON PROCESS', country: 'International', specialties: ['Control Valves', 'Level Transmitters', 'Pressure And Temperature Transmitters', 'Gas Analyzer', 'Instrument Manifolds', 'Level Transmitter Displacer', 'Level Transmitter Radar'] },
    { name: 'FLOWSERVE (VALTEK)', country: 'France', specialties: ['Control Valves'] },
    { name: 'KOSO', country: 'UK', specialties: ['Control Valves'] },
    { name: 'SAMSON', country: 'France', specialties: ['Control Valves'] },
    { name: 'SART VON ROHR', country: 'France', specialties: ['Control Valves'] },
    { name: 'SEVERN GLOCON', country: 'UK', specialties: ['Control Valves'] },
    { name: 'WEIR VALVES AND CONTROL', country: 'UK', specialties: ['Control Valves'] },

    // Level Gauges
    { name: 'CESARE BONETTI', country: 'Italy', specialties: ['Level Gauge'] },
    { name: 'MAGNETROL', country: 'Belgium', specialties: ['Level Gauge', 'Level Switch', 'Level Transmitter Displacer', 'Level Transmitter Radar'] },
    { name: 'KROHNE', country: 'France', specialties: ['Level Gauge', 'Flowmeters', 'Flow Indicators'] },
    { name: 'VEGA', country: 'France', specialties: ['Level Gauge', 'Level Transmitter Radar'] },
    { name: 'ENDRESS + HAUSER', country: 'International', specialties: ['Level Transmitters', 'Pressure And Temperature Transmitters', 'Gas Analyzer', 'Flowmeters', 'Level Transmitter Radar'] },

    // Pressure And Temperature
    { name: 'WIKA', country: 'India / France', specialties: ['Pressure And Temperature Indicators', 'Level Transmitter Displacer', 'Level Transmitter Radar'] },
    { name: 'NUOVAFIMA', country: 'Italy', specialties: ['Pressure And Temperature Indicators'] },

    // Pressure Safety Valves
    { name: 'LESER', country: 'France', specialties: ['Pressure Safety Valves'] },
    { name: 'FARRIS', country: 'USA / UK', specialties: ['Pressure Safety Valves'] },
    { name: 'WEIR VALVES (SARAZIN RSBD)', country: 'France', specialties: ['Pressure Safety Valves'] },

    // Instrument Manifolds
    { name: 'SWAGELOK', country: 'France', specialties: ['Instrument Manifolds'] },
    { name: 'PARKER', country: 'UK', specialties: ['Instrument Manifolds'] },

    // Flowmeters
    { name: 'YOKOGAWA', country: 'France / Japan', specialties: ['Flowmeters', 'Flow Indicators', 'Pressure And Temperature Transmitters', 'Level Transmitters'] },
    { name: 'FUJI ELECTRIC', country: 'France / Japan', specialties: ['Flowmeters', 'Flow Indicators', 'Level Transmitters'] },

    // Electrical Heat Tracing
    { name: 'ETIREX (CHROMALOX)', country: 'France', specialties: ['Electrical Heat Tracing'] },
    { name: 'RAYCHEM', country: 'France', specialties: ['Electrical Heat Tracing'] },
    { name: 'THERMON', country: 'France', specialties: ['Electrical Heat Tracing'] },
    { name: 'VULCANIC', country: 'France', specialties: ['Electrical Heat Tracing'] },
    { name: 'EXHEAT', country: 'UK / International', specialties: ['Electrical Heat Tracing'] },

    // Unit Control System (PLC)
    { name: 'ROCKWELL AUTOMATION', country: 'USA', specialties: ['Unit Control System (PLC)'] },
    { name: 'SCHNEIDER', country: 'France', specialties: ['Unit Control System (PLC)', 'VFD'] },
    { name: 'SIEMENS', country: 'France', specialties: ['Unit Control System (PLC)', 'Gas Analyzer', 'Electrical Motors', 'VFD'] },
    { name: 'INVENSYS (TRICONEX)', country: 'International', specialties: ['Unit Control System (PLC)'] },

    // Electrical Motors
    { name: 'WEG', specialties: ['Electrical Motors'] },
    { name: 'LEROY SOMMER', specialties: ['Electrical Motors'] },
    { name: 'ANSALDO', specialties: ['Electrical Motors'] },

    // Cable Glands
    { name: 'ATX', country: 'France', specialties: ['Cable Glands', 'Junction Box'] },
    { name: 'CAPRI', country: 'France', specialties: ['Cable Glands'] },
    { name: 'HAWKE', country: 'UK', specialties: ['Cable Glands'] },
    { name: 'PHOENIX MECANO (ROSE)', country: 'Germany', specialties: ['Cable Glands', 'Junction Box'] },

    // Junction Box
    { name: 'BARTEC', country: 'France', specialties: ['Junction Box'] },
    { name: 'FEAM', country: 'France / Italy', specialties: ['Cable Glands', 'Junction Box'] },
    { name: 'STAHL', country: 'Germany', specialties: ['Junction Box'] },
    { name: 'MTL', country: 'Germany', specialties: ['Junction Box'] },
  ];

  for (const v of vendorData) {
    const vendor = await prisma.vendor.upsert({
      where: { name: v.name },
      update: {},
      create: {
        name: v.name,
        country: v.country,
      },
    });

    for (const specialty of v.specialties) {
      await prisma.vendorEquipmentType.upsert({
        where: {
          vendorId_equipmentType: {
            vendorId: vendor.id,
            equipmentType: specialty,
          },
        },
        update: {},
        create: {
          vendorId: vendor.id,
          equipmentType: specialty,
        },
      });
    }
  }
  console.log(`Created ${vendorData.length} vendors with specialties`);

  // ==========================================
  // Sample Discussions
  // ==========================================

  const blowdownDrum = await prisma.equipment.findUnique({ where: { tagNumber: '125-VV-601' } });
  const pumpA = await prisma.equipment.findUnique({ where: { tagNumber: '125-PR-601 A' } });

  // Discussion 1: linked to equipment
  const existingDiscussion1 = await prisma.discussion.findFirst({
    where: { title: 'Blowdown Drum material selection' },
  });
  if (!existingDiscussion1) {
    const discussion1 = await prisma.discussion.create({
      data: {
        title: 'Blowdown Drum material selection',
        content:
          'Should we consider stainless steel for the blowdown drum given the corrosive service conditions? The current specification calls for CS + 3mm CA but some project members have concerns about the corrosion allowance.',
        authorId: manager.id,
        projectId: project.id,
        equipmentId: blowdownDrum?.id,
        comments: {
          create: [
            {
              content:
                'I recommend we stick with CS + 3mm CA as per the equipment list. The operating conditions (0 barg, 100 deg C) are mild. SS would be over-engineered for this service.',
              authorId: reviewer.id,
            },
            {
              content:
                'Agreed with Jean. The vendor LESER also confirmed that CS is standard for this application. Let us proceed with the original spec.',
              authorId: admin.id,
            },
          ],
        },
      },
    });
    console.log(`Created discussion: ${discussion1.title}`);
  }

  // Discussion 2: linked to pump
  const existingDiscussion2 = await prisma.discussion.findFirst({
    where: { title: 'Feed Loop Pump vendor selection' },
  });
  if (!existingDiscussion2) {
    const discussion2 = await prisma.discussion.create({
      data: {
        title: 'Feed Loop Pump vendor selection',
        content:
          'We need to select a vendor for the 125-PR-601 A/B gear pumps. From the approved vendor list, MOUVEX and PERONI are both qualified for reciprocating pumps. Any preference?',
        authorId: reviewer.id,
        projectId: project.id,
        equipmentId: pumpA?.id,
        comments: {
          create: [
            {
              content:
                'MOUVEX has better lead times for this type of pump. I suggest we request quotes from both and compare.',
              authorId: manager.id,
            },
          ],
        },
      },
    });
    console.log(`Created discussion: ${discussion2.title}`);
  }

  // Discussion 3: general project discussion
  const existingDiscussion3 = await prisma.discussion.findFirst({
    where: { title: 'Weekly progress update - Week 7' },
  });
  if (!existingDiscussion3) {
    const discussion3 = await prisma.discussion.create({
      data: {
        title: 'Weekly progress update - Week 7',
        content:
          'Equipment datasheets for all vessels are now ready for review. Heat exchanger specs are 80% complete. Rotating machinery procurement can start next week.',
        authorId: manager.id,
        projectId: project.id,
      },
    });
    console.log(`Created discussion: ${discussion3.title}`);
  }

  // ==========================================
  // Project Partners
  // ==========================================

  const existingPartner = await prisma.projectPartner.findFirst({
    where: { projectId: project.id, name: 'Licensor Technologies Ltd.' },
  });
  if (!existingPartner) {
    await prisma.projectPartner.create({
      data: {
        projectId: project.id,
        name: 'Licensor Technologies Ltd.',
        role: 'Licensor',
        contactName: 'Dr. Sarah Chen',
        contactEmail: 'sarah.chen@licensortech.com',
      },
    });
    await prisma.projectPartner.create({
      data: {
        projectId: project.id,
        name: 'EPC Global Engineering',
        role: 'EPC Contractor',
        contactName: 'Pierre Lemoine',
        contactEmail: 'p.lemoine@epcglobal.fr',
      },
    });
    console.log('Created project partners');
  }

  // ==========================================
  // Project Vendors (link some vendors to project)
  // ==========================================

  const sulzer = await prisma.vendor.findUnique({ where: { name: 'SULZER' } });
  const mouvex = await prisma.vendor.findUnique({ where: { name: 'MOUVEX' } });
  const leser = await prisma.vendor.findUnique({ where: { name: 'LESER' } });

  for (const v of [
    { vendor: sulzer, notes: 'Selected for centrifugal pumps' },
    { vendor: mouvex, notes: 'Under evaluation for gear pumps' },
    { vendor: leser, notes: 'Selected for pressure safety valves' },
  ]) {
    if (v.vendor) {
      await prisma.projectVendor.upsert({
        where: { projectId_vendorId: { projectId: project.id, vendorId: v.vendor.id } },
        update: {},
        create: { projectId: project.id, vendorId: v.vendor.id, notes: v.notes },
      });
    }
  }
  console.log('Created project vendor assignments');

  // ==========================================
  // Document Register Entries
  // ==========================================

  const registerEntries = [
    {
      documentNumber: 'ZG-125-PRC-001',
      title: 'Process Flow Diagram - Unit U_A',
      discipline: Discipline.PROCESS,
      ownerId: admin.id,
      issuerId: manager.id,
      revision: 'B',
      status: DocRegisterStatus.APPROVED,
      issueDate: new Date('2026-01-15'),
      description: 'Overall process flow diagram for Alphahexol regeneration unit',
    },
    {
      documentNumber: 'ZG-125-PRC-002',
      title: 'P&ID - Catalyst Filtration Section',
      discipline: Discipline.PROCESS,
      ownerId: admin.id,
      revision: 'A',
      status: DocRegisterStatus.FOR_REVIEW,
      description: 'Piping & Instrumentation Diagram for catalyst filtration area (125-NF-601 A/B)',
    },
    {
      documentNumber: 'ZG-125-MEC-001',
      title: 'Datasheet - Blowdown Drum 125-VV-601',
      discipline: Discipline.MECHANICAL,
      ownerId: reviewer.id,
      revision: 'A',
      status: DocRegisterStatus.DRAFT,
      description: 'Mechanical datasheet for vertical blowdown drum',
    },
  ];

  for (const entry of registerEntries) {
    await prisma.documentRegisterEntry.upsert({
      where: {
        projectId_documentNumber: { projectId: project.id, documentNumber: entry.documentNumber },
      },
      update: {},
      create: { projectId: project.id, ...entry },
    });
  }
  console.log(`Created ${registerEntries.length} document register entries`);

  // ==========================================
  // Sample Transmittal
  // ==========================================

  const existingTransmittal = await prisma.transmittal.findFirst({
    where: { projectId: project.id, transmittalNumber: 'MONCHE-TR-001' },
  });
  if (!existingTransmittal) {
    const pfdEntry = await prisma.documentRegisterEntry.findFirst({
      where: { projectId: project.id, documentNumber: 'ZG-125-PRC-001' },
    });
    const pidEntry = await prisma.documentRegisterEntry.findFirst({
      where: { projectId: project.id, documentNumber: 'ZG-125-PRC-002' },
    });

    await prisma.transmittal.create({
      data: {
        projectId: project.id,
        transmittalNumber: 'MONCHE-TR-001',
        subject: 'Process Flow Diagrams - For Review',
        purpose: TransmittalPurpose.FOR_REVIEW,
        recipientName: 'Dr. Sarah Chen',
        recipientEmail: 'sarah.chen@licensortech.com',
        recipientType: 'PARTNER',
        sentById: manager.id,
        status: 'SENT',
        sentAt: new Date('2026-02-10'),
        coverLetter: 'Please find attached the process flow diagrams for Unit U_A. Kindly review and provide your comments within 2 weeks.',
        items: {
          create: [
            ...(pfdEntry ? [{ registerEntryId: pfdEntry.id, remarks: 'Rev B - updated per licensor comments' }] : []),
            ...(pidEntry ? [{ registerEntryId: pidEntry.id, remarks: 'Rev A - initial issue' }] : []),
          ],
        },
      },
    });
    console.log('Created sample transmittal');
  }

  console.log('\nSeed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
