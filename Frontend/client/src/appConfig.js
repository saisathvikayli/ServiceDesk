import { BookOpen, Boxes, Gauge, HardDrive, Network, Truck } from 'lucide-react'

export const resourceConfigs = {
  categories: {
    endpoint: '/categories',
    title: 'Ticket categories',
    eyebrow: 'Catalogue / Categories',
    description: 'Define the shared language your team uses to route and resolve support work.',
    singular: 'Category',
    icon: Boxes,
    canCreateRoles: ['admin'],
    fields: [
      { name: 'cat_name', label: 'Category name', required: true, placeholder: 'Hardware request' },
      { name: 'default_priority', label: 'Default priority', type: 'number', required: true, defaultValue: 2 }
    ],
    columns: [
      { key: 'cat_name', label: 'Name' },
      { key: 'default_priority', label: 'Default priority', badge: true }
    ]
  },

  priorities: {
    endpoint: '/priorities',
    title: 'Priorities',
    eyebrow: 'Configuration / Priorities',
    description: 'Set the urgency vocabulary and base SLA targets used across your service desk.',
    singular: 'Priority',
    icon: Gauge,
    canCreateRoles: ['admin'],
    fields: [
      { name: 'p_name', label: 'Priority name', required: true, placeholder: 'High' },
      { name: 'level', label: 'Level', type: 'number', required: true, defaultValue: 1 },
      { name: 'slaHours', label: 'SLA hours', type: 'number', required: true, defaultValue: 8 }
    ],
    columns: [
      { key: 'p_name', label: 'Name' },
      { key: 'level', label: 'Level' },
      { key: 'slaHours', label: 'SLA hours' }
    ]
  },

  'sla-policies': {
    endpoint: '/sla-policies',
    title: 'SLA policies',
    eyebrow: 'Configuration / Service levels',
    description: 'Keep response and resolution expectations visible and consistent across team tiers.',
    singular: 'SLA policy',
    icon: Network,
    canCreateRoles: ['manager', 'admin'],
    fields: [
      { name: 'priorityId', label: 'Priority reference ID', type: 'number', required: true, defaultValue: 1 },
      { name: 'responseHours', label: 'Response target (hours)', type: 'number', required: true, defaultValue: 4 },
      { name: 'resolutionHours', label: 'Resolution target (hours)', type: 'number', required: true, defaultValue: 24 },
      { name: 'businessHoursOnly', label: 'Business hours only (1 = Yes, 0 = No)', type: 'number', required: true, defaultValue: 1 }
    ],
    columns: [
      { key: 'priorityId', label: 'Priority ID' },
      { key: 'responseHours', label: 'Target response (hrs)' },
      { key: 'resolutionHours', label: 'Target resolution (hrs)' },
      { key: 'businessHoursOnly', label: 'Business hours' }
    ]
  },

  assets: {
    endpoint: '/assets',
    title: 'Assets',
    eyebrow: 'Inventory / Assets',
    description: 'Track hardware equipment, devices, and technology connected to support tickets.',
    singular: 'Asset',
    icon: HardDrive,
    canCreateRoles: ['technician', 'manager', 'admin'],
    fields: [
      { name: 'name', label: 'Asset name', required: true, placeholder: 'MacBook Pro 14"' },
      { name: 'type', label: 'Type', required: true, placeholder: 'Laptop' },
      { name: 'serialNo', label: 'Serial number', required: true, placeholder: 'ABC-12345' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        defaultValue: 'procured',
        options: [
          { label: 'Procured', value: 'procured' },
          { label: 'Assigned', value: 'assigned' },
          { label: 'In Repair', value: 'in-repair' },
          { label: 'Retired', value: 'retired' }
        ]
      },
      { name: 'assignedTo', label: 'Assigned user ID', placeholder: 'Optional user ID' },
      { name: 'vendorId', label: 'Vendor ID', placeholder: 'Optional vendor ID' }
    ],
    columns: [
      { key: 'name', label: 'Asset' },
      { key: 'type', label: 'Type' },
      { key: 'serialNo', label: 'Serial number' },
      { key: 'status', label: 'Status', badge: true }
    ]
  },

  vendors: {
    endpoint: '/vendors',
    title: 'Vendors',
    eyebrow: 'Inventory / Partners',
    description: 'Maintain external supplier contact info for asset maintenance and escalation.',
    singular: 'Vendor',
    icon: Truck,
    canCreateRoles: ['technician', 'manager', 'admin'],
    fields: [
      { name: 'name', label: 'Vendor name', required: true, placeholder: 'Acme Systems' },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'support@vendor.com' },
      { name: 'phone', label: 'Phone', placeholder: '+1 555 0100' },
      { name: 'address', label: 'Address', placeholder: 'Vendor headquarters address' }
    ],
    columns: [
      { key: 'name', label: 'Vendor' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'address', label: 'Address' }
    ]
  },

  'knowledge-articles': {
    endpoint: '/knowledge-articles',
    title: 'Knowledge base',
    eyebrow: 'Enablement / Articles',
    description: 'Provide quick resolution guides to prevent repetitive support tickets.',
    singular: 'Article',
    icon: BookOpen,
    canCreateRoles: ['technician', 'manager', 'admin'],
    fields: [
      { name: 'title', label: 'Title', required: true, placeholder: 'How to reset your VPN credentials' },
      { name: 'body', label: 'Article content', type: 'textarea', required: true, placeholder: 'Step-by-step instructions...' }
    ],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'body', label: 'Content', render: (value) => `${String(value).slice(0, 64)}${String(value).length > 64 ? '...' : ''}` },
      { key: 'createdAt', label: 'Created' }
    ]
  },
}

resourceConfigs.slaPolicies = resourceConfigs['sla-policies']
resourceConfigs.knowledgeArticles = resourceConfigs['knowledge-articles']