export interface OrgRoleDefinition {
  role: string;
  label: string;
  parentRole: string | null;
  order: number;
}

export const DEFAULT_ORG_ROLES: OrgRoleDefinition[] = [
  // Top level
  { role: 'sponsor', label: 'Sponsor', parentRole: null, order: 0 },
  { role: 'client', label: 'Client', parentRole: null, order: 1 },
  { role: 'chef_de_projet', label: 'Chef de projet', parentRole: null, order: 2 },

  // Project management
  { role: 'project_secretary', label: 'Project Secretariat', parentRole: 'chef_de_projet', order: 0 },
  { role: 'doc_controller', label: 'Doc Controleur', parentRole: 'chef_de_projet', order: 1 },
  { role: 'cost_controller', label: 'Cost Controller', parentRole: 'chef_de_projet', order: 2 },
  { role: 'quality_manager', label: 'Quality Manager', parentRole: 'chef_de_projet', order: 3 },
  { role: 'contract_manager', label: 'Contract Manager', parentRole: 'chef_de_projet', order: 4 },

  // Engineering
  { role: 'engineering_manager', label: 'Engineering Manager', parentRole: 'chef_de_projet', order: 5 },
  { role: 'process_lead', label: 'Process Lead', parentRole: 'engineering_manager', order: 0 },
  { role: 'layout_lead', label: 'Layout Lead', parentRole: 'engineering_manager', order: 1 },
  { role: 'civil_lead', label: 'Civil Lead', parentRole: 'engineering_manager', order: 2 },
  { role: 'piping_lead', label: 'Piping Lead', parentRole: 'engineering_manager', order: 3 },
  { role: 'vessels_lead', label: 'Vessels Lead', parentRole: 'engineering_manager', order: 4 },
  { role: 'machine_lead', label: 'Machine Lead', parentRole: 'engineering_manager', order: 5 },
  { role: 'electrical_lead', label: 'Electrical Lead', parentRole: 'engineering_manager', order: 6 },
  { role: 'instrument_lead', label: 'Instrument Lead', parentRole: 'engineering_manager', order: 7 },
  { role: 'subcontracted_studies', label: 'Subcontracted Studies', parentRole: 'engineering_manager', order: 8 },

  // Procurement
  { role: 'procurement_manager', label: 'Procurement', parentRole: 'chef_de_projet', order: 6 },
  { role: 'buyer', label: 'Buyer', parentRole: 'procurement_manager', order: 0 },
  { role: 'inspector', label: 'Inspector', parentRole: 'procurement_manager', order: 1 },
  { role: 'expeditor', label: 'Expeditor', parentRole: 'procurement_manager', order: 2 },

  // Construction
  { role: 'construction_manager', label: 'Construction', parentRole: 'chef_de_projet', order: 7 },
  { role: 'safety', label: 'Safety', parentRole: 'construction_manager', order: 0 },
  { role: 'quality_construction', label: 'Quality', parentRole: 'construction_manager', order: 1 },
  { role: 'subcontractor_lead', label: 'Sub Contractor Lead', parentRole: 'construction_manager', order: 2 },
  { role: 'progress_piping', label: 'Progress Piping', parentRole: 'construction_manager', order: 3 },
  { role: 'progress_installation', label: 'Progress Installation', parentRole: 'construction_manager', order: 4 },
  { role: 'progress_civil', label: 'Progress Civil', parentRole: 'construction_manager', order: 5 },
  { role: 'precom_comm', label: 'Precom Comm', parentRole: 'construction_manager', order: 6 },
  { role: 'contract_lead', label: 'Contract Lead', parentRole: 'construction_manager', order: 7 },
];

export const DEFAULT_PROJECT_TREE = [
  {
    name: 'Cahier des charges', level: 1, order: 0, children: [
      { name: 'Specifications techniques', level: 2, order: 0 },
      { name: 'Liste de documents a produire', level: 2, order: 1 },
      { name: "Documents d'avant projet", level: 2, order: 2 },
    ],
  },
  {
    name: 'Gestion de projet', level: 1, order: 1, children: [
      { name: 'Project secretariat', level: 2, order: 0, children: [
        { name: 'Liste des communications', level: 3, order: 0 },
      ] },
      { name: 'Cost control', level: 2, order: 1 },
      { name: 'Doc control', level: 2, order: 2, children: [
        { name: 'Liste des plans et documents', level: 3, order: 0 },
        { name: 'Liste des transmittals', level: 3, order: 1 },
      ] },
      { name: 'Planning', level: 2, order: 3 },
      { name: 'Qualite Securite', level: 2, order: 4 },
      { name: 'Specification de projet', level: 2, order: 5 },
      { name: 'Organigramme de projet', level: 2, order: 6 },
    ],
  },
  {
    name: 'Engineering', level: 1, order: 2, children: [
      { name: 'Liste de plans', level: 2, order: 0 },
      { name: 'Process', level: 2, order: 1 },
      { name: 'Layout', level: 2, order: 2 },
      { name: 'Piping', level: 2, order: 3 },
      { name: 'Civil', level: 2, order: 4 },
      { name: 'Equipements', level: 2, order: 5 },
      { name: 'Electricite', level: 2, order: 6 },
      { name: 'Instrumentation', level: 2, order: 7 },
      { name: 'Systeme', level: 2, order: 8 },
      { name: "Contrats d'etude et de sous traitances", level: 2, order: 9 },
    ],
  },
  {
    name: 'Procurement', level: 1, order: 3, children: [
      { name: 'Contrat clauses de commandes', level: 2, order: 0 },
      { name: 'Vendor list', level: 2, order: 1 },
      { name: "Appels d'offres", level: 2, order: 2 },
      { name: 'Commandes', level: 2, order: 3 },
    ],
  },
  {
    name: 'Construction', level: 1, order: 4, children: [
      { name: 'Site preparation', level: 2, order: 0 },
      { name: "Appels d'offres", level: 2, order: 1 },
      { name: 'Commande site', level: 2, order: 2 },
    ],
  },
  {
    name: 'Precom Com', level: 1, order: 5, children: [
      { name: 'Procedure', level: 2, order: 0 },
      { name: 'Reception', level: 2, order: 1 },
    ],
  },
  { name: 'Start-up', level: 1, order: 6 },
  {
    name: 'Documents generaux', level: 1, order: 7, children: [
      { name: 'Liste des bases de donnees', level: 2, order: 0 },
      { name: 'Liste des workflows', level: 2, order: 1 },
      { name: 'Methodes et procedure', level: 2, order: 2 },
    ],
  },
];
