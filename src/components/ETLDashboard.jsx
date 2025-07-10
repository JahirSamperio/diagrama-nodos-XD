import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import {
  PlayArrow,
  Error,
  CheckCircle,
  Schedule,
  Memory,
  Storage,
  Functions,
  Download
} from '@mui/icons-material';
import { nodesData, availableProcesses as processesData } from '../data/nodesData';

const ETLDashboard = () => {
  const [allNodes, setAllNodes] = useState(nodesData);
  const [nodes, setNodes] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [availableProcesses, setAvailableProcesses] = useState(processesData);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLayouting, setIsLayouting] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.5);
  const [pan, setPan] = useState({ x: 100, y: 50 });
  const svgRef = useRef(null);

  useEffect(() => {
    setNodes(nodesData);
  }, []);

  useEffect(() => {
    if (draggedNode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedNode, dragOffset, pan, zoom]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return 'success';
      case 'RUNNING': return 'warning';
      case 'FAILED': return 'error';
      case 'PENDING': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'RUNNING': return <PlayArrow sx={{ color: '#ff9800', animation: 'pulse 2s infinite' }} />;
      case 'FAILED': return <Error sx={{ color: '#f44336' }} />;
      case 'PENDING': return <Schedule sx={{ color: '#9e9e9e' }} />;
      default: return <Pause sx={{ color: '#9e9e9e' }} />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Glue': return <Storage />;
      case 'EMR': return <Memory />;
      case 'Lambda': return <Functions />;
      default: return <Memory />;
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      'Ingesta': '#e3f2fd',
      'Transformación': '#fff3e0', 
      'Business': '#e8f5e8'
    };
    return colors[level] || '#f5f5f5';
  };

  const filterNodes = (processName) => {
    setIsLayouting(true);
    setTimeout(() => {
      if (processName === 'all') {
        setNodes(allNodes);
      } else {
        const filtered = allNodes.filter(node => node.process === processName);
        setNodes(filtered);
      }
      setIsLayouting(false);
    }, 200);
  };

  const handleMouseDown = (e, node) => {
    e.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    setDraggedNode(node.id);
    setDragOffset({
      x: (e.clientX - rect.left - pan.x) / zoom - node.position.x,
      y: (e.clientY - rect.top - pan.y) / zoom - node.position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!draggedNode) return;
    const rect = svgRef.current.getBoundingClientRect();
    const newX = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
    const newY = (e.clientY - rect.top - pan.y) / zoom - dragOffset.y;
    
    setNodes(prev => prev.map(node => 
      node.id === draggedNode 
        ? { ...node, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
        : node
    ));
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 0.1), 3);
    
    setPan(prev => ({
      x: mouseX - (mouseX - prev.x) * (newZoom / zoom),
      y: mouseY - (mouseY - prev.y) * (newZoom / zoom)
    }));
    
    setZoom(newZoom);
  };



  const renderConnections = () => {
    return nodes.map(node =>
      node.dependencies.map(depId => {
        const sourceNode = nodes.find(n => n.id === depId);
        if (!sourceNode) return null;

        const sourceX = sourceNode.position.x + 120;
        const sourceY = sourceNode.position.y + 60;
        const targetX = node.position.x;
        const targetY = node.position.y + 60;

        return (
          <line
            key={`${depId}-${node.id}`}
            x1={sourceX}
            y1={sourceY}
            x2={targetX}
            y2={targetY}
            stroke="#666"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        );
      })
    ).flat();
  };

  const getProcessStats = () => {
    const total = nodes.length;
    const success = nodes.filter(n => n.status === 'SUCCESS').length;
    const running = nodes.filter(n => n.status === 'RUNNING').length;
    const failed = nodes.filter(n => n.status === 'FAILED').length;
    const pending = nodes.filter(n => n.status === 'PENDING').length;
    return { total, success, running, failed, pending };
  };

  const stats = getProcessStats();

  return (
    <Box sx={{ width: '100%', height: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          color: 'white',
          p: 2,
          borderRadius: 0,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ 
              width: 32, 
              height: 32, 
              borderRadius: 1, 
              bgcolor: 'rgba(255,255,255,0.2)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              🚀
            </Box>
            DAG Process Monitor
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5, 
              bgcolor: 'rgba(34, 197, 94, 0.15)', 
              px: 1.5, 
              py: 0.5, 
              borderRadius: 1,
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}>
              <CheckCircle sx={{ color: '#22c55e', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                {stats.success} Success
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5, 
              bgcolor: 'rgba(245, 158, 11, 0.15)', 
              px: 1.5, 
              py: 0.5, 
              borderRadius: 1,
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              <PlayArrow sx={{ color: '#f59e0b', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                {stats.running} Running
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5, 
              bgcolor: 'rgba(239, 68, 68, 0.15)', 
              px: 1.5, 
              py: 0.5, 
              borderRadius: 1,
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <Error sx={{ color: '#ef4444', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                {stats.failed} Failed
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5, 
              bgcolor: 'rgba(148, 163, 184, 0.15)', 
              px: 1.5, 
              py: 0.5, 
              borderRadius: 1,
              border: '1px solid rgba(148, 163, 184, 0.3)'
            }}>
              <Schedule sx={{ color: '#94a3b8', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                {stats.pending} Pending
              </Typography>
            </Box>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.8)', '&.Mui-focused': { color: 'white' } }}>Filter</InputLabel>
              <Select
                value={activeFilter}
                label="Filter"
                onChange={(e) => {
                  setActiveFilter(e.target.value);
                  filterNodes(e.target.value);
                }}
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.6)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '.MuiSvgIcon-root': { color: 'white' },
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 1,
                  height: 36
                }}
              >
                <MenuItem value="all">All Processes</MenuItem>
                {availableProcesses.map(process => (
                  <MenuItem key={process} value={process}>{process}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<Download />}
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 500,
                px: 2,
                py: 0.5,
                borderRadius: 1,
                textTransform: 'none',
                height: 36,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.25)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Template
            </Button>

            {activeFilter !== 'all' && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                bgcolor: 'rgba(255,255,255,0.1)', 
                px: 1.5, 
                py: 0.5,
                borderRadius: 1,
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <Typography variant="caption" sx={{ color: 'white', opacity: 0.9 }}>
                  {activeFilter} ({nodes.length}/{allNodes.length})
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    setActiveFilter('all');
                    filterNodes('all');
                  }}
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 0.5,
                    py: 0,
                    fontSize: '0.75rem',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  ✕
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Main DAG Area */}
        <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {isLayouting && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(255,255,255,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    border: '3px solid #1976d2',
                    borderTop: '3px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }}
                />
                <Typography variant="h6">Reorganizing Layout...</Typography>
              </Paper>
            </Box>
          )}

          <Box
            component="svg"
            ref={svgRef}
            onWheel={handleWheel}
            sx={{
              width: '100%',
              height: '100%',
              cursor: draggedNode ? 'grabbing' : 'grab'
            }}
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Grid Background */}
            <defs>
              <pattern
                id="grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth="1"
                />
              </pattern>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#666"
                />
              </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Level Backgrounds */}
            {['Ingesta', 'Transformación', 'Business'].map((level, index) => (
              <rect
                key={`level-${level}`}
                x={30 + (index * 270)}
                y={0}
                width="260"
                height="100%"
                fill={getLevelColor(level)}
                opacity="0.2"
              />
            ))}

            {/* Level Labels */}
            {['Ingesta', 'Transformación', 'Business'].map((level, index) => (
              <text
                key={`level-label-${level}`}
                x={50 + (index * 270) + 120}
                y={30}
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill="#333"
              >
                {level.toUpperCase()}
              </text>
            ))}

            {/* Connections */}
            {renderConnections()}

            {/* Nodes */}
            {nodes.map(node => (
              <foreignObject
                key={node.id}
                x={node.position.x}
                y={node.position.y}
                width="240"
                height="120"
              >
                <Card
                  onMouseDown={(e) => handleMouseDown(e, node)}
                  sx={{
                    width: '100%',
                    height: '100%',
                    cursor: draggedNode === node.id ? 'grabbing' : 'grab',
                    borderRadius: 3,
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                    border: node.status === 'FAILED' ? '2px solid #ef4444' : 
                           node.status === 'SUCCESS' ? '2px solid #22c55e' :
                           node.status === 'RUNNING' ? '2px solid #f59e0b' : '2px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: draggedNode === node.id ? 'none' : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: draggedNode === node.id ? 'scale(1.05)' : 'none',
                    '&:hover': {
                      transform: draggedNode === node.id ? 'scale(1.05)' : 'translateY(-2px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      border: node.status === 'FAILED' ? '2px solid #dc2626' : 
                             node.status === 'SUCCESS' ? '2px solid #16a34a' :
                             node.status === 'RUNNING' ? '2px solid #d97706' : '2px solid #3b82f6'
                    }
                  }}
                >
                  <CardContent sx={{ p: 1.5 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getTypeIcon(node.type)}
                        <Typography variant="caption" color="text.secondary">
                          {node.type}
                        </Typography>
                      </Box>
                      <Chip
                        label={node.status}
                        color={getStatusColor(node.status)}
                        size="small"
                      />
                    </Box>

                    {/* Process Name */}
                    <Paper
                      sx={{
                        p: 1.5,
                        mb: 1,
                        background: node.status === 'SUCCESS' ? 'linear-gradient(135deg, #22c55e, #16a34a)' :
                                   node.status === 'FAILED' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                                   node.status === 'RUNNING' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                                   'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: 'white',
                        borderRadius: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Typography variant="body2" fontWeight="700" sx={{ mb: 0.5 }}>
                        {node.process}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.95 }}>
                        {node.name}
                      </Typography>
                    </Paper>

                    {/* Dependencies */}
                    {node.dependencies.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        ⚡ {node.dependencies.length} deps
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </foreignObject>
            ))}
            </g>
          </Box>
        </Box>

        {/* Sidebar */}
        <Paper
          sx={{
            width: sidebarCollapsed ? 48 : 400,
            transition: 'width 0.3s ease',
            borderRadius: 0,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#ffffff',
            borderLeft: '1px solid #e2e8f0',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.05)'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {!sidebarCollapsed && (
              <Typography variant="h6" fontWeight="bold">
                Control Panel
              </Typography>
            )}
            <Button 
              variant="text" 
              size="small"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              {sidebarCollapsed ? '→' : '←'}
            </Button>
          </Box>

          {!sidebarCollapsed && (
            <Box sx={{ p: 2, overflow: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
              {/* Process Hierarchy */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Process Hierarchy
              </Typography>
              <Box sx={{ mb: 3 }}>
                {['Ingesta', 'Transformación', 'Business'].map(level => {
                  const levelNodes = nodes.filter(n => n.level === level);
                  return (
                    <Paper key={level} sx={{ p: 2, mb: 2, bgcolor: getLevelColor(level) }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {level} ({levelNodes.length} processes)
                      </Typography>
                      {levelNodes.map(node => (
                        <Box key={node.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body2">{node.name}</Typography>
                          <Chip
                            label={node.status}
                            color={getStatusColor(node.status)}
                            size="small"
                          />
                        </Box>
                      ))}
                    </Paper>
                  );
                })}
              </Box>

              {/* Critical Issues */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Critical Issues
              </Typography>
              <Box sx={{ mb: 3 }}>
                {nodes.filter(n => n.status === 'FAILED').map(node => (
                  <Paper key={node.id} sx={{ p: 2, mb: 1, bgcolor: '#ffebee', border: '1px solid #f44336' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Error color="error" />
                      <Typography variant="body2" fontWeight="bold">
                        {node.name} - FAILED
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Process: {node.process} • Type: {node.type}
                    </Typography>
                  </Paper>
                ))}
                {nodes.filter(n => n.status === 'FAILED').length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <CheckCircle color="success" />
                    <Typography variant="body2" color="text.secondary">
                      No critical issues detected
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Available Processes */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Available Processes
              </Typography>
              <Box>
                {availableProcesses.map(process => {
                  const processNodes = allNodes.filter(n => n.process === process);
                  const isActive = activeFilter === process;
                  return (
                    <Paper
                      key={process}
                      sx={{
                        p: 2,
                        mb: 1,
                        cursor: 'pointer',
                        bgcolor: isActive ? '#e3f2fd' : 'white',
                        border: isActive ? '1px solid #2196f3' : '1px solid #e0e0e0',
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                      onClick={() => {
                        const newFilter = isActive ? 'all' : process;
                        setActiveFilter(newFilter);
                        filterNodes(newFilter);
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {process}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {processNodes.length} subprocesses
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>


    </Box>
  );
};

export default ETLDashboard;