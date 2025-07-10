export const nodesData = [
  // FLUJO RaaS - Ingesta centrada entre 2 transformaciones
  { id: 'raas', name: 'RaaS', type: 'Lambda', process: 'RaaS', status: 'SUCCESS', startTime: '2025-01-05 06:00', endTime: '2025-01-05 06:05', position: { x: 80, y: 150 }, dependencies: [], level: 'Ingesta', flow: 'yellow' },
  { id: 'ancillaries-atlas', name: 'Ancillaries Atlas', type: 'Glue', process: 'RaaS', status: 'SUCCESS', startTime: '2025-01-05 06:06', endTime: '2025-01-05 06:15', position: { x: 480, y: 80 }, dependencies: ['raas'], level: 'Transformación', flow: 'yellow' },
  { id: 'basefare-atlas', name: 'BaseFare Atlas', type: 'Glue', process: 'RaaS', status: 'RUNNING', startTime: '2025-01-05 06:06', endTime: '2025-01-05 06:15', position: { x: 480, y: 220 }, dependencies: ['raas'], level: 'Transformación', flow: 'yellow' },
  { id: 'total-revenue-atlas', name: 'Total Revenue Atlas', type: 'EMR', process: 'RaaS', status: 'PENDING', startTime: '2025-01-05 06:16', endTime: '2025-01-05 06:25', position: { x: 920, y: 80 }, dependencies: ['ancillaries-atlas'], level: 'Business', flow: 'yellow' },
  { id: 'total-sales-atlas', name: 'Total Sales Atlas', type: 'EMR', process: 'RaaS', status: 'PENDING', startTime: '2025-01-05 06:16', endTime: '2025-01-05 06:25', position: { x: 920, y: 220 }, dependencies: ['basefare-atlas'], level: 'Business', flow: 'yellow' },

  // FLUJO MasterDB - Ingesta centrada entre 4 transformaciones
  { id: 'masterdb', name: 'MasterDB', type: 'Storage', process: 'MasterDB', status: 'SUCCESS', startTime: '2025-01-05 06:00', endTime: '2025-01-05 06:05', position: { x: 80, y: 500 }, dependencies: [], level: 'Ingesta', flow: 'orange' },
  { id: 'ancillaries-legado', name: 'Ancillaries Legado', type: 'Glue', process: 'MasterDB', status: 'SUCCESS', startTime: '2025-01-05 06:06', endTime: '2025-01-05 06:15', position: { x: 380, y: 430 }, dependencies: ['masterdb'], level: 'Transformación', flow: 'orange' },
  { id: 'basefare-legado', name: 'BaseFare Legado', type: 'Glue', process: 'MasterDB', status: 'SUCCESS', startTime: '2025-01-05 06:06', endTime: '2025-01-05 06:15', position: { x: 380, y: 570 }, dependencies: ['masterdb'], level: 'Transformación', flow: 'orange' },
  { id: 'golden-record', name: 'Golden Record', type: 'EMR', process: 'MasterDB', status: 'RUNNING', startTime: '2025-01-05 06:16', endTime: '2025-01-05 06:25', position: { x: 630, y: 430 }, dependencies: ['ancillaries-legado'], level: 'Transformación', flow: 'orange' },
  { id: 'yayas-navifare', name: 'YaYas (Navifare)', type: 'Lambda', process: 'MasterDB', status: 'SUCCESS', startTime: '2025-01-05 06:16', endTime: '2025-01-05 06:25', position: { x: 630, y: 570 }, dependencies: ['basefare-legado'], level: 'Transformación', flow: 'orange' },
  { id: 'total-sales-legado', name: 'Total Sales Legado', type: 'EMR', process: 'MasterDB', status: 'PENDING', startTime: '2025-01-05 06:26', endTime: '2025-01-05 06:35', position: { x: 920, y: 430 }, dependencies: ['golden-record'], level: 'Business', flow: 'orange' },
  { id: 'total-revenue-legado', name: 'Total Revenue Legado', type: 'EMR', process: 'MasterDB', status: 'PENDING', startTime: '2025-01-05 06:26', endTime: '2025-01-05 06:35', position: { x: 920, y: 570 }, dependencies: ['yayas-navifare'], level: 'Business', flow: 'orange' },

  // FLUJO STFP - Ingesta centrada entre 2 transformaciones
  { id: 'stfp', name: 'STFP', type: 'Lambda', process: 'STFP', status: 'SUCCESS', startTime: '2025-01-05 06:00', endTime: '2025-01-05 06:05', position: { x: 80, y: 780 }, dependencies: [], level: 'Ingesta', flow: 'blue' },
  { id: 'generic-report', name: 'Generic Report', type: 'Glue', process: 'STFP', status: 'SUCCESS', startTime: '2025-01-05 06:06', endTime: '2025-01-05 06:15', position: { x: 480, y: 710 }, dependencies: ['stfp'], level: 'Transformación', flow: 'blue' },
  { id: 'finance-atlas', name: 'Finance Atlas', type: 'EMR', process: 'STFP', status: 'RUNNING', startTime: '2025-01-05 06:06', endTime: '2025-01-05 06:15', position: { x: 480, y: 850 }, dependencies: ['stfp'], level: 'Transformación', flow: 'blue' },

  // FLUJO Finance - 1 transformación
  { id: 'ingesta-finance', name: 'Ingesta Finance', type: 'Lambda', process: 'Finance', status: 'SUCCESS', startTime: '2025-01-05 06:00', endTime: '2025-01-05 06:05', position: { x: 80, y: 990 }, dependencies: [], level: 'Ingesta', flow: 'purple' },
  { id: 'finance-pl-legado', name: 'Finance P&L (legado)', type: 'EMR', process: 'Finance', status: 'FAILED', startTime: '2025-01-05 06:06', endTime: '2025-01-05 06:15', position: { x: 480, y: 990 }, dependencies: ['ingesta-finance'], level: 'Transformación', flow: 'purple' },

  // FLUJO YaYas - 1 transformación
  { id: 'yayas-main', name: 'YaYas', type: 'Lambda', process: 'YaYas', status: 'SUCCESS', startTime: '2025-01-05 06:00', endTime: '2025-01-05 06:05', position: { x: 80, y: 1130 }, dependencies: [], level: 'Ingesta', flow: 'green' },
  { id: 'yayas-juniper', name: 'YaYas (Juniper)', type: 'Glue', process: 'YaYas', status: 'SUCCESS', startTime: '2025-01-05 06:06', endTime: '2025-01-05 06:15', position: { x: 480, y: 1130 }, dependencies: ['yayas-main'], level: 'Transformación', flow: 'green' },

  // FLUJO Smile - 1 transformación
  { id: 'smile', name: 'Smile', type: 'Lambda', process: 'Smile', status: 'SUCCESS', startTime: '2025-01-05 06:00', endTime: '2025-01-05 06:05', position: { x: 80, y: 1270 }, dependencies: [], level: 'Ingesta', flow: 'pink' },
  { id: 'nps-fase-ii', name: 'NPS Fase II', type: 'EMR', process: 'Smile', status: 'RUNNING', startTime: '2025-01-05 06:06', endTime: '2025-01-05 06:15', position: { x: 480, y: 1270 }, dependencies: ['smile'], level: 'Transformación', flow: 'pink' },

  // FLUJO NPS - Solo ingesta
  { id: 'nps-fase-i', name: 'NPS Fase I', type: 'Glue', process: 'NPS', status: 'SUCCESS', startTime: '2025-01-05 06:00', endTime: '2025-01-05 06:05', position: { x: 80, y: 1410 }, dependencies: [], level: 'Ingesta', flow: 'yellow' },

  // SISTEMAS STANDALONE - Solo ingesta
  { id: 'storkjet', name: 'Storkjet', type: 'Storage', process: 'Standalone', status: 'SUCCESS', startTime: '2025-01-05 06:00', endTime: '2025-01-05 06:05', position: { x: 80, y: 1550 }, dependencies: [], level: 'Ingesta', flow: 'black' },
  { id: 'teallium', name: 'Teallium', type: 'Lambda', process: 'Standalone', status: 'SUCCESS', startTime: '2025-01-05 06:00', endTime: '2025-01-05 06:05', position: { x: 80, y: 1690 }, dependencies: [], level: 'Ingesta', flow: 'black' },
  { id: 'kambr', name: 'Kambr', type: 'Functions', process: 'Standalone', status: 'RUNNING', startTime: '2025-01-05 06:00', endTime: '2025-01-05 06:05', position: { x: 80, y: 1830 }, dependencies: [], level: 'Ingesta', flow: 'black' },
  { id: 'zendesk', name: 'Zendesk', type: 'Lambda', process: 'Standalone', status: 'SUCCESS', startTime: '2025-01-05 06:00', endTime: '2025-01-05 06:05', position: { x: 80, y: 1970 }, dependencies: [], level: 'Ingesta', flow: 'black' },
  { id: 'helix', name: 'Helix', type: 'EMR', process: 'Standalone', status: 'PENDING', startTime: '2025-01-05 06:00', endTime: '2025-01-05 06:05', position: { x: 80, y: 2110 }, dependencies: [], level: 'Ingesta', flow: 'black' },
  { id: 'amplitude', name:'Amplitude', type: 'Storage', process: 'Standalone', status: 'SUCCESS', startTime: '2025-01-05 06:00', endTime: '2025-01-05 06:05', position: { x: 80, y: 2250 }, dependencies: [], level: 'Ingesta', flow: 'black' }
];

export const availableProcesses = ['RaaS', 'MasterDB', 'STFP', 'Finance', 'YaYas', 'Smile', 'NPS', 'Standalone'];