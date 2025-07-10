import {
  Modal,
  Paper,
  Typography,
  Button,
  Chip,
  Box,
  Divider,
  Avatar
} from '@mui/material';
import {
  CheckCircle,
  Error,
  PlayArrow,
  Schedule,
  AccessTime,
  Memory,
  Storage,
  Functions
} from '@mui/icons-material';

const NodeDetailsModal = ({ open, onClose, node }) => {
  if (!node) return null;

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
      case 'SUCCESS': return <CheckCircle sx={{ color: '#22c55e' }} />;
      case 'RUNNING': return <PlayArrow sx={{ color: '#f59e0b' }} />;
      case 'FAILED': return <Error sx={{ color: '#ef4444' }} />;
      case 'PENDING': return <Schedule sx={{ color: '#94a3b8' }} />;
      default: return <Schedule sx={{ color: '#94a3b8' }} />;
    }
  };

  const getTypeIcon = (type, theme) => {
    const iconColor = theme?.primary || '#6b7280';
    switch (type) {
      case 'Glue': return <Storage sx={{ fontSize: 40, color: iconColor }} />;
      case 'EMR': return <Memory sx={{ fontSize: 40, color: iconColor }} />;
      case 'Lambda': return <Functions sx={{ fontSize: 40, color: iconColor }} />;
      default: return <Memory sx={{ fontSize: 40, color: iconColor }} />;
    }
  };

  const calculateElapsedTime = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = Math.abs(end - start) / 1000;
    const minutes = Math.floor(diff / 60);
    const seconds = Math.floor(diff % 60);
    return `${minutes}m ${seconds}s`;
  };

  const getStatusGradient = (status) => {
    switch (status) {
      case 'SUCCESS': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'RUNNING': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'FAILED': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default: return 'linear-gradient(135deg, #6366f1, #4f46e5)';
    }
  };

  const getStatusTheme = (status) => {
    switch (status) {
      case 'SUCCESS': return {
        primary: '#10b981',
        secondary: '#d1fae5',
        accent: '#34d399',
        text: '#065f46'
      };
      case 'RUNNING': return {
        primary: '#f59e0b',
        secondary: '#fef3c7',
        accent: '#fbbf24',
        text: '#92400e'
      };
      case 'FAILED': return {
        primary: '#ef4444',
        secondary: '#fee2e2',
        accent: '#f87171',
        text: '#991b1b'
      };
      default: return {
        primary: '#6366f1',
        secondary: '#e0e7ff',
        accent: '#818cf8',
        text: '#3730a3'
      };
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backdropFilter: 'blur(4px)'
      }}
    >
      <Paper 
        sx={{ 
          p: 0, 
          maxWidth: 600, 
          width: '90%', 
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          background: getStatusGradient(node.status),
          color: 'white',
          p: 3,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.15)', 
              width: 60, 
              height: 60,
              border: '2px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              {getTypeIcon(node.type, { primary: 'white' })}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                {node.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {node.process} • {node.type}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              {getStatusIcon(node.status)}
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                {node.status}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
            <Paper sx={{ 
              p: 2, 
              bgcolor: getStatusTheme(node.status).secondary, 
              borderRadius: 2,
              border: `1px solid ${getStatusTheme(node.status).accent}20`
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccessTime sx={{ color: getStatusTheme(node.status).primary, fontSize: 20 }} />
                <Typography variant="subtitle2" color={getStatusTheme(node.status).text}>
                  Hora de Inicio
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="600" color={getStatusTheme(node.status).text}>
                {node.startTime || 'N/A'}
              </Typography>
            </Paper>

            <Paper sx={{ 
              p: 2, 
              bgcolor: getStatusTheme(node.status).secondary, 
              borderRadius: 2,
              border: `1px solid ${getStatusTheme(node.status).accent}20`
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccessTime sx={{ color: getStatusTheme(node.status).primary, fontSize: 20 }} />
                <Typography variant="subtitle2" color={getStatusTheme(node.status).text}>
                  Hora de Fin
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="600" color={getStatusTheme(node.status).text}>
                {node.endTime || 'N/A'}
              </Typography>
            </Paper>
          </Box>

          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            background: `linear-gradient(135deg, ${getStatusTheme(node.status).secondary}, ${getStatusTheme(node.status).accent}20)`,
            borderRadius: 2,
            border: `2px solid ${getStatusTheme(node.status).accent}30`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                width: 50, 
                height: 50, 
                borderRadius: '50%',
                background: getStatusGradient(node.status),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${getStatusTheme(node.status).primary}40`
              }}>
                <AccessTime sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" color={getStatusTheme(node.status).text}>
                  Tiempo Transcurrido
                </Typography>
                <Typography variant="h6" fontWeight="bold" color={getStatusTheme(node.status).primary}>
                  {calculateElapsedTime(node.startTime, node.endTime)}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {node.status === 'FAILED' && (
            <Paper sx={{ 
              p: 3, 
              mb: 3, 
              bgcolor: '#fef2f2', 
              border: '1px solid #fecaca',
              borderRadius: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Error sx={{ color: '#ef4444', fontSize: 24 }} />
                <Typography variant="h6" color="error" fontWeight="bold">
                  Detalle del Error
                </Typography>
              </Box>
              <Typography variant="body2" color="error" sx={{ lineHeight: 1.6 }}>
                {node.errorDetail || 'Error en el procesamiento del nodo. Contacte al administrador del sistema.'}
              </Typography>
            </Paper>
          )}

          {node.dependencies && node.dependencies.length > 0 && (
            <Paper sx={{ 
              p: 2, 
              bgcolor: getStatusTheme(node.status).secondary, 
              borderRadius: 2, 
              mb: 3,
              border: `1px solid ${getStatusTheme(node.status).accent}30`
            }}>
              <Typography variant="subtitle2" color={getStatusTheme(node.status).text} sx={{ mb: 1 }}>
                Dependencias ({node.dependencies.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {node.dependencies.map((dep, index) => (
                  <Chip 
                    key={index} 
                    label={dep} 
                    size="small" 
                    variant="outlined"
                    sx={{ 
                      bgcolor: 'white',
                      borderColor: getStatusTheme(node.status).accent,
                      color: getStatusTheme(node.status).text
                    }}
                  />
                ))}
              </Box>
            </Paper>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ 
          p: 3, 
          bgcolor: '#f8fafc', 
          borderTop: '1px solid #e2e8f0',
          display: 'flex', 
          justifyContent: 'flex-end' 
        }}>
          <Button 
            variant="contained" 
            onClick={onClose}
            sx={{ 
              px: 4,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cerrar
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default NodeDetailsModal;